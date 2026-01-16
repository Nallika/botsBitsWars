/**
 * Chat-related constants
 */

// Chat mode information mold
export type ChatModeInfo = {
  modeId: string;
  title: string;
  description: string;
  minBots: number;
  maxBots: number;
};

// CHat bot message, should be extended with metadata
export interface BotResponse {
  color: string;
  botName: string;
  content: string;
}

// Not used yet
export interface ChatContext {
  conversationHistory?: string[]; // temp
  systemPrompt?: string;
}
