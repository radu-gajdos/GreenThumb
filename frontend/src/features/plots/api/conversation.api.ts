/**
 * conversation.api.ts - FIX URGENT
 * 
 * Fixed pentru a gestiona structura corectă de răspuns
 */

import http from '@/api/http';
import { ToastService } from '@/services/toast.service';
import { Message, ConversationSummary, CreateMessagePayload } from '../interfaces/conversation';

export class ConversationApi {
  private readonly basePath = '/ai/conversations';

  /**
   * Send message using database-backed conversation system
   */
  async sendMessageWithDetails(payload: CreateMessagePayload): Promise<{
    userMessage: Message;
    aiMessage: Message;
    aiResponse: string;
  }> {
    try {
      const response = await http.post(`${this.basePath}/message`, {
        plotId: payload.plotId,
        text: payload.text,
        language: payload.language,
      });

      let responseData;
      
      if (response.data?.data?.data) {
        responseData = response.data.data.data;
      } else if (response.data?.data) {
        responseData = response.data.data;
      } else if (response.data?.response && response.data?.conversation) {
        responseData = response.data;
      } else {
        throw new Error('Invalid response format from conversation API');
      }

      if (!responseData) {
        throw new Error('No response data received from API');
      }

      const conversationData = responseData.conversation;
      if (!conversationData) {
        throw new Error('Missing conversation data in API response');
      }

      const userMessage: Message = this.mapBackendMessageToFrontend(
        conversationData.userMessage, 
        payload.plotId
      );

      const aiMessage: Message = this.mapBackendMessageToFrontend(
        conversationData.aiMessage, 
        payload.plotId
      );

      return {
        userMessage,
        aiMessage,
        aiResponse: responseData.response || aiMessage.text,
      };
    } catch (error) {
      ToastService.error('Nu s-a putut trimite mesajul. Încercați din nou.');
      throw error;
    }
  }

  /**
   * Load conversation history from database
   */
  async getConversationHistory(plotId: string): Promise<Message[]> {
    try {
      const response = await http.get(`${this.basePath}/${plotId}/messages`);
      
      let messagesData;
      
      if (response.data?.data?.data?.data) {
        messagesData = response.data.data.data.data;
      } else if (response.data?.data?.data) {
        messagesData = response.data.data.data;
      } else if (response.data?.data) {
        messagesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        messagesData = response.data;
      } else {
        return [];
      }

      if (!messagesData) return [];

      if (!Array.isArray(messagesData) && messagesData.data && Array.isArray(messagesData.data)) {
        messagesData = messagesData.data;
      }

      if (!Array.isArray(messagesData)) return [];

      const frontendMessages = messagesData.map((msg: any, index: number) => {
        try {
          return this.mapBackendMessageToFrontend(msg, plotId);
        } catch (error) {
          return {
            id: `error-${index}-${Date.now()}`,
            text: 'Mesaj cu eroare la încărcare',
            sender: 'ai' as const,
            timestamp: new Date(),
            plotId: plotId,
          };
        }
      });

      return frontendMessages;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get conversation summaries from database
   */
  async getConversationSummaries(): Promise<ConversationSummary[]> {
    try {
      const response = await http.get(`${this.basePath}/summaries`);

      let summariesData;
      if (response.data?.data?.data) {
        summariesData = response.data.data.data;
      } else if (response.data?.data) {
        summariesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        summariesData = response.data;
      } else {
        return [];
      }

      if (!Array.isArray(summariesData)) {
        return [];
      }

      return summariesData.map((summary: any) =>
        this.mapBackendSummaryToFrontend(summary)
      );
    } catch (error) {
      return [];
    }
  }

  /**
   * Clear conversation history in database
   */
  async clearConversation(plotId: string): Promise<void> {
    try {
      await http.delete(`${this.basePath}/${plotId}`);
      ToastService.success('Conversația a fost ștearsă.');
    } catch (error) {
      ToastService.error('Nu s-a putut șterge conversația.');
      throw error;
    }
  }

  /**
   * Map backend message to frontend format with defensive checks
   */
  private mapBackendMessageToFrontend(backendMessage: any, plotId: string): Message {
    if (!backendMessage) {
      return {
        id: `fallback-${Date.now()}-${Math.random()}`,
        text: 'Mesaj fără conținut',
        sender: 'ai',
        timestamp: new Date(),
        plotId: plotId,
      };
    }

    let messageText = '';
    if (typeof backendMessage.content === 'string') {
      messageText = backendMessage.content;
    } else if (typeof backendMessage.text === 'string') {
      messageText = backendMessage.text;
    } else if (typeof backendMessage.message === 'string') {
      messageText = backendMessage.message;
    } else {
      messageText = 'Mesaj fără conținut valid';
    }

    let sender: 'user' | 'ai' = 'ai';
    if (backendMessage.sender === 'user' || backendMessage.sender === 'USER') {
      sender = 'user';
    } else if (backendMessage.sender === 'ai' || backendMessage.sender === 'AI' || backendMessage.sender === 'assistant') {
      sender = 'ai';
    }

    let timestamp = new Date();
    if (backendMessage.createdAt) {
      timestamp = new Date(backendMessage.createdAt);
    } else if (backendMessage.timestamp) {
      timestamp = new Date(backendMessage.timestamp);
    }

    return {
      id: backendMessage.id || `generated-${Date.now()}-${Math.random()}`,
      text: String(messageText),
      sender,
      timestamp,
      plotId,
    };
  }

  /**
   * Map backend summary to frontend format
   */
  private mapBackendSummaryToFrontend(backendSummary: any): ConversationSummary {
    return {
      plotId: backendSummary.plotId || '',
      plotName: backendSummary.plotName || 'Unknown Plot',
      messageCount: backendSummary.messageCount || 0,
      lastMessageAt: backendSummary.lastMessageAt ? new Date(backendSummary.lastMessageAt) : new Date(),
      lastMessagePreview: backendSummary.lastMessagePreview || 'Nicio conversație încă',
    };
  }

  // Legacy compatibility methods
  async sendMessage(payload: CreateMessagePayload): Promise<string> {
    const result = await this.sendMessageWithDetails(payload);
    return result.aiResponse;
  }

  async saveMessage(plotId: string, message: Omit<Message, 'id'>): Promise<Message> {
    return {
      ...message,
      id: `local-${Date.now()}-${message.sender}`,
      plotId,
    } as Message;
  }
}
