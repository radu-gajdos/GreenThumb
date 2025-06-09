/**
 * ChatContent.tsx - Final Version
 * 
 * Main chat interface using hybrid API
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BookMarked, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SaveMessageModal from '@/features/fieldNotes/components/SaveMessageModal';
import { ConversationApi } from '../../api/conversation.api';
import { PlotConversation, Message } from '../../interfaces/conversation';

interface ChatContentProps {
  conversation: PlotConversation | null;
  loading: boolean;
  onMessageSent: (plotId: string, userMessage: Message, aiMessage: Message) => void;
  onConversationCleared: (plotId: string) => void;
}

const WELCOME_MESSAGES = {
  ro: (plotName: string) =>
    `Bună ziua! Sunt asistentul tău agricol pentru parcela "${plotName}". Cum te pot ajuta astăzi cu gestionarea sau planificarea activităților pentru această parcelă?`,
  en: (plotName: string) =>
    `Hello! I'm your agricultural assistant for plot "${plotName}". How can I help you today with managing or planning activities for this plot?`,
} as const;

const ERROR_MESSAGES = {
  ro: 'Îmi pare rău, nu am putut procesa solicitarea. Te rog să încerci din nou.',
  en: 'Sorry, I couldn\'t process your request. Please try again.',
} as const;

const CONFIRM_MESSAGES = {
  ro: 'Ești sigur că dorești să ștergi istoricul conversației? Această acțiune nu poate fi anulată.',
  en: 'Are you sure you want to clear the chat history? This action cannot be undone.',
} as const;

const ChatContent: React.FC<ChatContentProps> = ({
  conversation,
  loading,
  onMessageSent,
  onConversationCleared,
}) => {
  const { t, i18n } = useTranslation();
  
  const [inputValue, setInputValue] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [messageToSave, setMessageToSave] = useState<Message | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationApi = useMemo(() => new ConversationApi(), []);
  const currentLanguage = i18n.language as keyof typeof WELCOME_MESSAGES;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const createMessage = (text: string, sender: 'user' | 'ai'): Message => ({
    id: `${Date.now()}-${sender}`,
    text,
    sender,
    timestamp: new Date(),
    plotId: conversation?.plotId,
  });

  const sendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || !conversation) return;

    setSendingMessage(true);
    setInputValue('');

    try {
      const result = await conversationApi.sendMessageWithDetails({
        plotId: conversation.plotId,
        text: trimmedInput,
        language: currentLanguage,
      });

      onMessageSent(conversation.plotId, result.userMessage, result.aiMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorText = ERROR_MESSAGES[currentLanguage] || ERROR_MESSAGES.en;
      const errorMessage = createMessage(errorText, 'ai');
      const userMessage = createMessage(trimmedInput, 'user');
      
      onMessageSent(conversation.plotId, userMessage, errorMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = async () => {
    if (!conversation) return;

    const confirmText = CONFIRM_MESSAGES[currentLanguage] || CONFIRM_MESSAGES.en;

    if (window.confirm(confirmText)) {
      try {
        await onConversationCleared(conversation.plotId);
      } catch (error) {
        console.error('Error clearing conversation:', error);
      }
    }
  };

  const handleSaveMessage = (message: Message) => {
    setMessageToSave(message);
    setShowSaveModal(true);
  };

  const handleFieldNoteSaved = () => {
    console.log('Field note saved successfully');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(currentLanguage, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selectați o parcelă
          </h3>
          <p className="text-gray-500 max-w-sm">
            Alegeți o parcelă din sidebar pentru a începe o conversație cu AI-ul despre gestionarea terenului.
          </p>
        </div>
      </div>
    );
  }

  const isInputDisabled = sendingMessage;
  const isSendDisabled = sendingMessage || !inputValue.trim();

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-sm">
              AI
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {conversation.plotName}
              </h3>
              <p className="text-sm text-gray-500">
                Asistent agricol • {conversation.messages.length} mesaje
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearConversation}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Șterge conversația
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {conversation.messages.length > 0 ? (
            <div className="space-y-4">
              {conversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="px-4 py-3">
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {/* Ultra-safe message rendering - no TypeScript errors */}
                        {String(message.text || 'Mesaj fără conținut')}
                      </div>
                    </div>

                    <div
                      className={`px-4 pb-3 flex items-center justify-between ${
                        message.sender === 'user'
                          ? 'text-primary/70'
                          : 'text-gray-500'
                      }`}
                    >
                      <div className="text-xs">{formatTime(message.timestamp)}</div>

                      {message.sender === 'ai' && (
                        <button
                          onClick={() => handleSaveMessage(message)}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary transition-all duration-200 px-2 py-1.5 rounded-md hover:bg-primary/10 group"
                          title="Salvează ca notiță"
                        >
                          <BookMarked className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          <span className="hidden sm:inline">Salvează</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm max-w-2xl mx-auto">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Bun venit la chat-ul pentru {conversation.plotName}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {WELCOME_MESSAGES[currentLanguage]?.(conversation.plotName) || 
                   WELCOME_MESSAGES.en(conversation.plotName)}
                </p>
              </div>
            </div>
          )}

          {sendingMessage && (
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2 items-center">
                <div
                  className="h-2 w-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="h-2 w-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="h-2 w-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              placeholder="Scrie mesajul tău aici..."
              disabled={isInputDisabled}
            />
            <button
              onClick={sendMessage}
              disabled={isSendDisabled}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
                isSendDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90 hover:scale-105 shadow-sm'
              }`}
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <SaveMessageModal
        showModal={showSaveModal}
        setShowModal={setShowSaveModal}
        messageText={messageToSave?.text || ''}
        plotId={conversation.plotId}
        onSave={handleFieldNoteSaved}
      />
    </div>
  );
};

export default ChatContent;