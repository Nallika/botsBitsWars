import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { 
  BotSnapshot,
  BotInfo,
  ChatModeInfo, 
  PrepareChatData
} from '@repo/shared-types';

import { apiClient } from '../services/api';
import { getRandomEl } from '../utils';
import { SelectedBot } from '../types';

interface PrepareChatState {
  loading: boolean;
  error: string;

  // Available data from backend
  availableModes: ChatModeInfo[];
  availableProviders: BotInfo[];
  
  // User selections
  selectedChatMode: ChatModeInfo | null;
  selectedBots: SelectedBot[];

  // Actions
  loadPrepareChatData: () => Promise<void>;
  selectChatMode: (mode: string) => void;
  addNewBot: () => void;
  removeBot: (index: number) => void;
  updateBot: (botId: string, updatedBot: Partial<SelectedBot>) => void;
  clearError: () => void;
}

export const usePrepareChatStore = create<PrepareChatState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    loading: false,
    error: '',
    availableModes: [],
    availableProviders: [],
    selectedChatMode: null,
    selectedBots: [],

    loadPrepareChatData: async (): Promise<void> => {
      const state = get();

      if (state.availableModes.length > 0 && state.availableProviders.length > 0) {
        return;
      }

      try {
        set({ loading: true, error: '' });

        const response = await apiClient.get<PrepareChatData>('/chat/prepare');
        const { modes, bots } = response.data;

        set({
          loading: false,
          error: '',
          selectedChatMode: modes[0],
          availableModes: modes,
          availableProviders: bots,
          selectedBots: [],
        });

        // Auto-populate with one bot after data is loaded
        get().addNewBot();
      } catch (error) {
        set({
          loading: false,
          error: 'Failed to prepare chat data',
        });

        throw error;
      }
    },

    selectChatMode: (mode: string) => {
      const state = get();

      const selectedModeInfo = state.availableModes.find(availableMode => availableMode.modeId === mode);
      
      if (!selectedModeInfo) {
        set({ error: 'Invalid chat mode selected' });
        return;
      }

      // Clear selected bots when changing mode (since bot limits might change)
      set({ 
        selectedChatMode: selectedModeInfo,
        selectedBots: [],
        error: '' 
      });
    },

    addNewBot: () => {
      const state = get();

      if (state.selectedChatMode && state.selectedBots.length >= state.selectedChatMode.maxBots) {
        return;
      }

      const availableProviderIds = state.availableProviders.map(provider => provider.providerId);
      const providerId = getRandomEl(availableProviderIds);
      const availableModels = state.availableProviders.find(provider => provider.providerId === providerId)?.botsList as string[];
      const modelId = getRandomEl(availableModels);

      const selectedBot: SelectedBot = {
        providerId,
        modelId,
        botId: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      };

      set({ selectedBots: [
        ...state.selectedBots,
        selectedBot
      ]});
    },

    removeBot: (index: number) => {
      const state = get();
      
      if (index < 0 || index >= state.selectedBots.length) {
        set({ error: 'Invalid bot index' });
        return;
      }

      const updatedBots = state.selectedBots.filter((_, i) => i !== index);
      
      set({ 
        selectedBots: updatedBots,
        error: '' 
      });
    },

    updateBot: (botId: string, updatedData: Partial<SelectedBot>) => {
      const state = get();

      const updatedBots = state.selectedBots.map(bot =>
        bot.botId === botId ? { ...bot, ...updatedData } : bot
      );
      
      set({ 
        selectedBots: updatedBots,
        error: '' 
      });
    },

    clearError: () => {
      set({ error: '' });
    },
  }))
);
