/**
 * ChatContent.tsx - Final Version with React Markdown and ModalDelete
 * 
 * Main chat interface using hybrid API with proper Markdown formatting
 * and modal delete confirmation
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BookMarked, BotMessageSquare, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import SaveMessageModal from '@/features/fieldNotes/components/SaveMessageModal';
import ModalDelete from '@/components/modals/ModalDelete';
import { ConversationApi } from '../../api/conversation.api';
import { PlotConversation, Message } from '../../interfaces/conversation';

interface ChatContentProps {
  conversation: PlotConversation | null;
  loading: boolean;
  onMessageSent: (plotId: string, userMessage: Message | null, aiMessage: Message | null) => void;
  onConversationCleared: (plotId: string) => void;
}

const WELCOME_MESSAGES = {
  ro: (plotName: string) =>
    `Bună ziua! Sunt asistentul tău agricol pentru parcela "${plotName}". Cum te pot ajuta astăzi cu gestionarea sau planificarea activităților pentru această parcelă?`,
  en: (plotName: string) =>
    `Hello! I'm your agricultural assistant for plot "${plotName}". How can I help you today with managing or planning activities for this plot?`,
  de: (plotName: string) =>
    `Hallo! Ich bin dein landwirtschaftlicher Assistent für das Feld "${plotName}". Wie kann ich dir heute bei der Verwaltung oder Planung von Aktivitäten für dieses Feld helfen?`,
} as const;

const ERROR_MESSAGES = {
  ro: 'Îmi pare rău, nu am putut procesa solicitarea. Te rog să încerci din nou.',
  en: 'Sorry, I couldn\'t process your request. Please try again.',
  de: 'Entschuldigung, ich konnte deine Anfrage nicht verarbeiten. Bitte versuche es erneut.',
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
    const userMessage = createMessage(trimmedInput, 'user');
    
    // Afișează imediat mesajul utilizatorului
    onMessageSent(conversation.plotId, userMessage, null);
    setInputValue('');

    try {
      const result = await conversationApi.sendMessageWithDetails({
        plotId: conversation.plotId,
        text: trimmedInput,
        language: currentLanguage,
      });

      // Actualizează doar cu răspunsul AI-ului (mesajul user este deja afișat)
      onMessageSent(conversation.plotId, null, result.aiMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorText = ERROR_MESSAGES[currentLanguage] || ERROR_MESSAGES.en;
      const errorMessage = createMessage(errorText, 'ai');
      
      onMessageSent(conversation.plotId, null, errorMessage);
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

  /**
   * Deschide modalul de confirmare pentru ștergerea conversației
   */
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  /**
   * Confirmă ștergerea conversației - apelează API-ul și notifică părinte
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!conversation) return;

    setIsDeleting(true);
    
    try {
      // Apelează API-ul pentru a șterge conversația
      await conversationApi.clearConversation(conversation.plotId);
      
      // Notifică componenta părinte că conversația a fost ștearsă
      onConversationCleared(conversation.plotId);
      
      console.log('Conversation cleared successfully');
    } catch (error) {
      console.error('Error clearing conversation:', error);
      
      // Opțional: afișează un toast de eroare
      const errorText = ERROR_MESSAGES[currentLanguage] || ERROR_MESSAGES.en;
      alert(`${t('chatContent.errors.deleteError')}: ${error instanceof Error ? error.message : errorText}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }, [conversation, conversationApi, onConversationCleared, currentLanguage, t]);

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

  // Custom markdown components for better styling
  const markdownComponents = {
    // Paragraphs
    p: ({ children }: any) => (
      <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
    ),
    
    // Bold text
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    
    // Italic text
    em: ({ children }: any) => (
      <em className="italic text-gray-800">{children}</em>
    ),
    
    // Inline code
    code: ({ children }: any) => (
      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 border">
        {children}
      </code>
    ),
    
    // Code blocks
    pre: ({ children }: any) => (
      <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto mb-3 border">
        {children}
      </pre>
    ),
    
    // Ordered lists
    ol: ({ children }: any) => (
      <ol className="list-decimal list-outside ml-6 mb-3 space-y-1">{children}</ol>
    ),
    
    // Unordered lists
    ul: ({ children }: any) => (
      <ul className="list-disc list-outside ml-6 mb-3 space-y-1">{children}</ul>
    ),
    
    // List items
    li: ({ children }: any) => (
      <li className="leading-relaxed pl-1">{children}</li>
    ),
    
    // Headings
    h1: ({ children }: any) => (
      <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg font-semibold mb-2 text-gray-900">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base font-semibold mb-2 text-gray-900">{children}</h3>
    ),
    
    // Blockquotes
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 py-2 mb-3 italic text-gray-700 bg-gray-50 rounded-r">
        {children}
      </blockquote>
    ),
    
    // Horizontal rules
    hr: () => (
      <hr className="border-gray-300 my-4" />
    ),
    
    // Links (if any)
    a: ({ href, children }: any) => (
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-800 underline" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
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
            {t('chatContent.noConversation.title')}
          </h3>
          <p className="text-gray-500 max-w-sm">
            {t('chatContent.noConversation.description')}
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
            <BotMessageSquare className='h-10 w-10'/>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {conversation.plotName}
              </h3>
              <p className="text-sm text-gray-500">
                {t('chatContent.header.assistant')} • {t('chatContent.header.messagesCount', { count: conversation.messages.length })}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={openDeleteModal}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {isDeleting ? t('chatContent.delete.deleting') : t('chatContent.delete.button')}
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
                    className={`max-w-[85%] rounded-lg shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="px-4 py-3">
                      {message.sender === 'user' ? (
                        // User messages - simple text formatting
                        <div className="leading-relaxed break-words whitespace-pre-wrap">
                          {String(message.text || t('chatContent.messages.noContent'))}
                        </div>
                      ) : (
                        // AI messages - full markdown formatting
                        <div className="prose prose-sm max-w-none leading-relaxed break-words">
                          <ReactMarkdown components={markdownComponents}>
                            {String(message.text || t('chatContent.messages.noContent'))}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    <div
                      className={`px-4 pb-2 flex items-center justify-between text-xs ${
                        message.sender === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-gray-500'
                      }`}
                    >
                      <div className="flex-shrink-0">{formatTime(message.timestamp)}</div>

                      {message.sender === 'ai' && (
                        <button
                          onClick={() => handleSaveMessage(message)}
                          className="flex items-center gap-1.5 ml-2 font-medium text-gray-600 hover:text-primary transition-all duration-200 px-2 py-1 rounded-md hover:bg-primary/10 group flex-shrink-0"
                          title={t('chatContent.messages.saveTooltip')}
                        >
                          <BookMarked className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          <span className="hidden sm:inline">{t('chatContent.messages.save')}</span>
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
                  {t('chatContent.welcome.title', { plotName: conversation.plotName })}
                </h3>
                <div className="text-gray-600 leading-relaxed">
                  <ReactMarkdown components={markdownComponents}>
                    {WELCOME_MESSAGES[currentLanguage]?.(conversation.plotName) || 
                     WELCOME_MESSAGES.en(conversation.plotName)}
                  </ReactMarkdown>
                </div>
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
              placeholder={t('chatContent.input.placeholder')}
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
              aria-label={t('chatContent.input.sendButton')}
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

      {/* Save Message Modal */}
      <SaveMessageModal
        showModal={showSaveModal}
        setShowModal={setShowSaveModal}
        messageText={messageToSave?.text || ''}
        plotId={conversation.plotId}
        onSave={handleFieldNoteSaved}
      />

      {/* Delete Conversation Modal */}
      <ModalDelete
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        confirmText={t('chatContent.delete.confirmText', { plotName: conversation.plotName })}
      />
    </div>
  );
};

export default ChatContent;