export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string; // ISO string
}

export interface ChatSessionInfo {
  sessionId: string;
  userId: string;
  bots: string[]; // Placeholder for bot IDs
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
export interface User {
  id: string;
  email: string;
}
