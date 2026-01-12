import { BotInfo, BotSnapshot } from '@repo/shared-types';

import { BaseBot } from './BaseBot';
import { OpenAIBot } from './OpenAIBot';

export enum PROVIDERS_ENUM {
  OPENAI = 'openai',
}

/**
 * Registry for managing bot instances system-wide.
 * Provides methods to register, retrieve, and query available bots.
 */
export class BotRegistry {
  /**
   * @todo: probably should add configuration for bot
   *
   * Get a bot instance by provider ID.
   * @param provider - LLM provider for bot
   * @returns The bot instance or null if not found
   */
  static createBot(botData: BotSnapshot): BaseBot {
    try {
      switch (botData.providerId) {
      case PROVIDERS_ENUM.OPENAI:
        return new OpenAIBot(botData);
      // TODO: Add other providers here (GeminiBot, etc.)
      default:
        throw new Error(`Unsupported provider: ${botData.providerId}`);
      }
    } catch (error) {
      console.error('Error creating bot:', error);
      throw error;
    }
  }

  static getAvailableProviders(): BotInfo[] {
    // @TODO: refactor this
    const openAiBot = new OpenAIBot({
        providerId: PROVIDERS_ENUM.OPENAI,
        modelId: 'gpt-3.5-turbo',
        config: [],
      });
    
    return [
      openAiBot.getSchema(),
    ];
  }
}
