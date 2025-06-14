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

  useEffect(() => {
    const loadInitialData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const plots = await plotApi.findAll();
        setAvailablePlots(plots);

        if (plots.length === 0) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: t('generalAIChat.noPlots'),
          }));
          return;
        }

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

        plotConversations.sort((a, b) =>
          b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
        );

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
          error: t('generalAIChat.loadError'),
        }));
      }
    };

    loadInitialData();
  }, [plotApi, conversationApi, t]);

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

  const handleMessageSent = useCallback(async (plotId: string, userMessage: Message | null, aiMessage: Message | null) => {
    setState(prev => ({
      ...prev,
      plotConversations: prev.plotConversations.map(conv => {
        if (conv.plotId === plotId) {
          const newMessages = [...conv.messages];
          if (userMessage) newMessages.push(userMessage);
          if (aiMessage) newMessages.push(aiMessage);
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

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('generalAIChat.errorTitle')}
        </h3>
        <p className="text-gray-500 max-w-md mb-4">
          {state.error}
        </p>
        <button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/80 text-white font-bold py-2 px-4 rounded">
          {t('generalAIChat.retry')}
        </button>
      </div>
    );
  }

  if (availablePlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('generalAIChat.noPlotsTitle')}
        </h3>
        <p className="text-gray-500 max-w-md">
          {t('generalAIChat.noPlotsDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <ChatSidebar
        conversations={state.plotConversations}
        selectedPlotId={state.selectedPlotId}
        searchTerm={searchTerm}
        loading={false}
        onSelectPlot={handleSelectPlot}
        onSearchChange={setSearchTerm}
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