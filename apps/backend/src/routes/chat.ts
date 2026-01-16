import { Router } from 'express';

import { ChatController } from '../controllers/chat/ChatController';
import { BotRegistry } from '../services/bot/BotRegistry';
import type { SocketManager } from '../services/socket/SocketManager';

/**
 * Register chat-related routes
 * Receives SocketManager instance to pass to ChatController
 * @param socketManager
 * @returns
 */
export function createChatRoutes(socketManager: SocketManager) {
  const router = Router();

  // We need to ensure that this calsses have single instances
  const botRegistry = new BotRegistry();
  const chatController = new ChatController(socketManager, botRegistry);

  router.get('/compose', (req, res) =>
    chatController.getComposeChatData(req, res)
  );
  router.post('/session', (req, res) => chatController.createSession(req, res));
  router.get('/session/current', (req, res) =>
    chatController.getCurrentSession(req, res)
  );
  // @todo is it needed ?
  router.get('/session/:id', (req, res) => chatController.getSession(req, res));

  return router;
}
