import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import {
  ProviderInfo,
  ChatModeInfo,
  ComposeChatResponse,
  CreateSessionResponse,
} from '@repo/shared-types';

import { apiClient } from '../services/api';
import { getRandomEl } from '../utils';
import { SelectedBot, UpdateBotData } from '../types';
import { useChatStore } from './chatStore';

interface ComposeChatState {
  loading: boolean;
  error: string;

  // Available data from backend
  availableModes: ChatModeInfo[];
  availableProviders: ProviderInfo[];

  // User selections
  selectedChatMode: ChatModeInfo | null;
  selectedBots: SelectedBot[];

  // Actions
  loadComposeChatData: () => Promise<void>;
  startNewChat: () => Promise<string>;
  selectChatMode: (mode: string) => void;
  addNewBot: () => void;
  removeBot: (botId: string) => void;
  updateBot: (botData: UpdateBotData) => void;
  clearError: () => void;
}

export const useComposeChatStore = create<ComposeChatState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    loading: false,
    error: '',
    availableModes: [],
    availableProviders: [],
    selectedChatMode: null,
    selectedBots: [],

    loadComposeChatData: async (): Promise<void> => {
      const state = get();

      // If we already have state use it instead
      if (
        state.availableModes.length > 0 &&
        state.availableProviders.length > 0
      ) {
        return;
      }

      try {
        set({ loading: true, error: '' });

        const response =
          await apiClient.get<ComposeChatResponse>('/chat/compose');
        const { availableModes, availableProviders } = response.data;

        set({
          loading: false,
          error: '',
          selectedChatMode: availableModes[0],
          availableModes,
          availableProviders,
          selectedBots: [],
        });

        // Auto-populate with one default bot after data is loaded
        get().addNewBot();
      } catch (error) {
        set({
          loading: false,
          error: 'Failed to prepare chat data',
        });

        throw error;
      }
    },

    startNewChat: async (): Promise<string> => {
      const state = get();

      // At least one bot must be selected
      if (!state.selectedBots.length) {
        return '';
      }

      try {
        set({ loading: true, error: '' });

        const response = await apiClient.post<CreateSessionResponse>(
          '/chat/session',
          {
            // do not send botId to the backend, it's only for frontend identification
            selectedBots: state.selectedBots.map(({ botId, ...bot }) => bot),
            modeId: state.selectedChatMode?.modeId,
          }
        );
        const { sessionId } = response.data;

        useChatStore.getState().setChatSessionId(sessionId);

        return sessionId;
      } catch (error) {
        set({
          loading: false,
          error: 'Failed to start new chat',
        });

        throw error;
      }
    },

    selectChatMode: (mode: string) => {
      const state = get();

      const selectedModeInfo = state.availableModes.find(
        availableMode => availableMode.modeId === mode
      );

      if (!selectedModeInfo) {
        set({ error: 'Invalid chat mode selected' });
        return;
      }

      // Clear selected bots when changing mode (since bot limits might change)
      set({
        selectedChatMode: selectedModeInfo,
        selectedBots: [],
        error: '',
      });
    },

    // Add new bot with default config to selections
    addNewBot: () => {
      const state = get();

      if (
        state.selectedChatMode &&
        state.selectedBots.length >= state.selectedChatMode.maxBots
      ) {
        return;
      }

      const availableProviderIds = state.availableProviders.map(
        provider => provider.providerId
      );
      const providerId = getRandomEl(availableProviderIds);
      const availableModels = state.availableProviders.find(
        provider => provider.providerId === providerId
      )?.botsList as string[];
      const modelId = getRandomEl(availableModels);

      const selectedBot: SelectedBot = {
        providerId,
        modelId,
        botId: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      };

      set({ selectedBots: [...state.selectedBots, selectedBot] });
    },

    // Remove bot from selections by id
    removeBot: (botId: string) => {
      const state = get();

      const updatedBots = state.selectedBots.filter(bot => bot.botId !== botId);

      set({
        selectedBots: updatedBots,
        error: '',
      });
    },

    // Update bot configuration and/or model
    updateBot: ({ botId, botConfiguration, modelId }: UpdateBotData) => {
      const state = get();

      const updatedBots = state.selectedBots.map(bot => {
        if (bot.botId === botId) {
          return {
            ...bot,
            botConfiguration: {
              ...(bot?.botConfiguration || {}),
              ...(botConfiguration || {}),
            },
            modelId: modelId ?? bot.modelId,
          };
        }

        return bot;
      });

      set({
        selectedBots: updatedBots,
        error: '',
      });
    },

    clearError: () => {
      set({ error: '' });
    },
  }))
);
