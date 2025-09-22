import type { ChatMessageType } from '@repo/shared-types';

/**
 * Simple mock chat store for testing
 */
export const mockChatStore = {
  // State
  messages: [] as ChatMessageType[],
  connected: true,
  isInitialized: true,
  error: null as string | null,
  loading: false,

  // Mock functions
  initializeChat: jest.fn().mockResolvedValue(undefined),
  sendMessage: jest.fn(),
  destroy: jest.fn(),
  addMessage: jest.fn(),
  setError: jest.fn(),
  getChatSession: jest.fn().mockResolvedValue('mock-session-id'),
};

/**
 * Mock sample chat messages for testing
 */
export const mockMessages: ChatMessageType[] = [
  {
    id: '1',
    sessionId: 'session-1',
    sender: 'user',
    content: 'Hello, world!',
    timestamp: '2025-08-22T10:00:00.000Z',
  },
  {
    id: '2',
    sessionId: 'session-1',
    sender: 'bot',
    content: 'Hello! How can I help you?',
    timestamp: '2025-08-22T10:01:00.000Z',
  },
];

/**
 * Reset mock store to default state
 */
export const resetMockChatStore = () => {
  mockChatStore.messages = [];
  mockChatStore.connected = true;
  mockChatStore.isInitialized = true;
  mockChatStore.error = null;
  mockChatStore.loading = false;

  jest.clearAllMocks();
};
