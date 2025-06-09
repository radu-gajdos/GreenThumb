import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';
import {
  SendMessageDto,
  CreateConversationDto,
  UpdateConversationDto,
  ConversationQueryDto,
} from '../dto/conversation.dto';

@Controller('ai/conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Body() body: {
    plotId: string;
    text: string;
    language?: string;
  }) {
    console.log('[CONTROLLER] Received message request:', body);
    
    const result = await this.conversationService.sendMessage({
      plotId: body.plotId,
      text: body.text,
      language: body.language || 'ro',
    });
    
    console.log('[CONTROLLER] Service response:', {
      userMessageId: result.userMessage?.id,
      aiMessageId: result.aiMessage?.id,
    });
    
    // FIX: Simple double nesting, not triple
    return {
      statusCode: 200,
      message: "Success",
      data: {
        response: result.aiMessage.content,
        conversation: {
          userMessage: {
            id: result.userMessage.id,
            content: result.userMessage.content,
            sender: result.userMessage.sender,
            createdAt: result.userMessage.createdAt,
          },
          aiMessage: {
            id: result.aiMessage.id,
            content: result.aiMessage.content,
            sender: result.aiMessage.sender,
            createdAt: result.aiMessage.createdAt,
          }
        }
      }
    };
  }

  @Get(':plotId/messages')
  async getConversationHistory(@Param('plotId') plotId: string) {
    console.log(`[CONTROLLER] Getting conversation history for plot: ${plotId}`);
    
    const messages = await this.conversationService.getConversationHistory(plotId);
    
    console.log(`[CONTROLLER] Found ${messages.length} messages for plot ${plotId}`);
    
    // FIX: Simple double nesting, not triple
    return {
      statusCode: 200,
      message: "Success",
      data: messages || [] // Direct array in data, not data.data
    };
  }

  @Get('summaries')
  async getConversationSummaries(@Query() query?: ConversationQueryDto) {
    console.log('[CONTROLLER] Getting conversation summaries with query:', query);
    
    const summaries = await this.conversationService.getConversationSummaries(query);
    
    console.log(`[CONTROLLER] Found ${summaries.length} summaries`);
    
    // FIX: Simple double nesting
    return {
      statusCode: 200,
      message: "Success",
      data: summaries || []
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createConversation(@Body() dto: CreateConversationDto) {
    console.log('[CONTROLLER] Creating new conversation:', dto);
    
    const conversation = await this.conversationService.createConversation(dto);
    
    return {
      statusCode: 201,
      message: "Conversation created successfully",
      data: conversation
    };
  }

  @Delete(':plotId')
  @HttpCode(HttpStatus.OK)
  async clearConversation(@Param('plotId') plotId: string) {
    console.log(`[CONTROLLER] Clearing conversation for plot: ${plotId}`);
    
    await this.conversationService.clearConversation(plotId);
    
    console.log(`[CONTROLLER] Successfully cleared conversation for plot: ${plotId}`);
    
    return {
      statusCode: 200,
      message: "Conversation cleared successfully",
      data: null
    };
  }

  @Get(':conversationId/details')
  async getConversationDetails(@Param('conversationId') conversationId: string) {
    console.log(`[CONTROLLER] Getting conversation details for: ${conversationId}`);
    
    const details = await this.conversationService.getConversationDetails(conversationId);
    
    return {
      statusCode: 200,
      message: "Success",
      data: details
    };
  }

  @Post(':conversationId/mark-read')
  @HttpCode(HttpStatus.OK)
  async markMessagesAsRead(@Param('conversationId') conversationId: string) {
    await this.conversationService.markMessagesAsRead(conversationId);
    
    return {
      statusCode: 200,
      message: "Messages marked as read",
      data: null
    };
  }
}