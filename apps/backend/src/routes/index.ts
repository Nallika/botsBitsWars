import express from 'express';

import { createChatRoutes } from './chat';
import authRoutes from './auth';
import type { SocketManager } from '../services/socket/SocketManager';

export function createRoutes(socketManager: SocketManager) {
  const routes = express.Router();

  routes.use('/auth', authRoutes);
  routes.use('/chat', createChatRoutes(socketManager));

  return routes;
}
