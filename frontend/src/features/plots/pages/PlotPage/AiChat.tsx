/**
 * AIChat.tsx
 *
 * A Claude-like chat interface for interacting with an AI assistant
 * about agricultural plot management.  
 * Think of this as a smart notepad that remembers your conversations
 * and can give farming advice specific to your plot.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plot } from '../../interfaces/plot';
import AiApi from '../../api/ai.api';
import { BookMarked } from 'lucide-react';
import SaveMessageModal from '@/features/fieldNotes/components/SaveMessageModal';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [messageToSave, setMessageToSave] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoized AI API client instance
  const aiApi = useMemo(() => new AiApi(), []);

  // Current language code, e.g. 'ro' or 'en'
  const currentLanguage = i18n.language as keyof typeof WELCOME_MESSAGES;
  // Key for saving chat history in localStorage
  const storageKey = `chat_${plot.id}`;

  /**
   * On mount (or when plot.id changes), load saved messages from localStorage.
   * If none exist or parsing fails, initialize with a localized welcome message.
   */
  useEffect(() => {
    const savedMessages = localStorage.getItem(storageKey);

    if (savedMessages) {
      try {
        const parsedMessages: Message[] = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
        initializeChat();
      }
    } else {
      initializeChat();
    }
  }, [plot.id]);

  /**
   * Initialize chat with a welcome message from the AI.
   * Uses localized welcome text and the plot’s name.
   */
  const initializeChat = () => {
    const welcomeGenerator =
      WELCOME_MESSAGES[currentLanguage] || WELCOME_MESSAGES.en;
    const welcomeText = welcomeGenerator(plot.name);

    const initialMessage: Message = {
      id: Date.now().toString(),
      text: welcomeText,
      sender: 'ai',
      timestamp: new Date(),
    };

    setMessages([initialMessage]);
  };

  /**
   * Whenever `messages` changes, persist them to localStorage.
   * Uses JSON.stringify; note that Date objects become strings here.
   */
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

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

  /** Create a new Message object with unique ID and current timestamp */
  const createMessage = (text: string, sender: 'user' | 'ai'): Message => ({
    id: `${Date.now()}-${sender}`,
    text,
    sender,
    timestamp: new Date(),
  });

  /** Append a new message to the conversation state */
  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  /**
   * Send the user’s input to the AI API:
   * 1. Append the user’s message to state
   * 2. Call aiApi.query() to get AI response
   * 3. Append the AI response or localized error message
   */
  const sendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    // Add user message
    const userMessage = createMessage(trimmedInput, 'user');
    addMessage(userMessage);
    setInputValue('');
    setLoading(true);

    try {
      const result = await aiApi.query(plot.id, trimmedInput, currentLanguage);
      const aiMessage = createMessage(result, 'ai');
      addMessage(aiMessage);
    } catch (error) {
      // Use a localized error text if AI call fails
      const errorText =
        ERROR_MESSAGES[currentLanguage] || ERROR_MESSAGES.en;
      const errorMessage = createMessage(errorText, 'ai');
      addMessage(errorMessage);
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
   * Clear chat history after user confirmation:
   * - Prompt with localized confirmation
   * - Remove from localStorage and reinitialize
   */
  const clearChat = () => {
    const confirmText =
      CONFIRM_MESSAGES[currentLanguage] || CONFIRM_MESSAGES.en;

    if (window.confirm(confirmText)) {
      localStorage.removeItem(storageKey);
      initializeChat();
    }
  };

  /**
   * When the user clicks “Save” on an AI message, open the save-modal:
   * Store the chosen message in state for passing to the modal.
   */
  const handleSaveMessage = (message: Message) => {
    setMessageToSave(message);
    setShowSaveModal(true);
  };

  /** Callback after a field note has been saved successfully */
  const handleFieldNoteSaved = () => {
    console.log('Field note saved successfully');
    // In the future, we could mark this message as “saved” in the UI.
  };

  /** Format a Date object to localized HH:mm format */
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(currentLanguage, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
          <h3 className="ml-3 text-lg font-semibold text-gray-900">
            {t('plotPage.aiChat.title')}
          </h3>
        </div>
        {/* Clear chat history button */}
        <button
          onClick={clearChat}
          className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
          title={
            currentLanguage === 'ro'
              ? 'Șterge istoricul conversației'
              : 'Clear chat history'
          }
          aria-label="Clear chat history"
        >
          {/* Trash icon */}
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
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
                  className={`max-w-[80%] rounded-lg shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {/* Message content */}
                  <div className="px-4 py-3">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.text}
                    </div>
                  </div>

                  {/* Message footer: time + optional Save button */}
                  <div
                    className={`px-4 pb-3 flex items-center justify-between ${
                      message.sender === 'user'
                        ? 'text-primary/70'
                        : 'text-gray-500'
                    }`}
                  >
                    {/* Timestamp */}
                    <div className="text-xs">{formatTime(message.timestamp)}</div>

                    {/* Show “Save” button only on AI messages */}
                    {message.sender === 'ai' && (
                      <button
                        onClick={() => handleSaveMessage(message)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary transition-all duration-200 px-2 py-1.5 rounded-md hover:bg-primary/10 group"
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
            <p className="text-gray-500 text-center">
              {t('plotPage.aiChat.placeholder')}
            </p>
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
