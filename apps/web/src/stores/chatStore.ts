import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { ChatManager } from '@repo/chat-core/src';
import { ChatMessageType, CONNECTION_STATUS_ENUM } from '@repo/shared-types';

import { apiClient } from '../services/api';

interface ChatState {
  // Private fields - not exposed to components
  _chatManager: ChatManager | null;
  _sessionId: string | null;

  // Public state
  messages: ChatMessageType[];
  connected: boolean;
  isInitialized: boolean;
  error: string;
  loading: boolean;

  // Public actions
  initializeChat: () => Promise<void>;
  sendMessage: (content: string) => void;
  destroy: () => void;

  // Internal actions
  _getChatSession: () => Promise<string>;
}

export const useChatStore = create<ChatState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    _chatManager: null,
    _sessionId: null,
    messages: [],
    connected: false,
    isInitialized: false,
    error: '',
    loading: false,

    // Public actions
    initializeChat: async (): Promise<void> => {
      const state = get();

      // Prevent multiple initializations
      if (state._chatManager || state.isInitialized || state.loading) {
        console.log('Chat already initialized');
        return;
      }

      set({ loading: true, error: '' });

      try {
        // Get session first
        const sessionId = await get()._getChatSession();

        // Create ChatManager
        const chatManager = new ChatManager({
          url: process.env.NEXT_PUBLIC_API_HOST!,
          sessionId,
          autoConnect: true,
        });

        // Set up subscriptions before connecting
        chatManager.messages$.subscribe(message => {
          set(state => ({
            messages: [...state.messages, message],
          }));
        });

        chatManager.connectionStatus$.subscribe(status => {
          set({
            connected: status === CONNECTION_STATUS_ENUM.connected,
          });
        });

        chatManager.errors$.subscribe(error => {
          set({
            error: error.message,
          });
        });

        // Store manager and connect
        set({
          _chatManager: chatManager,
          isInitialized: true,
          loading: false,
        });
      } catch (error) {
        set({
          loading: false,
          error: 'Failed to initialize chat',
          isInitialized: false,
        });

        throw error;
      }
    },

    sendMessage: (content: string): void => {
      const state = get();

      if (!state._chatManager) {
        throw new Error('Chat not initialized');
      }

      try {
        state._chatManager.sendMessage(content);
      } catch (error) {
        set({ error: 'Failed to send message' });

        throw error;
      }
    },

    destroy: (): void => {
      const state = get();

      if (state._chatManager) {
        state._chatManager.destroy();
      }

      set({
        _chatManager: null,
        _sessionId: null,
        isInitialized: false,
        connected: false,
        messages: [],
        error: '',
      });
    },

    _getChatSession: async (): Promise<string> => {
      try {
        const response = await apiClient.post<any>('/chat/session');

        if (!response.data.success) {
          throw new Error(response.data.error);
        }

        const { sessionId } = response.data.data;

        set({
          _sessionId: sessionId,
          loading: false,
          error: '',
        });

        return sessionId;
      } catch (error) {
        set({
          loading: false,
          error: 'Failed to get chat session',
        });

        throw error;
      }
    },
  }))
);
