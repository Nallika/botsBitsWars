import 'dotenv/config';
import supertest from 'supertest';
import mongoose from 'mongoose';
import { Server as HTTPServer, createServer as createHttpServer } from 'http';
import { Socket as ClientSocket, io as Client } from 'socket.io-client';

import {
  ChatMessageType,
  SocketError,
  SOCKET_EVENTS_ENUM,
} from '@repo/shared-types';

import { createServer } from '../server';
import { createRoutes } from '../routes';
import { DBManager } from '../services/db/DBManager';
import { User } from '../models/User';
import { SocketManager } from '../services/socket/SocketManager';
import { SOCKET_AUTH_ERRORS, MESSAGE_MAX_LENGTH } from '../constants';

const MONGO_URI = process.env.MONGO_URI_TEST;

/**
 * Socket Chat functionality integration tests.
 */
describe('Socket Chat', () => {
  let app: ReturnType<typeof createServer>;
  let server: HTTPServer;
  let clientSocket: ClientSocket;
  let port: number;
  let authCookies: string[];
  let sessionId: string;
  let userId: string;
  let allSockets: ClientSocket[] = []; // Track all created sockets

  const testUser = {
    email: 'sockettest@example.com',
    password: 'Password123',
  };

  beforeAll(async () => {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI_TEST environment variable is not set');
    }

    await DBManager.getInstance().connect(MONGO_URI);

    app = createServer();
    server = createHttpServer(app);
    const socketManager = new SocketManager(server);
    app.use('/api', createRoutes(socketManager));

    // Start server on random port and wait for it to be ready
    server.listen(0, () => {
      port = (server.address() as any)?.port;
    });

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
  }, 10000); // Increase timeout for beforeAll

  beforeEach(async () => {
    // Clean collections before each test
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('chatsessions').deleteMany({});

    // Register and login user to get auth cookies
    await supertest(app).post('/api/auth/register').send(testUser);
    const loginRes = await supertest(app)
      .post('/api/auth/login')
      .send(testUser);
    const cookies = loginRes.headers['set-cookie'];
    authCookies = Array.isArray(cookies) ? cookies : [cookies].filter(Boolean);

    // Create a chat session
    const sessionRes = await supertest(app)
      .post('/api/chat/session')
      .set('Cookie', authCookies);

    sessionId = sessionRes.body.data.sessionId;

    // Get user ID
    const user = await User.findOne({ email: testUser.email });
    userId = user?._id.toString() || '';
  });

  afterEach(async () => {
    // Close all created sockets
    for (const socket of allSockets) {
      if (socket.connected) {
        socket.disconnect();
      }
    }
    allSockets = [];

    if (clientSocket?.connected) {
      clientSocket.disconnect();
    }

    // Wait a bit for connections to close
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  afterAll(async () => {
    // Ensure server is closed
    if (server) {
      server.close();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    await mongoose.disconnect();
  });

  const createClientSocket = (sessionId?: string): Promise<ClientSocket> => {
    return new Promise((resolve, reject) => {
      const socket = Client(`http://localhost:${port}`, {
        auth: { sessionId },
        autoConnect: false,
        timeout: 1000, // Add timeout to prevent hanging
      });

      // Track the socket for cleanup
      allSockets.push(socket);

      const timeoutId = setTimeout(() => {
        socket.disconnect();
        reject(new Error('Connection timeout'));
      }, 2000);

      socket.on('connect', () => {
        clearTimeout(timeoutId);
        resolve(socket);
      });

      socket.on('connect_error', (err: Error) => {
        clearTimeout(timeoutId);
        reject(err);
      });

      socket.connect();
    });
  };

  it('authenticates socket connection with valid sessionId', async () => {
    clientSocket = await createClientSocket(sessionId);

    expect(clientSocket.connected).toBe(true);
  });

  it('rejects socket connection without sessionId', async () => {
    try {
      await createClientSocket();
      throw new Error('Should have failed');
    } catch (error: any) {
      expect(error.message).toContain(SOCKET_AUTH_ERRORS.TOKEN_MISSING);
    }
  });

  it('rejects socket connection with invalid sessionId', async () => {
    try {
      await createClientSocket('invalid-session-id');
      throw new Error('Should have failed');
    } catch (error: any) {
      expect(error.message).toContain(SOCKET_AUTH_ERRORS.TOKEN_INVALID);
    }
  });

  it('handles sending and receiving chat messages', async () => {
    clientSocket = await createClientSocket(sessionId);

    const testMessage = 'Hello, this is a test message!';
    let receivedMessage: ChatMessageType | null = null;

    // Listen for message response from server
    clientSocket.on(
      SOCKET_EVENTS_ENUM.OUTPUT_MESSAGE,
      (message: ChatMessageType) => {
        receivedMessage = message;
      }
    );

    // Send message to server
    const payload = {
      content: testMessage,
    };

    clientSocket.emit(SOCKET_EVENTS_ENUM.INPUT_MESSAGE, payload);

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(receivedMessage).not.toBeNull();
    expect(receivedMessage!.content).toBe(testMessage);
    expect(receivedMessage!.sender).toBe('user');
    expect(receivedMessage!.sessionId).toBe(sessionId);
    expect(receivedMessage!.id).toBeDefined();
    expect(receivedMessage!.timestamp).toBeDefined();
  });

  it('validates message content is required', async () => {
    clientSocket = await createClientSocket(sessionId);

    let errorReceived: SocketError | null = null;

    clientSocket.on(SOCKET_EVENTS_ENUM.ERROR, (error: SocketError) => {
      errorReceived = error;
    });

    // Send message without content
    clientSocket.emit(SOCKET_EVENTS_ENUM.INPUT_MESSAGE, { sessionId });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(errorReceived).not.toBeNull();
    expect(errorReceived!.error).toBe('Message content is required');
  });

  it('rejects empty messages', async () => {
    clientSocket = await createClientSocket(sessionId);

    let errorReceived: SocketError | null = null;

    clientSocket.on(SOCKET_EVENTS_ENUM.ERROR, (error: SocketError) => {
      errorReceived = error;
    });

    // Send empty message
    const payload = {
      content: '   ',
    };

    clientSocket.emit(SOCKET_EVENTS_ENUM.INPUT_MESSAGE, payload);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(errorReceived).not.toBeNull();
    expect(errorReceived!.error).toBe('Message content is required');
  });

  it('rejects messages exceeding maximum length', async () => {
    clientSocket = await createClientSocket(sessionId);

    let errorReceived: SocketError | null = null;

    clientSocket.on(SOCKET_EVENTS_ENUM.ERROR, (error: SocketError) => {
      errorReceived = error;
    });

    // Send message that exceeds max length
    const longMessage = 'a'.repeat(MESSAGE_MAX_LENGTH + 1);
    const payload = {
      content: longMessage,
    };

    clientSocket.emit(SOCKET_EVENTS_ENUM.INPUT_MESSAGE, payload);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(errorReceived).not.toBeNull();
    expect(errorReceived!.error).toBe(
      `Message too long (max ${MESSAGE_MAX_LENGTH} characters)`
    );
  });

  it('disconnects existing connection when user connects with new socket', async () => {
    // Create first connection
    const firstSocket = await createClientSocket(sessionId);
    expect(firstSocket.connected).toBe(true);

    let firstSocketDisconnected = false;
    firstSocket.on('disconnect', () => {
      firstSocketDisconnected = true;
    });

    // Create second connection with same sessionId
    clientSocket = await createClientSocket(sessionId);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(firstSocketDisconnected).toBe(true);
    expect(clientSocket.connected).toBe(true);

    // Clean up first socket explicitly since it was disconnected by server
    firstSocket.disconnect();
  });

  it('trims whitespace from message content', async () => {
    clientSocket = await createClientSocket(sessionId);

    const testMessage = '  Hello with whitespace  ';
    const expectedTrimmed = 'Hello with whitespace';
    let receivedMessage: ChatMessageType | null = null;

    clientSocket.on(
      SOCKET_EVENTS_ENUM.OUTPUT_MESSAGE,
      (message: ChatMessageType) => {
        receivedMessage = message;
      }
    );

    const payload = {
      content: testMessage,
    };

    clientSocket.emit(SOCKET_EVENTS_ENUM.INPUT_MESSAGE, payload);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(receivedMessage!.content).toBe(expectedTrimmed);
  });

  it('generates unique message IDs', async () => {
    clientSocket = await createClientSocket(sessionId);

    const messageIds: string[] = [];

    clientSocket.on(
      SOCKET_EVENTS_ENUM.OUTPUT_MESSAGE,
      (message: ChatMessageType) => {
        messageIds.push(message.id);
      }
    );

    // Send multiple messages
    for (let i = 0; i < 3; i++) {
      const payload = {
        content: `Test message ${i}`,
      };

      clientSocket.emit(SOCKET_EVENTS_ENUM.INPUT_MESSAGE, payload);
    }

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(messageIds).toHaveLength(3);
    expect(new Set(messageIds).size).toBe(3); // All IDs should be unique
  });
});
