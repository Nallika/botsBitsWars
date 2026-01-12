/**
 * OpenAI-specific types and interfaces
 */

export interface OpenAIConfig {
  apiKey: string;
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

export enum OpenAIModels {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_5 = 'GPT-5',
  GPT_4 = 'gpt-4',
  GPT_4_o = 'gpt-4o',
}
