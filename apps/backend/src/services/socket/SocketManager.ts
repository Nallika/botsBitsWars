import { Server as HTTPServer } from 'http';
import { Socket, Server as IOServer } from 'socket.io';

import type { ChatMessageType } from '@repo/shared-types';
import {
  SOCKET_EVENTS,
  SOCKET_AUTH_ERRORS,
  MESSAGE_MAX_LENGTH,
} from '../../constants';
import { ChatSession } from '../../models/ChatSession';
import logger from '../logger/logger';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
    };
  };
}

export class SocketManager {
  private io: IOServer;
  private userConnections = new Map<string, Socket>(); // userId → socket

  constructor(server: HTTPServer) {
    this.io = new IOServer(server, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    this.io.use(this.authSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));

    logger.info('Socket.IO server initialized');
  }

  /**
   * Authenticate socket connection using sessionId
   */
  private async authSocket(socket: Socket, next: (err?: Error) => void) {
    try {
      const sessionId = socket.handshake.auth?.sessionId;

      if (!sessionId) {
        logger.warn('Socket connection attempt without sessionId', {
          socketId: socket.id,
        });
        return next(new Error(SOCKET_AUTH_ERRORS.TOKEN_MISSING));
      }

      // Validate sessionId and get user
      const userId = await this.validateSession(sessionId);

      if (!userId) {
        logger.warn('Socket connection attempt with invalid sessionId', {
          socketId: socket.id,
          sessionId,
        });
        return next(new Error(SOCKET_AUTH_ERRORS.TOKEN_INVALID));
      }

      // Disconnect existing connection for this user
      this.disconnectExistingConnection(userId);

      // Attach user data to socket
      socket.data.user = { id: userId };

      logger.info('Socket authenticated successfully', {
        socketId: socket.id,
        userId,
        sessionId,
      });

      next();
    } catch (err) {
      logger.error('Socket authentication failed', {
        socketId: socket.id,
        error: err instanceof Error ? err.message : 'Unknown error',
      });

      next(new Error(SOCKET_AUTH_ERRORS.AUTH_FAILED));
    }
  }

  /**
   * Handle new socket connection
   */
  private async handleConnection(socket: AuthenticatedSocket) {
    const { user } = socket.data;

    if (!user) {
      logger.warn('Socket connection without user data', {
        socketId: socket.id,
      });
      return socket.disconnect();
    }

    logger.info('User connected via socket', {
      socketId: socket.id,
      userId: user.id,
    });

    // Store the connection
    this.storeUserConnection(user.id, socket);

    // Set up event handlers
    socket.on(SOCKET_EVENTS.SEND_MESSAGE, data =>
      this.handleSendMessage(socket, data)
    );

    socket.on('disconnect', () => {
      logger.info('User disconnected from socket', {
        socketId: socket.id,
        userId: user.id,
      });
      // Clean up connection tracking
      this.userConnections.delete(user.id);
    });

    // Handle socket errors
    socket.on('error', error => {
      this.handleError(socket, error, 'Socket error');
    });
  }

  /**
   * Handle incoming chat message
   */
  private async handleSendMessage(socket: AuthenticatedSocket, data: any) {
    try {
      const { user } = socket.data;

      // Validate message data
      if (!data || typeof data !== 'object') {
        this.emitError(socket, 'Invalid message format');
        return;
      }

      const { content, sessionId } = data;

      // Validate required fields
      if (!content || typeof content !== 'string') {
        this.emitError(socket, 'Message content is required');
        return;
      }

      if (!sessionId || typeof sessionId !== 'string') {
        this.emitError(socket, 'Session ID is required');
        return;
      }

      // Validate message length
      if (content.length > MESSAGE_MAX_LENGTH) {
        this.emitError(
          socket,
          `Message too long (max ${MESSAGE_MAX_LENGTH} characters)`
        );
        return;
      }

      if (content.trim().length === 0) {
        this.emitError(socket, 'Message cannot be empty');
        return;
      }

      // Verify session belongs to user
      const session = await ChatSession.findOne({
        sessionId,
        userId: user.id,
      });

      if (!session) {
        this.emitError(socket, 'Session not found or unauthorized');
        return;
      }

      // Create message object
      const message: ChatMessageType = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        sender: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      logger.info('Message received via socket', {
        messageId: message.id,
        sessionId,
        userId: user.id,
        contentLength: content.length,
      });

      // For now, echo the message back (bot integration comes later)
      socket.emit(SOCKET_EVENTS.MESSAGE, message);

      logger.info('Message echoed back to user', {
        messageId: message.id,
        socketId: socket.id,
      });
    } catch (error) {
      this.handleError(socket, error, 'Failed to process message');
    }
  }

  /**
   * Handle socket errors with proper logging
   */
  private handleError(
    socket: AuthenticatedSocket,
    error: any,
    context: string
  ) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    logger.error(`Socket error: ${context}`, {
      socketId: socket.id,
      userId: socket.data?.user?.id,
      error: errorMessage,
      context,
    });

    this.emitError(socket, 'An error occurred while processing your request');
  }

  /**
   * Emit error to specific socket
   */
  private emitError(socket: Socket, message: string, code?: string) {
    socket.emit(SOCKET_EVENTS.ERROR, {
      error: message,
      code,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send message to specific session (for future use)
   */
  public sendMessageToSession(sessionId: string, message: ChatMessageType) {
    this.io.to(sessionId).emit(SOCKET_EVENTS.MESSAGE, message);

    logger.info('Message sent to session', {
      sessionId,
      messageId: message.id,
    });
  }

  /**
   * Validate sessionId and return userId if valid
   */
  private async validateSession(sessionId: string): Promise<string | null> {
    try {
      const session = await ChatSession.findOne({ sessionId });

      return session ? session.userId : null;
    } catch (error) {
      logger.error('Session validation error', {
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Disconnect existing connection for a user
   */
  private disconnectExistingConnection(userId: string): void {
    const existingSocket = this.userConnections.get(userId);
    if (existingSocket) {
      logger.info('Disconnecting existing connection for user', {
        userId,
        oldSocketId: existingSocket.id,
      });
      existingSocket.disconnect();
      this.userConnections.delete(userId);
    }
  }

  /**
   * Store user connection
   */
  private storeUserConnection(userId: string, socket: Socket): void {
    this.userConnections.set(userId, socket);
    logger.info('Stored user connection', {
      userId,
      socketId: socket.id,
    });
  }
}

export function attachSocketManager(server: HTTPServer) {
  return new SocketManager(server);
}
