import { Request, Response } from 'express';
import { param, body } from 'express-validator';

import {
  ComposeChatResponse,
  CreateSessionResponse,
  BotSnapshot,
} from '@repo/shared-types';

import { User } from '../../models/User';
import { createChatId } from '../../utils/helpers';
import { BaseController } from '../base/BaseController';
import { ChatSession } from '../../models/ChatSession';
import { BotRegistry } from '../../services/bot/BotRegistry';
import { ChatModeRegistry } from '../../services/chatMode';
import { ChatRegistry } from '../../services/chat/ChatRegistry';
import type { SocketManager } from '../../services/socket/SocketManager';
import { CHAT_MODE_ENUM } from '../../types';

// Chat routes representation
export class ChatController extends BaseController {
  private socketManager: SocketManager;
  private botRegistry: BotRegistry;

  constructor(socketManager: SocketManager, botRegistry: BotRegistry) {
    super();
    this.socketManager = socketManager;
    this.botRegistry = botRegistry;
  }

  /**
   * Get available bots, chat modes for session setup.
   * GET /api/chat/compose
   */
  async getComposeChatData(req: Request, res: Response) {
    if (!(await this.verifyToken(req, res))) return;

    try {
      const availableProviders = await this.botRegistry.getAvailableProviders();
      const availableModes = ChatModeRegistry.getAvailableModes();

      this.sendSuccess<ComposeChatResponse>(res, {
        availableModes,
        availableProviders,
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

    await body('selectedBots')
      .isArray({ min: 1 })
      .withMessage('At least one bot must be selected')
      .run(req);

    await body('modeId')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Mode ID is required')
      .run(req);

    if (!(await this.validateRequest(req, res))) return;

    try {
      const { userId } = (req as any).body;

      // @todo add request typing
      const { selectedBots, modeId } = req.body as {
        selectedBots: BotSnapshot[];
        modeId: CHAT_MODE_ENUM;
      };

      // Full bot configuration that allow re-create in session
      const botsSnapshots: BotSnapshot[] = [];

      // Create bot instances and fill snapshots
      const bots = selectedBots.map(botData => {
        const bot = this.botRegistry.createBot(botData);
        botsSnapshots.push(bot.getSnapshot());
        return bot;
      });

      const sessionId = createChatId(userId);

      // Saving chat session to DB
      await ChatSession.create({
        sessionId,
        userId,
        botsSnapshots,
        modeId,
      });

      // Orchestrator holds chat session components, hold it in memory, re-create when needed
      const orchestrator = ChatRegistry.createOrchestrator(
        sessionId,
        bots,
        modeId,
        this.socketManager
      );

      // Actual chat socket initialization
      await orchestrator.initializeChat();

      // Update user's current session in DB
      await User.findByIdAndUpdate(userId, {
        currentSessionId: sessionId,
      });

      // Send just created session ID to the client
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
      const userId = (req as any).body.userId;

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
      });
    } catch (error) {
      this.handleError(error, res, 'Failed to get current session');
    }
  }
}
