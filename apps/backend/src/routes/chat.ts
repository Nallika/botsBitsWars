import { Router } from 'express';

import { ChatController } from '../controllers/chat/ChatController';

const router = Router();

router.post('/session', ChatController.createSession);
router.get('/session/:id', ChatController.getSession);

export default router;
