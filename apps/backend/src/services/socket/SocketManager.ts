import { Server as HTTPServer } from 'http';
import { Socket, Server as IOServer } from 'socket.io';
import { Subject } from 'rxjs';

import { ChatMessageType, SOCKET_EVENTS_ENUM } from '@repo/shared-types';
import { SOCKET_AUTH_ERRORS, MESSAGE_MAX_LENGTH } from '../../constants';
import { ChatSession } from '../../models/ChatSession';
import { logger } from '../logger';
import { generateMessageId } from '../../utils/helpers';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
    };
    sessionId: string;
  };
}

export class SocketManager {
  private io: IOServer;
  private userConnections = new Map<string, Socket>();
  private messageSubjects = new Map<string, Subject<ChatMessageType>>();

  constructor(server: HTTPServer) {
    this.io = new IOServer(server, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    this.io.use(this.authSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));

    logger.info('Socket.IO server initialized');
  }

  /**
   * Get or create message subject for a session
   */
  public getMessageSubject(sessionId: string): Subject<ChatMessageType> {
    if (!this.messageSubjects.has(sessionId)) {
      const subject = new Subject<ChatMessageType>();
      this.messageSubjects.set(sessionId, subject);
    }

    return this.messageSubjects.get(sessionId)!;
  }

  /**
   * Remove message subject for session (cleanup)
   */
  public removeMessageSubject(sessionId: string): void {
    const subject = this.messageSubjects.get(sessionId);

    if (subject) {
      subject.complete();
      this.messageSubjects.delete(sessionId);
    }
  }

  /**
   * Authenticate socket connection using sessionId
   */
  private async authSocket(socket: Socket, next: (err?: Error) => void) {
    try {
      const sessionId = socket.handshake.auth?.sessionId;

      if (!sessionId) {
        logger.error('Socket connection attempt without sessionId');
        return next(new Error(SOCKET_AUTH_ERRORS.TOKEN_MISSING));
      }

      const userId = await this.validateSession(sessionId);

      if (!userId) {
        logger.warn(
          'Socket connection attempt with invalid sessionId:',
          sessionId
        );
        return next(new Error(SOCKET_AUTH_ERRORS.TOKEN_INVALID));
      }

      // Disconnect existing connection for this user
      this.disconnectExistingConnection(userId);

      // Attach user data and sessionId to socket
      socket.data.user = { id: userId };
      socket.data.sessionId = sessionId;

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
    const { user, sessionId } = socket.data;

    if (!user || !sessionId) {
      logger.error('Socket connection without user data or sessionId');
      return socket.disconnect();
    }

    socket.join(sessionId);
    this.storeUserConnection(user.id, socket);

    logger.info('User connected via socket', {
      socketId: socket.id,
      userId: user.id,
      sessionId,
    });

    socket.on(SOCKET_EVENTS_ENUM.INPUT_MESSAGE, data =>
      this.handleSendMessage(socket, data)
    );

    socket.on('disconnect', () => {
      logger.info('User disconnected from socket', {
        socketId: socket.id,
        userId: user.id,
        sessionId,
      });
      this.userConnections.delete(user.id);
    });

    socket.on('error', error => {
      this.handleError(socket, error, 'Socket error');
    });
  }

  /**
   * Handle incoming chat message
   */
  private async handleSendMessage(socket: AuthenticatedSocket, data: any) {
    try {
      const { user, sessionId } = socket.data;
      const { content } = data;

      if (
        !content ||
        typeof content !== 'string' ||
        content.trim().length === 0
      ) {
        this.emitError(socket, 'Message content is required');
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

      const message: ChatMessageType = {
        id: generateMessageId(),
        sessionId,
        sender: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      logger.info('Message received via socket', {
        text: message.content,
        sessionId,
        userId: user.id,
      });

      // Send user message to session room first
      this.sendMessageToSession(sessionId, message);
      // Then emit to message subject for bot processing
      this.getMessageSubject(sessionId).next(message);

      logger.info('Message processed and emitted to session', {
        sessionId,
        messageId: message.id,
      });
    } catch (error) {
      this.handleError(socket, error, 'Failed to process message');
    }
  }

  /**
   * Log error and send safe error message to socket
   */
  private handleError(
    socket: AuthenticatedSocket,
    error: any,
    context: string
  ) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    logger.error(`handleError Socket error: ${context}`, {
      socketId: socket.id,
      userId: socket.data?.user?.id,
      error: errorMessage,
    });

    this.emitError(socket, 'An error occurred while processing your request');
  }

  /**
   * Emit error to specific socket
   */
  private emitError(socket: Socket, message: string) {
    socket.emit(SOCKET_EVENTS_ENUM.ERROR, {
      error: message,
      timestamp: new Date().toISOString(),
    });
  }

  public sendMessageToSession(sessionId: string, message: ChatMessageType) {
    this.io.to(sessionId).emit(SOCKET_EVENTS_ENUM.OUTPUT_MESSAGE, message);

    logger.info('Message sent to session', {
      text: message.content,
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
  }
}
