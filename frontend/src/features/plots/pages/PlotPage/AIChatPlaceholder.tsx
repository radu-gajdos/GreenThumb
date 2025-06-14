import React from 'react';
import { useTranslation } from 'react-i18next';

const AIChatPlaceholder: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          AI
        </div>
        <h3 className="ml-3 text-lg font-semibold">{t('aiChatPlaceholder.title')}</h3>
      </div>
      
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 h-[calc(100%-8rem)]">
        <p className="text-gray-500">{t('aiChatPlaceholder.messagesPlaceholder')}</p>
      </div>
      
      <div className="relative">
        <input 
          type="text" 
          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('aiChatPlaceholder.inputPlaceholder')}
        />
        <button 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
          aria-label={t('aiChatPlaceholder.sendButton')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIChatPlaceholder;