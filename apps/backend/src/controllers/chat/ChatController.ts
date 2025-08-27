import { Request, Response } from 'express';
import { param } from 'express-validator';

import { User } from '../../models/User';
import { createChatId } from '../../utils/helpers';
import { BaseController } from '../base/BaseController';
import { ChatSession } from '../../models/ChatSession';

export class ChatController extends BaseController {
  /**
   * Create a new chat session for the authenticated user
   */
  async createSession(req: Request, res: Response) {
    // Verify token and validate request
    if (!(await this.verifyToken(req, res))) return;

    try {
      const { userId } = req.body;

      const sessionId = createChatId(userId);
      const session = await ChatSession.create({ sessionId, userId });

      // Update user's current session
      await User.findByIdAndUpdate(userId, {
        currentSessionId: sessionId,
      });

      this.sendSuccess(res, { sessionId, session });
    } catch (error) {
      this.handleError(error, res, 'Failed to create session');
    }
  }

  /**
   * Get a specific chat session by ID
   */
  async getSession(req: Request, res: Response) {
    // Define validation rules
    await param('id', 'Session ID must be provided')
      .isString()
      .not()
      .isEmpty()
      .trim()
      .run(req);

    // Check for validation errors
    if (!(await this.validateRequest(req, res))) return;

    try {
      const session = await ChatSession.findOne({ sessionId: req.params.id });
      if (!session) {
        return this.sendNotFound(res, 'Session not found');
      }

      this.sendSuccess(res, session);
    } catch (error) {
      this.handleError(error, res, 'Failed to fetch session');
    }
  }

  /**
   * Get or create current session for authenticated user
   */
  async getCurrentSession(req: Request, res: Response) {
    // Verify token first
    if (!(await this.verifyToken(req, res))) return;

    try {
      const userId = (req as any).userId;

      if (!userId) {
        return this.handleError(
          new Error('User not authenticated'),
          res,
          'User not authenticated',
          401
        );
      }

      // Check if user has current session
      const user = await User.findById(userId);

      let session;

      if (user?.currentSessionId) {
        // Try to get existing session using user's currentSessionId
        session = await ChatSession.findOne({
          sessionId: user.currentSessionId,
        });
      }

      // If no session exists, create a new one
      if (!session) {
        const sessionId = createChatId(userId);
        session = await ChatSession.create({ sessionId, userId });

        // Update user's current session
        await User.findByIdAndUpdate(userId, {
          currentSessionId: sessionId,
        });
      }

      this.sendSuccess(res, {
        sessionId: session.sessionId,
        session,
      });
    } catch (error) {
      this.handleError(error, res, 'Failed to get current session');
    }
  }
}
