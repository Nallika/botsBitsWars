import { act } from 'react';
import { renderHook } from '@testing-library/react';

import { CONNECTION_STATUS_ENUM } from '@repo/shared-types';

import { apiClient } from '../../services/api';
import { useChatStore } from '../chatStore';
import { mockMessages } from '../../__mocks__/chatStore';

// Mock external dependencies
let messagesCallback: (message: any) => void;
let connectionStatusCallback: (status: any) => void;
let errorsCallback: (error: any) => void;

const mockChatManager = {
  sendMessage: jest.fn(),
  destroy: jest.fn(),
  messages$: {
    subscribe: jest.fn(callback => {
      messagesCallback = callback;
    }),
  },
  connectionStatus$: {
    subscribe: jest.fn(callback => {
      connectionStatusCallback = callback;
    }),
  },
  errors$: {
    subscribe: jest.fn(callback => {
      errorsCallback = callback;
    }),
  },
} as any; // Cast to any to avoid ChatManager interface issues

jest.mock('@repo/chat-core', () => ({
  ChatManager: jest.fn().mockImplementation(() => mockChatManager),
}));

jest.mock('../../services/api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

// Import the mocked module to access the mock functions
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useChatStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to initial state
    useChatStore.setState({
      _chatManager: null,
      _sessionId: null,
      messages: [],
      connected: false,
      isInitialized: false,
      error: '',
      loading: false,
    });
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useChatStore());

    expect(result.current.messages).toEqual([]);
    expect(result.current.connected).toBe(false);
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.loading).toBe(false);
  });

  it('prevents multiple initializations', async () => {
    const { result } = renderHook(() => useChatStore());

    // Set store to already initialized state
    act(() => {
      useChatStore.setState({ isInitialized: true });
    });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await act(async () => {
      await result.current.initializeChat();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Chat already initialized');
    expect(mockApiClient.post).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('prevents initialization when loading', async () => {
    const { result } = renderHook(() => useChatStore());

    // Set store to loading state
    act(() => {
      useChatStore.setState({ loading: true });
    });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await act(async () => {
      await result.current.initializeChat();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Chat already initialized');
    expect(mockApiClient.post).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('initializes chat successfully', async () => {
    mockApiClient.post.mockResolvedValue({
      data: {
        success: true,
        data: { sessionId: 'test-session-123' },
      },
    });

    const { result } = renderHook(() => useChatStore());

    await act(async () => {
      await result.current.initializeChat();
    });

    expect(mockApiClient.post).toHaveBeenCalledWith('/chat/session');
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('handles failed initialization', async () => {
    const errorMessage = 'Session creation failed';
    mockApiClient.post.mockResolvedValue({
      data: {
        success: false,
        error: errorMessage,
      },
    });

    const { result } = renderHook(() => useChatStore());
    let thrownError: any = null;

    await act(async () => {
      try {
        await result.current.initializeChat();
      } catch (error) {
        thrownError = error;
      }
    });

    expect(thrownError).toEqual(new Error(errorMessage));
    expect(result.current.loading).toBe(false);
    expect(result.current.isInitialized).toBe(false);
  });

  it('Should listen chatManager topics and set state accordingly', async () => {
    const { result } = renderHook(() => useChatStore());

    const mockConnectionStatus = CONNECTION_STATUS_ENUM.connected;
    const mockError = { message: 'Connection error' };

    act(() => {
      messagesCallback(mockMessages[0]);
      connectionStatusCallback(mockConnectionStatus);
      errorsCallback(mockError);
    });

    expect(result.current.messages).toEqual([mockMessages[0]]);
    expect(result.current.connected).toBe(true);
    expect(result.current.error).toBe('Connection error');
  });

  it('sends message when chat is initialized', async () => {
    mockApiClient.post.mockResolvedValue({
      data: {
        success: true,
        data: { sessionId: 'test-session-123' },
      },
    });

    const { result } = renderHook(() => useChatStore());

    await act(async () => {
      await result.current.initializeChat();
      result.current.sendMessage('Hello world');
    });

    expect(mockChatManager.sendMessage).toHaveBeenCalledWith('Hello world');
    expect(result.current.error).toBe(''); // Should be empty when no error occurs
  });

  it('throws error when sending message without initialization', () => {
    const { result } = renderHook(() => useChatStore());

    expect(() => {
      result.current.sendMessage('Hello world');
    }).toThrow('Chat not initialized');
  });

  it('handles sendMessage error and sets store error', async () => {
    const sendError = new Error('Send failed');
    mockChatManager.sendMessage.mockImplementation(() => {
      throw sendError;
    });
    const { result } = renderHook(() => useChatStore());

    // Set up initialized state
    act(() => {
      useChatStore.setState({
        _chatManager: mockChatManager,
        isInitialized: true,
        connected: true,
      });
    });

    // Wrap the sendMessage call with act() and capture both the exception and state
    let thrownError: any = null;
    act(() => {
      try {
        result.current.sendMessage('Test message');
      } catch (error) {
        thrownError = error;
      }
    });

    // Check both that the error was thrown and the state was updated
    expect(thrownError).toEqual(sendError);
    expect(result.current.error).toBe('Failed to send message');
  });

  it('destroys chat manager and resets state', () => {
    const { result } = renderHook(() => useChatStore());

    // Set up initialized state
    act(() => {
      useChatStore.setState({
        _chatManager: mockChatManager,
        _sessionId: 'test-session',
        isInitialized: true,
        connected: true,
        messages: [
          {
            id: '1',
            sessionId: 'test-session',
            sender: 'user',
            content: 'Test',
            timestamp: '2025-08-25T10:00:00.000Z',
          },
        ],
        error: 'Some error',
      });
    });

    act(() => {
      result.current.destroy();
    });

    expect(mockChatManager.destroy).toHaveBeenCalled();
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.connected).toBe(false);
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBe('');
  });

  it('destroys safely when no chat manager exists', () => {
    const { result } = renderHook(() => useChatStore());

    act(() => {
      result.current.destroy();
    });

    expect(mockChatManager.destroy).not.toHaveBeenCalled();
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.connected).toBe(false);
  });
});
