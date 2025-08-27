import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { ChatManager } from '../ChatManager';
import {
  ConnectionStatus,
  ChatMessageType,
  SocketError,
} from '@repo/shared-types';

// Mock socket.io-client
jest.mock('socket.io-client');
const mockIo = io as jest.MockedFunction<typeof io>;

describe('ChatManager', () => {
  let mockSocket: jest.Mocked<Socket>;
  let chatManager: ChatManager;
  let eventHandlers: { [key: string]: Function } = {};

  beforeEach(() => {
    jest.clearAllMocks();
    eventHandlers = {};

    // Mock console.log to suppress output during tests
    jest.spyOn(console, 'log').mockImplementation();

    mockSocket = {
      connected: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
      emit: jest.fn(),
      on: jest.fn().mockImplementation((event: string, handler: Function) => {
        eventHandlers[event] = handler;
      }),
      off: jest.fn(),
      removeAllListeners: jest.fn(),
    } as any;

    mockIo.mockReturnValue(mockSocket);

    chatManager = new ChatManager({
      url: 'http://localhost:3001',
      sessionId: 'test-session-123',
      autoConnect: false,
    });
  });

  afterEach(() => {
    chatManager.destroy();
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('initializes with provided configuration', () => {
      expect(chatManager.getSessionId()).toBe('test-session-123');
      expect(chatManager.connectionStatus).toBe(ConnectionStatus.connected);
    });

    it('auto connects when autoConnect is true', () => {
      const autoConnectManager = new ChatManager({
        url: 'http://localhost:3001',
        sessionId: 'test-session-123',
        autoConnect: true,
      });

      expect(mockIo).toHaveBeenCalledWith('http://localhost:3001', {
        auth: {
          sessionId: 'test-session-123',
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      autoConnectManager.destroy();
    });
  });

  describe('connect', () => {
    it('establishes socket connection with correct configuration', () => {
      chatManager.connect();

      expect(mockIo).toHaveBeenCalledWith('http://localhost:3001', {
        auth: {
          sessionId: 'test-session-123',
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    });

    it('does not reconnect if already connected', () => {
      mockSocket.connected = true;
      chatManager.connect();
      chatManager.connect();

      expect(mockIo).toHaveBeenCalledTimes(1);
    });

    it('sets up event handlers after connection', () => {
      chatManager.connect();

      expect(mockSocket.on).toHaveBeenCalledWith(
        'connect',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'disconnect',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'connect_error',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'chat:message',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'chat:error',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'reconnect',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'reconnect_error',
        expect.any(Function)
      );
    });
  });

  describe('disconnect', () => {
    it('disconnects the socket and resets state', () => {
      chatManager.connect();
      chatManager.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(chatManager.getSessionId()).toBe('');
    });

    it('handles disconnect when socket is null', () => {
      expect(() => chatManager.disconnect()).not.toThrow();
    });
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      chatManager.connect();
      mockSocket.connected = true;
    });

    it('sends message with correct payload', () => {
      chatManager.sendMessage('Hello world');

      expect(mockSocket.emit).toHaveBeenCalledWith('chat:send_message', {
        content: 'Hello world',
        sessionId: 'test-session-123',
      });
    });

    it('trims message content before sending', () => {
      chatManager.sendMessage('  Hello world  ');

      expect(mockSocket.emit).toHaveBeenCalledWith('chat:send_message', {
        content: 'Hello world',
        sessionId: 'test-session-123',
      });
    });

    it('throws error when socket is not connected', () => {
      mockSocket.connected = false;

      expect(() => chatManager.sendMessage('Hello')).toThrow(
        'Socket not connected'
      );
    });

    it('throws error when no active session', () => {
      chatManager.setSessionId('');

      expect(() => chatManager.sendMessage('Hello')).toThrow(
        'No active session'
      );
    });

    it('throws error for empty message content', () => {
      expect(() => chatManager.sendMessage('')).toThrow(
        'Message content cannot be empty'
      );
      expect(() => chatManager.sendMessage('   ')).toThrow(
        'Message content cannot be empty'
      );
    });
  });

  describe('session management', () => {
    it('sets and gets session ID', () => {
      chatManager.setSessionId('new-session-456');
      expect(chatManager.getSessionId()).toBe('new-session-456');
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      chatManager.connect();
    });

    it('handles connect event', done => {
      let subscriptionCount = 0;

      chatManager.connectionStatus$.subscribe(status => {
        subscriptionCount++;
        // Skip the initial BehaviorSubject emission
        if (subscriptionCount > 1 && status === ConnectionStatus.connected) {
          done();
        }
      });

      eventHandlers['connect']();
    });

    it('handles disconnect event', done => {
      let subscriptionCount = 0;

      chatManager.connectionStatus$.subscribe(status => {
        subscriptionCount++;
        // Skip the initial BehaviorSubject emission
        if (subscriptionCount > 1 && status === ConnectionStatus.connected) {
          done();
        }
      });

      eventHandlers['disconnect']();
    });

    it('handles connect_error event', done => {
      chatManager.connectionStatus$.subscribe(status => {
        if (status === ConnectionStatus.error) {
          done();
        }
      });

      eventHandlers['connect_error']('Connection failed');
    });

    it('handles chat:message event', done => {
      const testMessage: ChatMessageType = {
        id: 'msg-123',
        sessionId: 'test-session-123',
        sender: 'bot',
        content: 'Hello from bot',
        timestamp: new Date().toISOString(),
      };

      chatManager.messages$.subscribe(message => {
        expect(message).toEqual(testMessage);
        done();
      });

      eventHandlers['chat:message'](testMessage);
    });

    it('handles chat:error event', done => {
      const errorData: SocketError = {
        error: 'Test error message',
        code: 'TEST_ERROR',
        timestamp: new Date().toISOString(),
      };

      chatManager.errors$.subscribe(error => {
        expect(error.message).toBe('Test error message');
        done();
      });

      eventHandlers['chat:error'](errorData);
    });

    it('handles reconnect event', done => {
      let subscriptionCount = 0;

      chatManager.connectionStatus$.subscribe(status => {
        subscriptionCount++;
        // Skip the initial BehaviorSubject emission
        if (subscriptionCount > 1 && status === ConnectionStatus.connected) {
          done();
        }
      });

      eventHandlers['reconnect']();
    });

    it('handles reconnect_error event', done => {
      chatManager.errors$.subscribe(error => {
        expect(error.message).toContain('Reconnection failed');
        done();
      });

      eventHandlers['reconnect_error']('Reconnection failed');
    });
  });

  describe('reactive streams', () => {
    beforeEach(() => {
      chatManager.connect();
    });

    it('provides messages observable', done => {
      const testMessage: ChatMessageType = {
        id: 'msg-123',
        sessionId: 'test-session-123',
        sender: 'user',
        content: 'Test message',
        timestamp: new Date().toISOString(),
      };

      chatManager.messages$.subscribe(message => {
        expect(message).toEqual(testMessage);
        done();
      });

      eventHandlers['chat:message'](testMessage);
    });

    it('provides connection status observable', done => {
      let statusCount = 0;

      chatManager.connectionStatus$.subscribe(status => {
        statusCount++;
        if (statusCount === 2) {
          expect(status).toBe(ConnectionStatus.connected);
          done();
        }
      });

      eventHandlers['connect']();
    });

    it('provides connected boolean observable', done => {
      let connectedCount = 0;

      chatManager.connected$.subscribe(connected => {
        connectedCount++;
        if (connectedCount === 2) {
          expect(connected).toBe(true);
          done();
        }
      });

      eventHandlers['connect']();
    });

    it('provides errors observable', done => {
      const errorData: SocketError = {
        error: 'Test error',
        timestamp: new Date().toISOString(),
      };

      chatManager.errors$.subscribe(error => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Test error');
        done();
      });

      eventHandlers['chat:error'](errorData);
    });
  });

  describe('connection status getters', () => {
    it('returns current connection status', () => {
      expect(chatManager.connectionStatus).toBe(ConnectionStatus.connected);
    });

    it('returns isConnected boolean', () => {
      expect(chatManager.isConnected).toBe(true);
    });
  });

  describe('destroy', () => {
    it('cleans up resources and completes observables', () => {
      chatManager.connect();

      const messagesSpy = jest.spyOn(chatManager.messages$, 'subscribe');
      const statusSpy = jest.spyOn(chatManager.connectionStatus$, 'subscribe');
      const errorsSpy = jest.spyOn(chatManager.errors$, 'subscribe');

      chatManager.destroy();

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('handles destroy when socket is null', () => {
      expect(() => chatManager.destroy()).not.toThrow();
    });
  });
});
