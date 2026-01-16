import { BotSnapshot, ProviderInfo } from '@repo/shared-types';

import { ChatBot } from './ChatBot';
import { PROVIDERS_ENUM } from '../../types';
import { OpenAIProvider } from '../../vendors/openai';
import { BaseProvider } from '../../vendors/base/BaseProvider';
import { logger } from '../logger';

/**
 * Registry for managing bot instances system-wide.
 * Provides methods to register, retrieve, and query available bots.
 */
export class BotRegistry {
  /**
   * Cached provider instances keyed by provider ID.
   */
  private providers = new Map<PROVIDERS_ENUM, BaseProvider>();

  /**
   * Lazily instantiate and return a provider instance.
   */
  getProvider(providerId: PROVIDERS_ENUM): BaseProvider {
    if (!this.providers.has(providerId)) {
      switch (providerId) {
        case PROVIDERS_ENUM.OPENAI:
          this.providers.set(providerId, new OpenAIProvider());
          break;
        // TODO: Add other providers here (GeminiProvider, etc.)
        default:
          throw new Error(`Unsupported provider: ${providerId}`);
      }
    }

    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`);
    }

    return provider;
  }

  /**
   * Get a bot instance by provider ID.
   * @param provider - LLM provider for bot
   * @returns The bot instance or null if not found
   */
  createBot(botData: BotSnapshot): ChatBot {
    try {
      switch (botData.providerId) {
        // @TODO Add uniq bot class for each provider, hold there provider related types, structures, e.t.c.
        case PROVIDERS_ENUM.OPENAI:
          return new ChatBot({
            provider: this.getProvider(PROVIDERS_ENUM.OPENAI),
            modelId: botData.modelId,
            configurationFields: botData.botConfiguration || {},
          });
        // TODO: Add other providers here (GeminiBot, etc.)
        default:
          throw new Error(`Unsupported provider: ${botData.providerId}`);
      }
    } catch (error) {
      logger.error('Error creating bot:', error);
      throw error;
    }
  }

  // Retrieve information about all available providers and their bots
  async getAvailableProviders(): Promise<ProviderInfo[]> {
    return [await this.getProvider(PROVIDERS_ENUM.OPENAI).getProviderInfo()];
  }
}
