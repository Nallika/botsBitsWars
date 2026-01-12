import OpenAI from 'openai';
import type { ChatContext } from '@repo/shared-types';
import { OpenAIConfigManager } from './config';
import { OpenAIResponse, OpenAIError, OpenAIModels } from './types';
import { OpenAIBotConfig } from '../../services/bot/OpenAIBot';

/**
 * OpenAI API provider - handles direct communication with OpenAI API
 */
export class OpenAIProvider {
  private client: OpenAI;
  private startTime: number = 0;

  constructor() {
    const config = OpenAIConfigManager.getConfig();

    this.client = new OpenAI({
      apiKey: config.apiKey,
      timeout: config.timeout,
    });
  }

  /**
   * Send a chat completion request to OpenAI
   * @param prompt - User's message
   * @param context - Optional bot context for conversation history, etc.
   * @returns Promise resolving to OpenAI response
   */
  async sendChatCompletion(
    prompt: string,
    config: OpenAIBotConfig,
    context?: ChatContext,
  ): Promise<OpenAIResponse> {
    try {
      this.startTime = Date.now();

      // Build messages array
      const messages: OpenAI.ChatCompletionMessageParam[] = [];

      // Add system prompt if provided
      if (context?.systemPrompt) {
        messages.push({
          role: 'system',
          content: context.systemPrompt,
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
        model: config.modelId,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
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
  async checkAvailability(): Promise<boolean> {
    try {
      // Simple test request to check API availability
      await this.client.chat.completions.create({
        model: OpenAIModels.GPT_3_5_TURBO,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      });

      return true;
    } catch (error) {
      console.warn('OpenAI API availability check failed:', error);
      return false;
    }
  }

  /**
   * Get processing time for the last request
   * @returns Processing time in milliseconds
   */
  getLastProcessingTime(): number {
    return this.startTime ? Date.now() - this.startTime : 0;
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
