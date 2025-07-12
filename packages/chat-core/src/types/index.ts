// Chat-related types and interfaces
export interface ChatSession {
  id: string;
  userId: string;
  botIds: string[];
  status: 'active' | 'completed' | 'paused';
  currentRound: number;
  maxRounds: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  content: string;
  sender: 'user' | 'bot';
  botId?: string;
  timestamp: Date;
}

export interface BotResponse {
  botId: string;
  content: string;
  isComplete: boolean;
  timestamp: Date;
}
