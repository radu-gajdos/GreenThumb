/**
 * conversation.ts
 *
 * Domain interfaces for the general AI chat feature.
 * These represent the core entities in our conversation system.
 */

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  plotId?: string; // Optional: which plot this message relates to
}

export interface PlotConversation {
  plotId: string;
  plotName: string;
  messages: Message[];
  lastMessageAt: Date;
  unreadCount: number;
  isActive: boolean; // Whether this conversation is currently selected
}

export interface ConversationState {
  plotConversations: PlotConversation[];
  selectedPlotId: string | null;
  loading: boolean;
  error: string | null;
}

export interface CreateMessagePayload {
  plotId: string;
  text: string;
  language: string;
}

export interface ConversationSummary {
  plotId: string;
  plotName: string;
  messageCount: number;
  lastMessageAt: Date;
  lastMessagePreview?: string;
}