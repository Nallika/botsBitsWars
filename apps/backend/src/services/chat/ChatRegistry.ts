import type { PROVIDERS_ENUM, CHAT_MODE_ENUM } from '@repo/shared-types';

import { ChatOrchestrator } from './ChatOrchestrator';
import { logger } from '../logger';
import { Socket } from 'socket.io';
import { SocketManager } from '../socket/SocketManager';

/**
 * Registry to manage ChatOrchestrator instances per session.
 * Handles creation, retrieval, and cleanup of orchestrators.
 */
export class ChatRegistry {
  private static map = new Map<string, ChatOrchestrator>();

  /**
   * Get or create ChatOrchestrator for a session
   */
  static createOrchestrator(
    sessionId: string,
    botIds: Array<PROVIDERS_ENUM>,
    modeId: CHAT_MODE_ENUM,
    socketManager: SocketManager
  ): ChatOrchestrator {
    if (this.map.get(sessionId)) {
      logger.warn('ChatOrchestrator already exists', { sessionId });
      this.removeOrchestrator(sessionId);
    }

    const orchestrator = new ChatOrchestrator(
      sessionId,
      botIds,
      modeId,
      socketManager
    );
    this.map.set(sessionId, orchestrator);

    logger.info('ChatOrchestrator created and stored', { sessionId });

    return orchestrator;
  }

  /**
   * Get existing ChatOrchestrator for a session
   */
  static getOrchestrator(sessionId: string): ChatOrchestrator | null {
    return this.map.get(sessionId) || null;
  }

  /**
   * Remove ChatOrchestrator for a session
   */
  static removeOrchestrator(sessionId: string): boolean {
    const removed = this.map.delete(sessionId);
    if (removed) {
      logger.info('ChatOrchestrator removed from registry', { sessionId });
    }
    return removed;
  }

  /**
   * Get all active session IDs
   */
  static getActiveSessions(): string[] {
    return Array.from(this.map.keys());
  }

  /**
   * Clean up all orchestrators (for testing or shutdown)
   */
  static clear(): void {
    this.map.clear();
    logger.info('All ChatOrchestrators cleared from registry');
  }
}
