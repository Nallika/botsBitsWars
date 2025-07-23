import { Request, Response } from 'express';

import logger from '../../utils/logger';
import { DBManager } from '../../utils/DBManager';
import { createChatId } from '../../utils/helpers';

export class ChatController {
  static async createSession(req: Request, res: Response) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }

      const sessionId = createChatId(userId);
      const session = await DBManager.createSession({ sessionId, userId });

      res.json({ sessionId, session });
    } catch (error) {
      logger.error('Create session error: %s', error);

      res.status(500).json({ error: 'Failed to create session' });
    }
  }

  static async getSession(req: Request, res: Response) {
    try {
      const session = await DBManager.getSessionById(req.params.id);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(session);
    } catch (error) {
      logger.error('Get session error: %s', error);

      res.status(500).json({ error: 'Failed to fetch session' });
    }
  }
}
