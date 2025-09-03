import type { BotResponse, BotContext, BotInfo } from '@repo/shared-types';
import { BaseBot } from './BaseBot';
import { OpenAIProvider, OpenAIError } from '../../vendors/openai';

/**
 * OpenAI bot implementation extending BaseBot
 */
export class OpenAIBot extends BaseBot {
  readonly providerId = 'openai';
  readonly displayName = 'ChatGPT';
  readonly color = '#10A37F';
  readonly description = 'OpenAI GPT-3.5 Turbo';

  private provider: OpenAIProvider;

  constructor() {
    super();
    this.provider = new OpenAIProvider();
  }

  getInfo(): BotInfo {
    return {
      providerId: this.providerId,
      name: this.displayName,
      color: this.color,
      description: this.description,
    };
  }

  async sendMessage(
    prompt: string,
    context?: BotContext
  ): Promise<BotResponse> {
    try {
      const response = await this.provider.sendChatCompletion(prompt, context);
      const processingTime = this.provider.getLastProcessingTime();

      return {
        botName: this.displayName,
        color: this.color,
        content: response.content,
        processingTime,
        success: true,
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
      color: this.color,
      botName: this.displayName,
      content: errorMessage,
      processingTime: this.provider.getLastProcessingTime(),
      success: false,
    };
  }
}
