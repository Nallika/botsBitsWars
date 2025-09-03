import { CHAT_MODE_ENUM, ChatModeInfo } from '@repo/shared-types';

import { DefaultChatMode } from './DefaultChatMode';

/**
 * Registry for managing chat mode instances system-wide.
 */
export class ChatModeRegistry {
  /**
   * Get a mode instance by mode ID.
   * @param modeId - The unique mode ID of the mode
   * @returns The mode instance or null if not found
   */
  static getMode(modeId: CHAT_MODE_ENUM): DefaultChatMode {
    switch (modeId) {
      case CHAT_MODE_ENUM.DEFAULT:
        return new DefaultChatMode();
    }
  }

  /**
   * Get all registered mode instances.
   * @returns Array of all registered modes
   */
  static getAvailableModes(): ChatModeInfo[] {
    return [DefaultChatMode.getModeInfo()];
  }
}
