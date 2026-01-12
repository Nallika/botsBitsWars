import { BotSnapshot, BotResponse, ChatContext, BotConfigSchemaField } from '@repo/shared-types';

import { BaseBot } from './BaseBot';
import { OpenAIProvider, OpenAIError, OpenAIModels } from '../../vendors/openai';
import { PROVIDERS_ENUM } from './BotRegistry';
import { BaseBotConfig } from '../../types';

export interface OpenAIBotConfig {
  modelId: string;
  temperature: number;
  maxTokens: number;
  context?: string;
}

/**
 * OpenAI bot implementation extending BaseBot
 */
export class OpenAIBot extends BaseBot {
  private provider: OpenAIProvider;

  providerId: string = PROVIDERS_ENUM.OPENAI; 
  modelId: string;
  config: BaseBotConfig & OpenAIBotConfig;
  availableModels = Object.values(OpenAIModels);
  botConfigSchema: BotConfigSchemaField[] = [
    {
      name: 'modelId',
      defaultValue: 'gpt-3.5-turbo',
      type: 'string',
      hidden: true,
    },
    {
      name: 'color',
      defaultValue: '#10A37F',
      type: 'string',
      hidden: true,
    },
    {
      name: 'temperature',
      defaultValue: 0.7,
      type: 'number',
      min: 0.1,
      max: 1,
      step: 0.1
    },
    {
      name: 'context',
      defaultValue: '',
      type: 'string',
      min: 10,
      max: 500
    }
  ];

  constructor({modelId, config}: BotSnapshot) {
    super();
    this.provider = new OpenAIProvider();
    this.modelId = modelId;
    this.config = this.fillBotConfig(config || []) as BaseBotConfig & OpenAIBotConfig;
  }

  getSnapshot(): BaseBotConfig {
    return this.config as BaseBotConfig;
  }

  async sendMessage(
    prompt: string,
    context?: ChatContext
  ): Promise<BotResponse> {
    try {
      const config = {
        modelId: this.modelId,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      }
      const response = await this.provider.sendChatCompletion(prompt, config, context);
      const processingTime = this.provider.getLastProcessingTime();

      return {
        botName: this.config.name,
        color: this.config.color,
        content: response.content,
        processingTime,
      };
    } catch (error) {
      return this.handleError(error as OpenAIError);
    }
  }

  /**
   * Check if OpenAI is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await this.provider.checkAvailability();
    } catch (error) {
      console.warn('OpenAI availability check failed:', error);
      return false;
    }
  }

  /**
   * Handle OpenAI-specific errors and convert to generic BotResponse
   */
  private handleError(error: OpenAIError): BotResponse {
    // Log the detailed error for debugging
    console.error('OpenAI error:', error);

    // Return generic error messages to users
    let errorMessage: string;

    switch (error.type) {
      case 'rate_limit':
        errorMessage = "I'm currently busy. Please try again in a moment.";
        break;
      case 'timeout':
        errorMessage = "I'm taking too long to respond. Please try again.";
        break;
      case 'network':
        errorMessage = "I'm having connection issues. Please try again.";
        break;
      case 'invalid_request':
        errorMessage =
          "I couldn't understand your request. Please try rephrasing.";
        break;
      default:
        errorMessage = "I'm temporarily unavailable. Please try again later.";
    }

    return {
      color: this.config.color,
      botName: this.config.name,
      content: errorMessage,
      processingTime: this.provider.getLastProcessingTime(),
    };
  }
}
