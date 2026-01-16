import {
  ChatContext,
  BotConfigSchemaField,
  BaseBotConfig,
} from '@repo/shared-types';

import { OpenAIError, OpenAIModels, OpenAIResponse } from '.';
import { ProviderConfig, PROVIDERS_ENUM } from '../../types';
import { BaseProvider } from '../base/BaseProvider';
import { OpenAI } from 'openai/client';
import { logger } from '../../services/logger';

/**
 * OpenAI bot implementation extending ChatBot
 */
export class OpenAIProvider extends BaseProvider {
  providerId: string = PROVIDERS_ENUM.OPENAI;

  private client: OpenAI;

  botConfigSchema: BotConfigSchemaField[] = [
    {
      name: 'name',
      defaultValue: 'chat-gpt',
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
      step: 0.1,
    },
    {
      name: 'context',
      defaultValue: '',
      type: 'string',
      min: 10,
      max: 500,
    },
  ];

  constructor() {
    super();
    const providerConfiguration = this.loadProviderConfiguration();

    this.client = new OpenAI({
      apiKey: providerConfiguration.apiKey,
      timeout: providerConfiguration.timeout,
    });
  }

  loadProviderConfiguration(): ProviderConfig {
    // First try to load from local .env file in this directory
    const localEnvPath = __dirname + '/.env';

    try {
      require('dotenv').config({ path: localEnvPath });
    } catch (error) {
      // Local .env file doesn't exist, that's okay
      logger.warn(
        'OpenAI local .env file not found, using global environment variables'
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'OpenAI API key not found. Please set OPENAI_API_KEY in environment variables or create .env file in vendors/openai/'
      );
    }

    return {
      apiKey,
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
      timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000'),
    };
  }

  /**
   * Send a chat completion request to OpenAI
   * @param prompt - User's message
   * @param context - Optional bot context for conversation history, etc.
   * @returns Promise resolving to OpenAI response
   */
  async sendChatCompletion({
    modelId,
    prompt,
    botConfig,
    context,
  }: {
    modelId: string;
    prompt: string;
    botConfig: BaseBotConfig;
    context?: ChatContext;
  }): Promise<OpenAIResponse> {
    try {
      // Build messages array
      const messages: OpenAI.ChatCompletionMessageParam[] = [];

      // Add system prompt if provided
      if (botConfig.context) {
        messages.push({
          role: 'system',
          // @ts-ignore
          content: botConfig.context,
        });
      }

      // @TODO
      // Add conversation history if provided
      // if (context?.conversationHistory) {
      //   for (const historyMessage of context.conversationHistory) {
      //     messages.push({
      //       role: historyMessage.sender === 'user' ? 'user' : 'assistant',
      //       content: historyMessage.content,
      //     });
      //   }
      // }

      // Add current prompt
      messages.push({
        role: 'user',
        content: prompt,
      });

      // Make API call
      const completion = await this.client.chat.completions.create({
        model: modelId,
        messages,
        temperature: botConfig.temperature as number,
        // @todo: enable it later
        // max_tokens: botConfig.maxTokens,
      });

      const choice = completion.choices[0];

      if (!choice?.message?.content) {
        throw this.createError(
          'api_error',
          'No response content received from OpenAI'
        );
      }

      return {
        content: choice.message.content,
        tokensUsed: {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0,
        },
        model: completion.model,
        finishReason: choice.finish_reason || 'unknown',
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if OpenAI API is available
   * @returns Promise resolving to true if available, false otherwise
   */
  async getAvailableModels(): Promise<OpenAIModels[]> {
    try {
      const availableIds = new Set<string>();

      // List models from the API and intersect with our supported set.
      const models = await this.client.models.list();
      for (const model of models.data) {
        availableIds.add(model.id);
      }

      const supported = Object.values(OpenAIModels);
      const available = supported.filter(modelId => availableIds.has(modelId));

      // Fallback to a sensible default order if the API response is empty.
      return available.length ? available : this.getDefaultModels();
    } catch (error) {
      logger.warn('OpenAI API availability check failed:', error);
      return this.getDefaultModels();
    }
  }

  /**
   * Default model preference list used when availability cannot be fetched.
   */
  private getDefaultModels(): OpenAIModels[] {
    return [
      OpenAIModels.GPT_4_O,
      OpenAIModels.GPT_4_O_MINI,
      OpenAIModels.GPT_4_TURBO,
      OpenAIModels.GPT_4,
      OpenAIModels.GPT_3_5_TURBO,
    ];
  }

  /**
   * Handle and normalize OpenAI API errors
   */
  private handleError(error: any): OpenAIError {
    // OpenAI SDK error handling
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return this.createError(
          'rate_limit',
          'Rate limit exceeded. Please try again later.'
        );
      }

      if (error.status === 401) {
        return this.createError(
          'api_error',
          'Invalid API key or authentication failed.'
        );
      }

      if (error.status >= 500) {
        return this.createError(
          'api_error',
          'OpenAI service is temporarily unavailable.'
        );
      }

      return this.createError(
        'api_error',
        error.message || 'OpenAI API error occurred.'
      );
    }

    // Network/timeout errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return this.createError('network', 'Network connection failed.');
    }

    if (error.code === 'ETIMEDOUT' || error.name === 'TimeoutError') {
      return this.createError('timeout', 'Request timed out.');
    }

    // Generic error fallback
    return this.createError(
      'api_error',
      error.message || 'Unknown error occurred.'
    );
  }

  /**
   * Create a standardized error object
   */
  private createError(
    type: OpenAIError['type'],
    message: string,
    code?: string
  ): OpenAIError {
    return {
      type,
      message,
      code,
    };
  }
}
