import type { BotResponse, ChatContext, BotSnapshot, BotConfigField, BotInfo, BotConfigSchemaField } from '@repo/shared-types';
import { BaseBotConfig } from '../../types';

/**
 * Abstract base class for all chat bots.
 * Defines the interface that all bot implementations must follow.
 */
export abstract class BaseBot {

  abstract providerId: string;
  abstract modelId: string;
  abstract config: Partial<BaseBotConfig>;
  abstract availableModels: string[];
  abstract botConfigSchema: BotConfigSchemaField[];

  /**
   * Send a message to the bot and get a response.
   * @param prompt - The user's message/prompt
   * @param context - Optional context for the bot (future enhancement)
   * @returns Promise resolving to the bot's response
   */
  abstract sendMessage(
    prompt: string,
    context?: ChatContext
  ): Promise<BotResponse>;

  /**
   * Check if the bot is currently available for use.
   * @returns Promise resolving to true if bot is available, false otherwise
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * Get the current configuration of the bot.
   * @returns BotSnapshot object containing the bot's configuration
   */
  abstract getSnapshot(): BaseBotConfig;

  getSchema(): BotInfo {
    return {
      providerId: this.providerId,
      botsList: this.availableModels,
      botConfigSchema: this.botConfigSchema,
    };
  }

  fillBotConfig(config: BotConfigField[]): BaseBotConfig {
    const filledConfig: Partial<BaseBotConfig> = {
      providerId: this.providerId,
      modelId: this.modelId,
    };

    config.forEach(({name, value}) => {
      if (name in filledConfig) {
        (filledConfig as any)[name] = value;
      } else {
        console.warn(`Unknown config field: ${name}`);
      }
    });

    return filledConfig as BaseBotConfig;
  }

  // Future enhancements - optional methods for streaming and context management
  /**
   * Stream a message response from the bot (future enhancement).
   * @param prompt - The user's message/prompt
   * @param context - Optional context for the bot
   * @returns AsyncGenerator yielding response chunks
   */
  streamMessage?(prompt: string, context?: ChatContext): AsyncGenerator<string>;

  /**
   * Set conversation context for the bot (future enhancement).
   * @param context - The bot context to set
   */
  setContext?(context: ChatContext): void;

  /**
   * Get current bot context (future enhancement).
   * @returns Current bot context or null if none set
   */
  getContext?(): ChatContext | null;
}
