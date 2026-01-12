/**
 * Chat-related constants
 */
export type ChatModeInfo = {
  modeId: string;
  title: string;
  description: string;
  minBots: number;
  maxBots: number;
};

export interface BotResponse {
  color: string;
  botName: string;
  content: string;
  processingTime: number;
}

export interface ChatContext {
  conversationHistory?: string[]; // temp
  systemPrompt?: string;
}

