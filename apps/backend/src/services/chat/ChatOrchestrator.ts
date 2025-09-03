import { CHAT_MODE_ENUM, BotMessage, PROVIDERS_ENUM } from '@repo/shared-types';

import { BaseBot } from '../bot/BaseBot';
import { BotRegistry } from '../bot/BotRegistry';
import { SocketManager } from '../socket/SocketManager';
import { DefaultChatMode, ChatModeRegistry } from '../chatMode';
import { logger } from '../logger';

/**
 * Manages bot interactions for a specific chat session.
 * Each session has its own ChatOrchestrator instance.
 * Handles both bot orchestration and chat mode logic with RxJS message streaming.
 */
export class ChatOrchestrator {
  private sessionId: string;
  private bots: Map<string, BaseBot> = new Map();
  private modeId: string;
  private chatMode: DefaultChatMode;
  private socketManager: SocketManager;

  constructor(
    sessionId: string,
    botIds: Array<PROVIDERS_ENUM>,
    modeId: CHAT_MODE_ENUM,
    socketManager: SocketManager
  ) {
    this.sessionId = sessionId;
    this.modeId = modeId;
    this.chatMode = ChatModeRegistry.getMode(modeId);
    this.socketManager = socketManager;

    botIds.forEach(botId => {
      const bot = BotRegistry.createBot(botId);
      if (bot) {
        this.bots.set(botId, bot);
      }
    });
  }

  async initializeChat(): Promise<void> {
    const messageStream = this.socketManager.getMessageSubject(this.sessionId);

    this.chatMode.initializeBots(Array.from(this.bots.values()));
    this.chatMode.setupMessageProcessing(
      messageStream,
      this.handleBotResponse.bind(this)
    );

    logger.info('ChatOrchestrator initialized successfully', {
      sessionId: this.sessionId,
      botCount: this.bots.size,
      modeId: this.modeId,
    });
  }

  /**
   * Handle bot response and emit via socket
   */
  public handleBotResponse(botMessage: BotMessage): void {
    this.socketManager.sendMessageToSession(this.sessionId, botMessage);
  }

  /**
   * Cleanup resources when orchestrator is destroyed
   */
  public destroy(): void {
    this.chatMode.destroy();
    this.socketManager.removeMessageSubject(this.sessionId);

    logger.info('ChatOrchestrator destroyed', { sessionId: this.sessionId });
  }
}
