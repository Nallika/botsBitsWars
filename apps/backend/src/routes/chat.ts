import { Router } from 'express';

import { ChatController } from '../controllers/chat/ChatController';
import type { SocketManager } from '../services/socket/SocketManager';

export function createChatRoutes(socketManager: SocketManager) {
  const router = Router();
  const chatController = new ChatController(socketManager);

  router.get('/prepare', (req, res) => chatController.prepareChat(req, res));
  router.post('/session', (req, res) => chatController.createSession(req, res));
  router.get('/session/current', (req, res) =>
    chatController.getCurrentSession(req, res)
  );
  router.get('/session/:id', (req, res) => chatController.getSession(req, res));

  return router;
}
