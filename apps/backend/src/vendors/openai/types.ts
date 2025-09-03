/**
 * OpenAI-specific types and interfaces
 */

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

export interface OpenAIResponse {
  content: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
  finishReason: string;
}

export interface OpenAIError {
  type: 'api_error' | 'rate_limit' | 'timeout' | 'network' | 'invalid_request';
  message: string;
  code?: string;
}

export enum OpenAIModel {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_4 = 'gpt-4',
  GPT_4_TURBO = 'gpt-4-turbo',
}
