// src/components/plots/AIChat.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plot } from '../../interfaces/plot';
import AiApi from '../../api/ai.api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatProps {
  plot: Plot;
}

/**
 * AI Chat component that displays a conversation interface for interacting
 * with an AI assistant about agricultural plot management.
 */
const AIChat: React.FC<AIChatProps> = ({ plot }) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiApi = useMemo(() => new AiApi(), []);
  
  // Load chat history from localStorage or initialize with welcome message
  useEffect(() => {
    const storageKey = `chat_${plot.id}`;
    const savedMessages = localStorage.getItem(storageKey);
    
    if (savedMessages) {
      try {
        // Parse saved messages, converting string dates back to Date objects
        const parsedMessages: Message[] = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
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
  
  // Initialize chat with welcome message
  const initializeChat = () => {
    const currentLanguage = i18n.language;
    const welcomeMessage = currentLanguage === 'ro' 
      ? `Bună ziua! Sunt asistentul tău agricol pentru parcela "${plot.name}". Cum te pot ajuta astăzi cu gestionarea sau planificarea activităților pentru această parcelă?`
      : `Hello! I'm your agricultural assistant for plot "${plot.name}". How can I help you today with managing or planning activities for this plot?`;
    
    const initialMessage: Message = {
      id: Date.now().toString(),
      text: welcomeMessage,
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
  };
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_${plot.id}`, JSON.stringify(messages));
    }
  }, [messages, plot.id]);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const sendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setLoading(true);
    
    try {
      // Call the AI API through our service
      const result = await aiApi.query(
        plot.id,
        userMessage.text,
        i18n.language
      );
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      // Error is already logged and displayed via toast in the API service
      // Just add a message in the chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: i18n.language === 'ro' 
          ? 'Îmi pare rău, nu am putut procesa solicitarea. Te rog să încerci din nou.'
          : 'Sorry, I couldn\'t process your request. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Clear chat history
  const clearChat = () => {
    const confirmMessage = i18n.language === 'ro'
      ? 'Ești sigur că dorești să ștergi istoricul conversației? Această acțiune nu poate fi anulată.'
      : 'Are you sure you want to clear the chat history? This action cannot be undone.';
      
    if (window.confirm(confirmMessage)) {
      localStorage.removeItem(`chat_${plot.id}`);
      initializeChat();
    }
  };

  // Format date to localized time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(i18n.language, { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            AI
          </div>
          <h3 className="ml-3 text-lg font-semibold">{t('plotPage.aiChat.title')}</h3>
        </div>
        <button 
          onClick={clearChat}
          className="text-gray-500 hover:text-red-500 transition-colors"
          title={i18n.language === 'ro' ? 'Șterge istoricul conversației' : 'Clear chat history'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 flex-grow overflow-y-auto">
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  <div className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <p className="text-gray-500">{t('plotPage.aiChat.placeholder')}</p>
        )}
        
        {loading && (
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2 items-center">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="relative mt-auto">
        <input 
          type="text" 
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('plotPage.aiChat.inputPlaceholder')}
          disabled={loading}
        />
        <button 
          onClick={sendMessage}
          disabled={loading || inputValue.trim() === ''}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full 
            ${(loading || inputValue.trim() === '') 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIChat;