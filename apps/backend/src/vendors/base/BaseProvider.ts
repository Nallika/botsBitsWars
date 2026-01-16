import {
  BotConfigSchemaField,
  ProviderInfo,
  ChatContext,
  BaseBotConfig,
} from '@repo/shared-types';
import { CompletionResponse, ProviderConfig } from '../../types';

/**
 * Provider refers to an LLM service provider (e.g., OpenAI, Gemini).
 * Proviers are responsible for handling communication with the LLM APIs.
 */
export abstract class BaseProvider {
  abstract providerId: string;
  abstract botConfigSchema: BotConfigSchemaField[];

  /**
   * Send a chat completion request and get the response.
   * @param prompt - User's message
   * @returns Promise resolving to completion response
   */
  abstract sendChatCompletion({
    modelId,
    prompt,
    botConfig,
    context,
  }: {
    modelId: string;
    prompt: string;
    botConfig: BaseBotConfig;
    context?: ChatContext;
  }): Promise<CompletionResponse>;
  /**
   * Retrieve currently available models
   */
  abstract getAvailableModels(): Promise<string[]>;

  /**
   * Return provider information including available bots and avalable bots configurations.
   */
  async getProviderInfo(): Promise<ProviderInfo> {
    return {
      providerId: this.providerId,
      botsList: await this.getAvailableModels(),
      botConfigSchema: this.botConfigSchema,
    };
  }
}
