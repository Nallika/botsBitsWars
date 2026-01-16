import { ChatOrchestrator } from './ChatOrchestrator';
import { logger } from '../logger';
import { SocketManager } from '../socket/SocketManager';
import { ChatBot } from '../bot';
import { CHAT_MODE_ENUM } from '../../types';

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
    bots: Array<ChatBot>,
    modeId: CHAT_MODE_ENUM,
    socketManager: SocketManager
  ): ChatOrchestrator {
    // Remove existing orchestrator to replace with new one
    if (this.map.get(sessionId)) {
      this.removeOrchestrator(sessionId);
    }

    const orchestrator = new ChatOrchestrator(
      sessionId,
      bots,
      modeId,
      socketManager
    );
    this.map.set(sessionId, orchestrator);

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
