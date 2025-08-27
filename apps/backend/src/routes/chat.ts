import { Router } from 'express';

import { ChatController } from '../controllers/chat/ChatController';

const router = Router();
const chatController = new ChatController();

router.post('/session', (req, res) => chatController.createSession(req, res));
router.get('/session/current', (req, res) =>
  chatController.getCurrentSession(req, res)
);
router.get('/session/:id', (req, res) => chatController.getSession(req, res));

export default router;
