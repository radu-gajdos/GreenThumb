/**
 * ChatSidebar.tsx - Final Fixed Version
 *
 * Sidebar component for the general AI chat interface.
 * Fixed to handle both 'text' and 'content' message properties.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  MapPin,
  Circle,
  Search,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlotConversation } from '../../interfaces/conversation';

interface ChatSidebarProps {
  conversations: PlotConversation[];
  selectedPlotId: string | null;
  searchTerm: string;
  loading: boolean;
  onSelectPlot: (plotId: string) => void;
  onSearchChange: (term: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedPlotId,
  searchTerm,
  loading,
  onSelectPlot,
  onSearchChange,
}) => {
  const { t, i18n } = useTranslation();

  /**
   * Format the last message timestamp for display
   */
  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return t('chatSidebar.time.now');
    } else if (diffMinutes < 60) {
      return t('chatSidebar.time.minutes', { count: diffMinutes });
    } else if (diffHours < 24) {
      return t('chatSidebar.time.hours', { count: diffHours });
    } else if (diffDays === 1) {
      return t('chatSidebar.time.yesterday');
    } else if (diffDays < 7) {
      return t('chatSidebar.time.days', { count: diffDays });
    } else {
      return date.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'ro-RO', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  /**
   * Filter conversations based on search term
   */
  const filteredConversations = conversations.filter((conv) =>
    conv.plotName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Get the last message preview for a conversation
   * Handle both 'text' and 'content' properties + defensive programming
   */
  const getLastMessagePreview = (conversation: PlotConversation): string => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return t('chatSidebar.messages.noConversation');
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    
    if (!lastMessage) {
      return t('chatSidebar.messages.noConversation');
    }
    
    // Handle both text and content properties + defensive programming
    let messageText = lastMessage.text || (lastMessage as any).content || '';
    
    // If messageText is an object, try to extract string from it
    if (typeof messageText === 'object' && messageText !== null) {
      if ((messageText as any).result && typeof (messageText as any).result === 'string') {
        messageText = (messageText as any).result;
      } else {
        console.warn('Message text is an object:', messageText);
        messageText = t('chatSidebar.messages.invalidFormat');
      }
    }
    
    // Ensure we have a string
    if (typeof messageText !== 'string') {
      console.warn('Message text is not a string:', messageText, typeof messageText);
      return t('chatSidebar.messages.invalidContent');
    }
    
    if (!messageText) {
      return t('chatSidebar.messages.noContent');
    }
    
    const maxLength = 60;
    
    if (messageText.length <= maxLength) {
      return messageText;
    }
    
    return messageText.substring(0, maxLength).trim() + '...';
  };

  /**
   * Safely get message text from a message object
   */
  const getMessageText = (message: any): string => {
    return message?.text || message?.content || '';
  };

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900 mb-3">
          {t('chatSidebar.header.title')}
        </h1>
        
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={t('chatSidebar.search.placeholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              {searchTerm 
                ? t('chatSidebar.empty.noResults')
                : t('chatSidebar.empty.noConversations')
              }
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => {
              const isSelected = conversation.plotId === selectedPlotId;
              const hasMessages = conversation.messages && conversation.messages.length > 0;
              const hasUnread = conversation.unreadCount > 0;

              return (
                <button
                  key={conversation.plotId}
                  onClick={() => onSelectPlot(conversation.plotId)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Plot Icon */}
                    <div className={`flex-shrink-0 mt-1 ${
                      isSelected ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      <MapPin className="w-5 h-5" />
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      {/* Plot Name & Timestamp */}
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium text-sm truncate ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {conversation.plotName}
                        </h3>
                        
                        {hasMessages && (
                          <span className="text-xs text-gray-500 ml-2">
                            {formatLastActivity(conversation.lastMessageAt)}
                          </span>
                        )}
                      </div>

                      {/* Last Message Preview */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600 truncate flex-1">
                          {getLastMessagePreview(conversation)}
                        </p>

                        {/* Unread Badge */}
                        {hasUnread && (
                          <div className="flex-shrink-0 ml-2">
                            <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Activity Indicator */}
                      {hasMessages && (
                        <div className="flex items-center mt-1">
                          <Circle className={`w-2 h-2 mr-1 ${
                            conversation.messages.length > 0 
                              ? 'text-green-500 fill-current' 
                              : 'text-gray-300'
                          }`} />
                          <span className="text-xs text-gray-500">
                            {t('chatSidebar.conversation.messagesCount', { count: conversation.messages.length })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          {t('chatSidebar.footer.conversationsCount', { 
            count: conversations.length 
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;