import { Server as HTTPServer } from 'http';
import { Socket, Server as IOServer } from 'socket.io';

import type { ChatMessage } from '@repo/shared-types';
import { verifyToken } from '../../utils/helpers';
import logger from '../logger/logger';

export class SocketManager {
  private io: any;

  constructor(server: HTTPServer) {
    this.io = new IOServer(server, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    this.io.use(this.authSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));
  }

  private authSocket(socket: Socket, next: (err?: Error) => void) {
    try {
      // TODO: fix this
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.headers?.Authorization;

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const user = verifyToken(token.replace('Bearer ', ''));

      if (!user) {
        return next(new Error('Invalid token'));
      }

      socket.data.user = user;
      next();
    } catch (err) {
      logger.error('Authentication failed: %s', err);

      next(new Error('Authentication failed'));
    }
  }

  private async handleConnection(socket: any) {
    const user = socket.user;
    // Optionally: join user to a room by sessionId or userId
    socket.on('chat:message', async (msg: ChatMessage) => {
      // For now, just echo the message back
      socket.emit('chat:message', msg);
    });

    socket.on('disconnect', () => {
      // Handle cleanup if needed
    });
  }

  public sendMessageToSession(sessionId: string, message: ChatMessage) {
    // Optionally: implement room-based messaging
    this.io.to(sessionId).emit('chat:message', message);
  }
}

export function attachSocketManager(server: HTTPServer) {
  return new SocketManager(server);
}
