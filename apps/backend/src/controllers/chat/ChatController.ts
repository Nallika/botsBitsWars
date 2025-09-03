import { Request, Response } from 'express';
import { param, body } from 'express-validator';

import {
  type PrepareChatResponse,
  type CreateSessionResponse,
  CHAT_MODE_ENUM,
} from '@repo/shared-types';

import { User } from '../../models/User';
import { createChatId } from '../../utils/helpers';
import { BaseController } from '../base/BaseController';
import { ChatSession } from '../../models/ChatSession';
import { BotRegistry } from '../../services/bot/BotRegistry';
import { ChatModeRegistry } from '../../services/chatMode';
import { ChatRegistry } from '../../services/chat/ChatRegistry';
import type { SocketManager } from '../../services/socket/SocketManager';

export class ChatController extends BaseController {
  private socketManager: SocketManager;

  constructor(socketManager: SocketManager) {
    super();
    this.socketManager = socketManager;
  }
  /**
   * Get available bots, chat modes for session setup.
   * GET /api/chat/prepare
   */
  async prepareChat(req: Request, res: Response) {
    if (!(await this.verifyToken(req, res))) return;

    try {
      const availableBots = await BotRegistry.getAvailableBots();
      const availableModes = ChatModeRegistry.getAvailableModes();

      this.sendSuccess<PrepareChatResponse>(res, {
        modes: availableModes,
        bots: availableBots,
      });
    } catch (error) {
      this.handleError(error, res, 'Failed to prepare chat configuration');
    }
  }

  /**
   * Create a new chat session with selected bots and mode.
   * POST /api/chat/sessions
   */
  async createSession(req: Request, res: Response) {
    if (!(await this.verifyToken(req, res))) return;

    // await body('botIds')
    //   .isArray({ min: 1 })
    //   .withMessage('At least one bot must be selected')
    //   .run(req);

    // await body('botIds.*')
    //   .isString()
    //   .trim()
    //   .notEmpty()
    //   .withMessage('Bot ID must be a non-empty string')
    //   .run(req);

    // await body('modeId')
    //   .isString()
    //   .trim()
    //   .notEmpty()
    //   .withMessage('Mode ID is required')
    //   .run(req);

    if (!(await this.validateRequest(req, res))) return;

    try {
      const { userId } = (req as any).body;
      const botIds = ['openai'];
      const modeId = CHAT_MODE_ENUM.DEFAULT;
      //const { botIds, modeId } = req.body;

      const sessionId = createChatId(userId);

      await ChatSession.create({
        sessionId,
        userId,
        botIds,
        modeId,
      });

      await User.findByIdAndUpdate(userId, {
        currentSessionId: sessionId,
      });

      const orchestrator = ChatRegistry.createOrchestrator(
        sessionId,
        botIds as any,
        modeId,
        this.socketManager
      );
      await orchestrator.initializeChat();

      this.sendSuccess<CreateSessionResponse>(res, {
        sessionId,
      });
    } catch (error) {
      this.handleError(error, res, 'Failed to create session');
    }
  }

  /**
   * @TODO: refactor this, this may be not needed
   * Get a specific chat session by ID with bot configuration.
   * GET /api/chat/sessions/:id
   */
  async getSession(req: Request, res: Response) {
    await param('id', 'Session ID must be provided')
      .isString()
      .not()
      .isEmpty()
      .trim()
      .run(req);

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
   * @TODO: refactor this, this may be not needed
   * Get or create current session for authenticated user.
   * GET /api/chat/sessions/current
   */
  async getCurrentSession(req: Request, res: Response) {
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
