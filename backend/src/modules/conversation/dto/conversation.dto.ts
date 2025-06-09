/**
 * conversation.dto.ts - COMPLET
 * 
 * Data Transfer Objects for conversation endpoints
 */

import { IsString, IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';
import { Message, MessageSender } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';

export class SendMessageDto {
  @IsString()
  plotId: string;

  @IsString()
  text: string;

  @IsString()
  @IsOptional()
  language?: string;
}

export class CreateConversationDto {
  @IsString()
  plotId: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  language?: string;
}

export class UpdateConversationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ConversationQueryDto {
  @IsString()
  @IsOptional()
  plotId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  language?: string;
}

export class MessageDto {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  isSavedAsFieldNote: boolean;
  fieldNoteId?: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(message: Message): MessageDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      sender: message.sender,
      content: message.content,
      metadata: message.metadata,
      isRead: message.isRead,
      isSavedAsFieldNote: message.isSavedAsFieldNote,
      fieldNoteId: message.fieldNoteId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}

export class ConversationSummaryDto {
  plotId: string;
  plotName: string;
  conversationId: string;
  title: string;
  language: string;
  messageCount: number;
  lastMessageAt: Date;
  lastMessagePreview: string;
  isActive: boolean;
  unreadCount: number;

  static fromEntity(conversation: Conversation): ConversationSummaryDto {
    const unreadMessages = conversation.messages?.filter(msg => !msg.isRead) || [];
    
    return {
      plotId: conversation.plotId,
      plotName: conversation.plot?.name || 'Unknown Plot',
      conversationId: conversation.id,
      title: conversation.title,
      language: conversation.language,
      messageCount: conversation.messageCount,
      lastMessageAt: conversation.lastMessageAt || conversation.createdAt,
      lastMessagePreview: conversation.getLastMessagePreview(),
      isActive: conversation.isActive,
      unreadCount: unreadMessages.length,
    };
  }
}

export class ConversationDetailsDto {
  id: string;
  plotId: string;
  plotName: string;
  title: string;
  language: string;
  isActive: boolean;
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  messages: MessageDto[];

  static fromEntity(conversation: Conversation): ConversationDetailsDto {
    return {
      id: conversation.id,
      plotId: conversation.plotId,
      plotName: conversation.plot?.name || 'Unknown Plot',
      title: conversation.title,
      language: conversation.language,
      isActive: conversation.isActive,
      messageCount: conversation.messageCount,
      lastMessageAt: conversation.lastMessageAt || conversation.createdAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: conversation.messages?.map(MessageDto.fromEntity) || [],
    };
  }
}

export class AiMessageResponseDto {
  userMessage: Message;
  aiMessage: Message;
  processingTimeMs: number;
  model: string;
  contextMessagesUsed?: number;

  static create(
    userMessage: Message,
    aiMessage: Message,
    processingTimeMs: number,
    model: string = 'gpt-3.5-turbo',
    contextMessagesUsed?: number
  ): AiMessageResponseDto {
    return {
      userMessage,
      aiMessage,
      processingTimeMs,
      model,
      contextMessagesUsed,
    };
  }
}