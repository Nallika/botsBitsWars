import { BotMessage } from '@repo/shared-types';

import { ChatBot } from '../bot/ChatBot';
import { SocketManager } from '../socket/SocketManager';
import { DefaultChatMode, ChatModeRegistry } from '../chatMode';
import { logger } from '../logger';
import { CHAT_MODE_ENUM } from '../../types';

/**
 * Manages bot interactions for a specific chat session.
 * Each session has its own ChatOrchestrator instance.
 * Handles both bot orchestration and chat mode logic with RxJS message streaming.
 */
export class ChatOrchestrator {
  private sessionId: string;
  private bots: Array<ChatBot>;
  private modeId: string;
  private chatMode: DefaultChatMode;
  private socketManager: SocketManager;

  constructor(
    sessionId: string,
    bots: Array<ChatBot>,
    modeId: CHAT_MODE_ENUM,
    socketManager: SocketManager
  ) {
    this.sessionId = sessionId;
    this.modeId = modeId;
    this.chatMode = ChatModeRegistry.getMode(modeId);
    this.bots = bots;
    this.socketManager = socketManager;
  }

  // Initialize socket listener, setting up message streams and bot processing
  async initializeChat(): Promise<void> {
    try {
      const messageStream = this.socketManager.getMessageSubject(
        this.sessionId
      );

      this.chatMode.addBots(this.bots);
      this.chatMode.setupMessageProcessing(
        messageStream,
        this.handleBotResponse.bind(this)
      );
    } catch (error) {
      logger.error('Failed to initialize ChatOrchestrator', {
        sessionId: this.sessionId,
        error,
      });
      throw error;
    }
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
