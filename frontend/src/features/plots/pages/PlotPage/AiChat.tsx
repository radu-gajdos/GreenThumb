/**
 * AIChat.tsx - Backend Integrated Version with Markdown Support
 *
 * A Claude-like chat interface for interacting with an AI assistant
 * about agricultural plot management with sliding window context.
 * Now uses backend database for message persistence and conversation memory.
 * Includes immediate message display and Markdown formatting.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plot } from '../../interfaces/plot';
import { BookMarked, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import SaveMessageModal from '@/features/fieldNotes/components/SaveMessageModal';
import { ConversationApi } from '../../api/conversation.api';
import { Message } from '../../interfaces/conversation';

interface AIChatProps {
  plot: Plot;
}

// Welcome messages localized by language
const WELCOME_MESSAGES = {
  ro: (plotName: string) =>
    `Bună ziua! Sunt asistentul tău agricol pentru parcela "${plotName}". Cum te pot ajuta astăzi cu gestionarea sau planificarea activităților pentru această parcelă?`,
  en: (plotName: string) =>
    `Hello! I'm your agricultural assistant for plot "${plotName}". How can I help you today with managing or planning activities for this plot?`,
} as const;

// Error messages localized by language
const ERROR_MESSAGES = {
  ro: 'Îmi pare rău, nu am putut procesa solicitarea. Te rog să încerci din nou.',
  en: 'Sorry, I couldn\'t process your request. Please try again.',
} as const;

// Confirmation prompts for clearing chat history
const CONFIRM_MESSAGES = {
  ro: 'Ești sigur că dorești să ștergi istoricul conversației? Această acțiune nu poate fi anulată.',
  en: 'Are you sure you want to clear the chat history? This action cannot be undone.',
} as const;

const AIChat: React.FC<AIChatProps> = ({ plot }) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [messageToSave, setMessageToSave] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoized Conversation API client instance
  const conversationApi = useMemo(() => new ConversationApi(), []);

  // Current language code, e.g. 'ro' or 'en'
  const currentLanguage = i18n.language as keyof typeof WELCOME_MESSAGES;

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

  /**
   * On mount (or when plot.id changes), load messages from backend database.
   * If none exist, initialize with a localized welcome message.
   */
  useEffect(() => {
    const loadConversationHistory = async () => {
      console.log(`[AICHAT] Loading conversation history for plot: ${plot.id}`);
      setInitialLoading(true);

      try {
        // Load messages from backend database
        const backendMessages = await conversationApi.getConversationHistory(plot.id);
        
        console.log(`[AICHAT] Loaded ${backendMessages.length} messages from backend`);

        if (backendMessages.length > 0) {
          setMessages(backendMessages);
        } else {
          // No messages in backend, check localStorage for migration
          await migrateFromLocalStorage();
        }
      } catch (error) {
        console.error('[AICHAT] Error loading conversation history:', error);
        // Fallback to localStorage if backend fails
        await migrateFromLocalStorage();
      } finally {
        setInitialLoading(false);
      }
    };

    loadConversationHistory();
  }, [plot.id, conversationApi]);

  /**
   * Migrate existing localStorage data to backend (one-time migration)
   */
  const migrateFromLocalStorage = async () => {
    const storageKey = `chat_${plot.id}`;
    const savedMessages = localStorage.getItem(storageKey);

    if (savedMessages) {
      try {
        console.log('[AICHAT] Found localStorage data, attempting migration...');
        const parsedMessages: Message[] = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          id: msg.id || `migrated-${Date.now()}-${Math.random()}`,
          timestamp: new Date(msg.timestamp),
          plotId: plot.id,
        }));

        // For now, just use the parsed messages
        // In a full implementation, you'd send these to backend
        setMessages(parsedMessages);
        
        console.log(`[AICHAT] Migrated ${parsedMessages.length} messages from localStorage`);
        
        // Clear localStorage after successful migration
        localStorage.removeItem(storageKey);
        
      } catch (error) {
        console.error('[AICHAT] Error parsing saved messages:', error);
        initializeChat();
      }
    } else {
      initializeChat();
    }
  };

  /**
   * Initialize chat with a welcome message from the AI.
   * Uses localized welcome text and the plot's name.
   */
  const initializeChat = () => {
    const welcomeGenerator =
      WELCOME_MESSAGES[currentLanguage] || WELCOME_MESSAGES.en;
    const welcomeText = welcomeGenerator(plot.name);

    const initialMessage: Message = {
      id: `welcome-${Date.now()}`,
      text: welcomeText,
      sender: 'ai',
      timestamp: new Date(),
      plotId: plot.id,
    };

    setMessages([initialMessage]);
  };

  /**
   * Auto-scroll the message container to bottom whenever new messages arrive.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /** Update inputValue as the user types */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  /**
   * Create a message object with proper typing
   */
  const createMessage = (text: string, sender: 'user' | 'ai'): Message => ({
    id: `${Date.now()}-${sender}`,
    text,
    sender,
    timestamp: new Date(),
    plotId: plot.id,
  });

  /**
   * Send the user's input to the AI API using backend conversation system:
   * 1. Show user message immediately
   * 2. Send message through ConversationApi (includes sliding window context)
   * 3. Backend automatically saves both user and AI messages
   * 4. Update local state with the AI response
   */
  const sendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    setLoading(true);
    
    // Create and show user message immediately
    const userMessage = createMessage(trimmedInput, 'user');
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      console.log(`[AICHAT] Sending message for plot ${plot.id}:`, trimmedInput);

      // Send message through backend conversation API
      // This automatically handles sliding window context and saves messages
      const result = await conversationApi.sendMessageWithDetails({
        plotId: plot.id,
        text: trimmedInput,
        language: currentLanguage,
      });

      console.log('[AICHAT] Received response:', result);

      // Add only the AI response (user message already shown)
      setMessages(prev => [...prev, result.aiMessage]);

    } catch (error) {
      console.error('[AICHAT] Error sending message:', error);
      
      // Create fallback error message
      const errorText = ERROR_MESSAGES[currentLanguage] || ERROR_MESSAGES.en;
      const errorMessage = createMessage(errorText, 'ai');

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  /** Send message on Enter key press (without Shift) */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /**
   * Clear chat history in backend database after user confirmation
   */
  const clearChat = async () => {
    const confirmText =
      CONFIRM_MESSAGES[currentLanguage] || CONFIRM_MESSAGES.en;

    if (window.confirm(confirmText)) {
      try {
        console.log(`[AICHAT] Clearing conversation for plot: ${plot.id}`);
        
        // Clear conversation in backend database
        await conversationApi.clearConversation(plot.id);
        
        // Reset local state
        setMessages([]);
        
        // Reinitialize with welcome message
        initializeChat();
        
        console.log('[AICHAT] Conversation cleared successfully');
      } catch (error) {
        console.error('[AICHAT] Error clearing conversation:', error);
        // Fallback to local clear
        setMessages([]);
        initializeChat();
      }
    }
  };

  /**
   * When the user clicks "Save" on an AI message, open the save-modal:
   * Store the chosen message in state for passing to the modal.
   */
  const handleSaveMessage = (message: Message) => {
    setMessageToSave(message);
    setShowSaveModal(true);
  };

  /** Callback after a field note has been saved successfully */
  const handleFieldNoteSaved = () => {
    console.log('[AICHAT] Field note saved successfully');
    // In the future, we could mark this message as "saved" in the UI
  };

  /** Format a Date object to localized HH:mm format */
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(currentLanguage, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show loading spinner during initial load
  if (initialLoading) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Disable input while loading an AI response
  const isInputDisabled = loading;
  // Disable send button if loading or input is empty
  const isSendDisabled = loading || !inputValue.trim();

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          {/* AI icon circle */}
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-sm">
            AI
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('plotPage.aiChat.title')}
            </h3>
            <p className="text-sm text-gray-500">
              {messages.length} {messages.length === 1 ? 'mesaj' : 'mesaje'}
            </p>
          </div>
        </div>
        
        {/* Clear chat history button */}
        <button
          onClick={clearChat}
          className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
          title={
            currentLanguage === 'ro'
              ? 'Șterge istoricul conversației'
              : 'Clear chat history'
          }
          aria-label="Clear chat history"
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-sm hidden sm:inline">
            {currentLanguage === 'ro' ? 'Șterge' : 'Clear'}
          </span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 flex-grow overflow-y-auto">
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {/* Message content */}
                  <div className="px-4 py-3">
                    {message.sender === 'user' ? (
                      // User messages - simple text formatting
                      <div className="leading-relaxed break-words whitespace-pre-wrap">
                        {String(message.text || 'Mesaj fără conținut')}
                      </div>
                    ) : (
                      // AI messages - full markdown formatting
                      <div className="prose prose-sm max-w-none leading-relaxed break-words">
                        <ReactMarkdown components={markdownComponents}>
                          {String(message.text || 'Mesaj fără conținut')}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Message footer: time + optional Save button */}
                  <div
                    className={`px-4 pb-2 flex items-center justify-between text-xs ${
                      message.sender === 'user'
                        ? 'text-primary-foreground/70'
                        : 'text-gray-500'
                    }`}
                  >
                    {/* Timestamp */}
                    <div className="flex-shrink-0">{formatTime(message.timestamp)}</div>

                    {/* Show "Save" button only on AI messages */}
                    {message.sender === 'ai' && (
                      <button
                        onClick={() => handleSaveMessage(message)}
                        className="flex items-center gap-1.5 ml-2 font-medium text-gray-600 hover:text-primary transition-all duration-200 px-2 py-1 rounded-md hover:bg-primary/10 group flex-shrink-0"
                        title={
                          currentLanguage === 'ro'
                            ? 'Salvează ca notiță'
                            : 'Save as note'
                        }
                        aria-label="Save message as field note"
                      >
                        <BookMarked className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">
                          {currentLanguage === 'ro' ? 'Salvează' : 'Save'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Anchor to scroll into view */}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  AI
                </div>
              </div>
              <div className="text-gray-500 text-center leading-relaxed">
                <ReactMarkdown components={markdownComponents}>
                  {t('plotPage.aiChat.placeholder')}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator (three bouncing dots) */}
        {loading && (
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

      {/* Input Area */}
      <div className="relative mt-auto">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
          placeholder={t('plotPage.aiChat.inputPlaceholder')}
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
          {/* Paper plane icon */}
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

      {/* Modal for saving an AI message as a field note */}
      <SaveMessageModal
        showModal={showSaveModal}
        setShowModal={setShowSaveModal}
        messageText={messageToSave?.text || ''}
        plotId={plot.id}
        onSave={handleFieldNoteSaved}
      />
    </div>
  );
};

export default AIChat;