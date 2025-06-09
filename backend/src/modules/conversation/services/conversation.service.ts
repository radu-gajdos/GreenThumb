import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { Message, MessageSender } from '../entities/message.entity';
import { Plot } from '../../plot/entities/plot.entity';
import { AiService } from '../../ai/services/ai.service';
import {
  SendMessageDto,
  CreateConversationDto,
  UpdateConversationDto,
  ConversationSummaryDto,
  ConversationDetailsDto,
  AiMessageResponseDto,
  ConversationQueryDto,
} from '../dto/conversation.dto';

interface ConversationMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

/**
 * ConversationService
 * 
 * Manages AI conversations for agricultural plots.
 * Handles message persistence, conversation lifecycle, and AI integration.
 */
@Injectable()
export class ConversationService {
  private readonly CONTEXT_WINDOW_SIZE = 6; // Last 6 messages for context

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Plot)
    private readonly plotRepository: Repository<Plot>,
    private readonly aiService: AiService,
  ) {}

  /**
   * Send a message and get AI response WITH conversation context
   * This is the main method used by the chat interface
   */
  async sendMessage(dto: SendMessageDto): Promise<AiMessageResponseDto> {
    const startTime = Date.now();

    // Find or create conversation for this plot
    let conversation = await this.findOrCreateConversation(dto.plotId, dto.language);

    // Get conversation history for AI context (BEFORE saving the new message)
    const conversationHistory = await this.getConversationContext(conversation.id);
    console.log(`[DB] Using ${conversationHistory.length} messages as context for AI`);

    // Save user message
    const userMessage = await this.saveMessage(conversation.id, {
      sender: MessageSender.USER,
      content: dto.text,
    });

    // Generate AI response using conversation context
    const aiResponseContent = await this.aiService.getAIResponseForPlot({
      query: dto.text,
      plotId: dto.plotId,
      language: dto.language,
      conversationHistory: conversationHistory, // Pass conversation context to AI
    });

    // Save AI response message
    const aiMessage = await this.saveMessage(conversation.id, {
      sender: MessageSender.AI,
      content: aiResponseContent,
      metadata: {
        model: 'gpt-3.5-turbo',
        processingTimeMs: Date.now() - startTime,
        userQuery: dto.text,
        contextMessagesUsed: conversationHistory.length,
      },
    });

    // Update conversation metadata
    await this.updateConversationMetadata(conversation.id);

    return AiMessageResponseDto.create(
      userMessage,
      aiMessage,
      Date.now() - startTime,
      'gpt-3.5-turbo'
    );
  }

  /**
   * Get conversation context for AI (sliding window of recent messages)
   */
  private async getConversationContext(conversationId: string): Promise<ConversationMessage[]> {
    try {
      // Get the last N messages from database for context
      const recentMessages = await this.messageRepository.find({
        where: { conversationId },
        order: { createdAt: 'DESC' },
        take: this.CONTEXT_WINDOW_SIZE,
      });

      // Reverse to chronological order (oldest first)
      recentMessages.reverse();

      // Convert to format expected by AI service
      const contextMessages: ConversationMessage[] = recentMessages.map(msg => ({
        sender: msg.sender === MessageSender.USER ? 'user' : 'ai',
        text: msg.content,
        timestamp: msg.createdAt.toISOString(),
      }));

      console.log('[DB] Conversation context loaded:', contextMessages.length, 'messages');
      return contextMessages;
    } catch (error) {
      console.error('[DB] Error loading conversation context:', error);
      return []; // Return empty context if there's an error
    }
  }

  /**
   * Get conversation history for a specific plot
   */
  async getConversationHistory(plotId: string): Promise<Message[]> {
    const conversation = await this.conversationRepository.findOne({
      where: { plotId, isActive: true },
      relations: ['messages'],
      order: { messages: { createdAt: 'ASC' } },
    });

    if (!conversation) {
      return []; // Return empty array if no conversation exists
    }

    return conversation.messages || [];
  }

  /**
   * Get conversation summaries for sidebar display
   */
  async getConversationSummaries(query?: ConversationQueryDto): Promise<ConversationSummaryDto[]> {
    const findOptions: FindManyOptions<Conversation> = {
      relations: ['plot', 'messages'],
      order: { lastMessageAt: 'DESC' },
    };

    // Build where clause based on query filters
    const where: any = {};
    
    if (query?.plotId) {
      where.plotId = query.plotId;
    }
    
    if (query?.isActive !== undefined) {
      where.isActive = query.isActive;
    }
    
    if (query?.language) {
      where.language = query.language;
    }

    // Handle search in plot name or conversation title
    if (query?.search) {
      findOptions.where = [
        { ...where, title: Like(`%${query.search}%`) },
        { ...where, plot: { name: Like(`%${query.search}%`) } },
      ];
    } else {
      findOptions.where = where;
    }

    const conversations = await this.conversationRepository.find(findOptions);

    return conversations.map(ConversationSummaryDto.fromEntity);
  }

  /**
   * Get full conversation details
   */
  async getConversationDetails(conversationId: string): Promise<ConversationDetailsDto> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['plot', 'messages'],
      order: { messages: { createdAt: 'ASC' } },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    return ConversationDetailsDto.fromEntity(conversation);
  }

  /**
   * Clear conversation history (delete all messages)
   */
  async clearConversation(plotId: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { plotId, isActive: true },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new NotFoundException(`No active conversation found for plot ${plotId}`);
    }

    // Delete all messages
    await this.messageRepository.delete({ conversationId: conversation.id });

    // Reset conversation metadata
    conversation.messageCount = 0;
    conversation.lastMessageAt = new Date();
    await this.conversationRepository.save(conversation);
  }

  /**
   * Create a new conversation manually
   */
  async createConversation(dto: CreateConversationDto): Promise<ConversationDetailsDto> {
    // Verify plot exists
    const plot = await this.plotRepository.findOne({ where: { id: dto.plotId } });
    if (!plot) {
      throw new NotFoundException(`Plot with ID ${dto.plotId} not found`);
    }

    // Check if active conversation already exists
    const existingConversation = await this.conversationRepository.findOne({
      where: { plotId: dto.plotId, isActive: true },
    });

    if (existingConversation) {
      throw new BadRequestException(`Active conversation already exists for plot ${dto.plotId}`);
    }

    const conversation = this.conversationRepository.create({
      plotId: dto.plotId,
      title: dto.title || `Conversație pentru ${plot.name}`,
      language: dto.language || 'ro',
      isActive: true,
      messageCount: 0,
    });

    const savedConversation = await this.conversationRepository.save(conversation);

    return this.getConversationDetails(savedConversation.id);
  }

  /**
   * Update conversation settings
   */
  async updateConversation(
    conversationId: string,
    dto: UpdateConversationDto
  ): Promise<ConversationDetailsDto> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    Object.assign(conversation, dto);
    await this.conversationRepository.save(conversation);

    return this.getConversationDetails(conversationId);
  }

  /**
   * Archive/deactivate a conversation
   */
  async archiveConversation(conversationId: string): Promise<void> {
    await this.updateConversation(conversationId, { isActive: false });
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string): Promise<void> {
    await this.messageRepository.update(
      { conversationId, isRead: false },
      { isRead: true }
    );
  }

  /**
   * Find or create conversation for a plot
   * Private helper method
   */
  private async findOrCreateConversation(plotId: string, language: string = 'ro'): Promise<Conversation> {
    // Try to find existing active conversation
    let conversation = await this.conversationRepository.findOne({
      where: { plotId, isActive: true },
    });

    if (!conversation) {
      // Verify plot exists
      const plot = await this.plotRepository.findOne({ where: { id: plotId } });
      if (!plot) {
        throw new NotFoundException(`Plot with ID ${plotId} not found`);
      }

      // Create new conversation
      conversation = this.conversationRepository.create({
        plotId,
        title: `Conversație pentru ${plot.name}`,
        language,
        isActive: true,
        messageCount: 0,
      });

      conversation = await this.conversationRepository.save(conversation);
    }

    return conversation;
  }

  /**
   * Save a message to the conversation
   * Private helper method
   */
  private async saveMessage(
    conversationId: string,
    messageData: {
      sender: MessageSender;
      content: string;
      metadata?: Record<string, any>;
    }
  ): Promise<Message> {
    const message = this.messageRepository.create({
      conversationId,
      sender: messageData.sender,
      content: messageData.content,
      metadata: messageData.metadata,
      isRead: messageData.sender === MessageSender.USER, // Auto-mark user messages as read
    });

    return await this.messageRepository.save(message);
  }

  /**
   * Update conversation metadata after adding messages
   * Private helper method
   */
  private async updateConversationMetadata(conversationId: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['messages'],
    });

    if (conversation) {
      conversation.updateMetadata();
      await this.conversationRepository.save(conversation);
    }
  }
}