import type { BotResponse, BotContext } from '@repo/shared-types';

/**
 * Abstract base class for all chat bots.
 * Defines the interface that all bot implementations must follow.
 */
export abstract class BaseBot {
  abstract readonly providerId: string;
  abstract readonly displayName: string;
  abstract readonly color: string;
  abstract readonly description: string;

  /**
   * Send a message to the bot and get a response.
   * @param prompt - The user's message/prompt
   * @param context - Optional context for the bot (future enhancement)
   * @returns Promise resolving to the bot's response
   */
  abstract sendMessage(
    prompt: string,
    context?: BotContext
  ): Promise<BotResponse>;

  /**
   * Check if the bot is currently available for use.
   * @returns Promise resolving to true if bot is available, false otherwise
   */
  abstract isAvailable(): Promise<boolean>;

  // Future enhancements - optional methods for streaming and context management
  /**
   * Stream a message response from the bot (future enhancement).
   * @param prompt - The user's message/prompt
   * @param context - Optional context for the bot
   * @returns AsyncGenerator yielding response chunks
   */
  streamMessage?(prompt: string, context?: BotContext): AsyncGenerator<string>;

  /**
   * Set conversation context for the bot (future enhancement).
   * @param context - The bot context to set
   */
  setContext?(context: BotContext): void;

  /**
   * Get current bot context (future enhancement).
   * @returns Current bot context or null if none set
   */
  getContext?(): BotContext | null;
}
