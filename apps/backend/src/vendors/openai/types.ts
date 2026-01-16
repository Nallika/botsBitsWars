/**
 * OpenAI-specific types and interfaces
 */

import { CompletionResponse } from '../../types';

export interface OpenAIConfig {
  apiKey: string;
  maxTokens: number;
  timeout: number;
}

export interface OpenAIBotConfig {
  modelId: string;
  temperature: number;
  maxTokens: number;
  context?: string;
}
export interface OpenAIResponse extends CompletionResponse {
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
  GPT_4 = 'gpt-4',
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_4_O = 'gpt-4o',
  GPT_4_O_MINI = 'gpt-4o-mini',
}
