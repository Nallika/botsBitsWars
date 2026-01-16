import type {
  BotResponse,
  ChatContext,
  BotSnapshot,
  BaseBotConfig,
} from '@repo/shared-types';
import { BaseProvider } from '../../vendors/base/BaseProvider';
import { logger } from '../logger';

export interface ChatBotInitParams {
  provider: BaseProvider;
  modelId: string;
  configurationFields: BaseBotConfig;
}

/**
 * Base class for all chat bots.
 * Defines the interface that all bot implementations must follow.
 */
export class ChatBot {
  protected provider: BaseProvider;
  protected modelId: string;
  protected botConfiguration: BaseBotConfig;

  protected startTime: number = 0;

  constructor({ provider, modelId, configurationFields }: ChatBotInitParams) {
    this.provider = provider;
    this.modelId = modelId;

    // Fill in configurations from received params and provider schema
    this.botConfiguration =
      this.parseBotConfigFields<BaseBotConfig>(configurationFields);
  }

  /**
   * Send a message to the bot and get a response.
   * @param prompt - The user's message/prompt
   * @param context - Optional context for the bot (future enhancement)
   * @returns Promise resolving to the bot's response
   */
  async sendMessage(
    prompt: string,
    context?: ChatContext
  ): Promise<BotResponse> {
    const { content } = await this.provider.sendChatCompletion({
      modelId: this.modelId,
      prompt,
      botConfig: this.botConfiguration,
      context,
    });

    return {
      botName: this.botConfiguration.name as string,
      color: this.botConfiguration.color as string,
      content,
    };
  }

  /**
   * Process configuration fields based on provider schema
   * Generic type for providing provider related config structure
   */
  parseBotConfigFields<C>(configurationFields: BaseBotConfig): C {
    const availableFields = this.provider.botConfigSchema.map(
      field => field.name
    );
    const filedNames = Object.keys(configurationFields);
    const parsedConfig: any = {};

    filedNames.forEach(name => {
      if (availableFields.includes(name)) {
        parsedConfig[name] = configurationFields[name];
      } else {
        logger.warn(`Unknown botConfiguration field: ${name}`);
      }
    });

    // Apply default values for missing fields
    this.provider.botConfigSchema.forEach(schemaField => {
      if (
        parsedConfig[schemaField.name] === undefined &&
        schemaField.defaultValue !== undefined
      ) {
        parsedConfig[schemaField.name] = schemaField.defaultValue;
      }
    });
    logger.info('---- parsedConfig :', { parsedConfig });
    return parsedConfig;
  }

  /**
   * Get the current configuration of the bot.
   * @returns BotSnapshot object containing the bot's configuration
   */
  getSnapshot(): BotSnapshot {
    return {
      providerId: this.provider.providerId,
      modelId: this.modelId,
      botConfiguration: this.botConfiguration,
    };
  }

  /**
   * Get processing time for the last request
   * @returns Processing time in milliseconds
   */
  getLastProcessingTime(): number {
    return this.startTime ? Date.now() - this.startTime : 0;
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
