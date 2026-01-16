import { ChatMessageType, BotMessage } from '@repo/shared-types/src';
import { Observable } from 'rxjs';
import { ChatBot } from '../services';

export type tokenData = {
  id: string;
  email: string;
};

export enum CHAT_MODE_ENUM {
  DEFAULT = 'default',
}
export interface ChatModeInterface {
  bots: ChatBot[];
  addBots(bots: ChatBot[]): void;
  setupMessageProcessing(
    messageStream: Observable<ChatMessageType>,
    onBotResponse: (message: BotMessage) => void
  ): void;
}
export interface CompletionResponse {
  content: string;
}

export enum PROVIDERS_ENUM {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  ANTHROPIC = 'anthropic',
  PERPLEXITY = 'perplexity',
}

export type ProviderConfig = Record<string, any>;
