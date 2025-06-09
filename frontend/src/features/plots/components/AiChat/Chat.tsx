/**
 * GeneralAIChat.tsx - Final Version
 * 
 * Main component for the general AI chat interface.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PlotApi } from '@/features/plots/api/plot.api';
import { Plot } from '@/features/plots/interfaces/plot';
import ChatSidebar from './ChatSidebar';
import ChatContent from './ChatContent';
import { ConversationApi } from '@/features/plots/api/conversation.api';
import { ConversationState, Message, PlotConversation } from '@/features/plots/interfaces/conversation';

const GeneralAIChat: React.FC = () => {
  const { t } = useTranslation();

  const [state, setState] = useState<ConversationState>({
    plotConversations: [],
    selectedPlotId: null,
    loading: true,
    error: null,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [availablePlots, setAvailablePlots] = useState<Plot[]>([]);

  const plotApi = useMemo(() => new PlotApi(), []);
  const conversationApi = useMemo(() => new ConversationApi(), []);

  /**
   * Load initial data with detailed logging
   */
  useEffect(() => {
    const loadInitialData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Load all plots
        const plots = await plotApi.findAll();
        setAvailablePlots(plots);

        if (plots.length === 0) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Nu aveți parcele create. Creați o parcelă pentru a începe conversații.',
          }));
          return;
        }

        // Create conversation objects for each plot
        const plotConversations: PlotConversation[] = await Promise.all(
          plots.map(async (plot) => {
            
            const messages = await conversationApi.getConversationHistory(plot.id);

            return {
              plotId: plot.id,
              plotName: plot.name,
              messages,
              lastMessageAt: messages.length > 0 
                ? new Date(Math.max(...messages.map(m => m.timestamp.getTime())))
                : new Date(),
              unreadCount: 0,
              isActive: false,
            };
          })
        );


        // Sort by last activity
        plotConversations.sort((a, b) => 
          b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
        );

        // Auto-select first conversation or one with messages
        const conversationWithMessages = plotConversations.find(conv => conv.messages.length > 0);
        const firstConversationId = conversationWithMessages?.plotId || 
                                   (plotConversations.length > 0 ? plotConversations[0].plotId : null);


        setState({
          plotConversations: plotConversations.map(conv => ({
            ...conv,
            isActive: conv.plotId === firstConversationId,
          })),
          selectedPlotId: firstConversationId,
          loading: false,
          error: null,
        });


      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Nu s-au putut încărca conversațiile. Verificați conexiunea.',
        }));
      }
    };

    loadInitialData();
  }, [plotApi, conversationApi]);

  /**
   * Handle plot selection
   */
  const handleSelectPlot = useCallback((plotId: string) => {
    setState(prev => ({
      ...prev,
      selectedPlotId: plotId,
      plotConversations: prev.plotConversations.map(conv => ({
        ...conv,
        isActive: conv.plotId === plotId,
        unreadCount: conv.plotId === plotId ? 0 : conv.unreadCount,
      })),
    }));
  }, []);

  /**
   * Handle new messages
   */
  const handleMessageSent = useCallback(async (plotId: string, userMessage: Message, aiMessage: Message) => {
    // Update UI immediately
    setState(prev => ({
      ...prev,
      plotConversations: prev.plotConversations.map(conv => {
        if (conv.plotId === plotId) {
          const newMessages = [...conv.messages, userMessage, aiMessage];
          return {
            ...conv,
            messages: newMessages,
            lastMessageAt: new Date(),
          };
        }
        return conv;
      }),
    }));
  }, []);

  /**
   * Handle conversation clearing
   */
  const handleConversationCleared = useCallback(async (plotId: string) => {
    try {
      await conversationApi.clearConversation(plotId);
      
      setState(prev => ({
        ...prev,
        plotConversations: prev.plotConversations.map(conv => {
          if (conv.plotId === plotId) {
            return {
              ...conv,
              messages: [],
              lastMessageAt: new Date(),
              unreadCount: 0,
            };
          }
          return conv;
        }),
      }));
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  }, [conversationApi]);

  /**
   * Handle starting new conversation
   */
  const handleStartNewConversation = useCallback(() => {
    const plotWithoutConversation = availablePlots.find(plot => 
      !state.plotConversations.some(conv => conv.plotId === plot.id)
    );

    if (plotWithoutConversation) {
      const newConversation: PlotConversation = {
        plotId: plotWithoutConversation.id,
        plotName: plotWithoutConversation.name,
        messages: [],
        lastMessageAt: new Date(),
        unreadCount: 0,
        isActive: true,
      };

      setState(prev => ({
        ...prev,
        plotConversations: [newConversation, ...prev.plotConversations],
        selectedPlotId: plotWithoutConversation.id,
      }));
    } else if (state.plotConversations.length > 0) {
      handleSelectPlot(state.plotConversations[0].plotId);
    }
  }, [availablePlots, state.plotConversations, handleSelectPlot]);

  const selectedConversation = useMemo(() => {
    return state.plotConversations.find(conv => conv.plotId === state.selectedPlotId) || null;
  }, [state.plotConversations, state.selectedPlotId]);

  // Loading state
  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-8">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-red-400 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Eroare la încărcarea conversațiilor
        </h3>
        <p className="text-gray-500 max-w-md mb-4">
          {state.error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Încearcă din nou
        </button>
      </div>
    );
  }

  // Empty state
  if (availablePlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-8">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nicio parcelă disponibilă
        </h3>
        <p className="text-gray-500 max-w-md">
          Nu aveți încă parcele create. Creați o parcelă pentru a începe conversații cu AI-ul.
        </p>
      </div>
    );
  }

  // Main UI
  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar
        conversations={state.plotConversations}
        selectedPlotId={state.selectedPlotId}
        searchTerm={searchTerm}
        loading={false}
        onSelectPlot={handleSelectPlot}
        onSearchChange={setSearchTerm}
        onStartNewConversation={handleStartNewConversation}
      />

      <ChatContent
        conversation={selectedConversation}
        loading={false}
        onMessageSent={handleMessageSent}
        onConversationCleared={handleConversationCleared}
      />
    </div>
  );
};

export default GeneralAIChat;