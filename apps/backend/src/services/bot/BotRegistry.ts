import { BotInfo, PROVIDERS_ENUM } from '@repo/shared-types';

import { BaseBot } from './BaseBot';
import { OpenAIBot } from './OpenAIBot';

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
  static createBot(provider: PROVIDERS_ENUM): BaseBot | null {
    switch (provider) {
      case PROVIDERS_ENUM.OPENAI:
        return new OpenAIBot();
      // TODO: Add other providers here (GeminiBot, etc.)
      default:
        return null;
    }
  }

  static createListOfBots(providers: PROVIDERS_ENUM[]): BaseBot[] | null {
    return providers
      .map(provider => this.createBot(provider))
      .filter((bot): bot is BaseBot => bot !== null);
  }

  /**
   * @TODO: Implement actual availability checks and different bot in provider
   */
  static getAvailableBots(): BotInfo[] {
    return [
      {
        providerId: PROVIDERS_ENUM.OPENAI,
        name: 'OpenAI',
        color: '#00A1F1',
        description: 'OpenAI GPT-3 powered chatbot',
      },
    ];
  }
}
