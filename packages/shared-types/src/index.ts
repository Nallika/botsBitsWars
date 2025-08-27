export interface ChatMessageType {
  id: string;
  sessionId: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string; // ISO string
  botId?: string; // For future bot integration
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
export type AuthData = {
  email: string;
  password: string;
};

// Socket-related types
export interface SocketError {
  error: string;
  code?: string;
  timestamp: string;
}

export interface SendMessagePayload {
  content: string;
  sessionId: string;
}

// Connection states
export enum ConnectionStatus {
  disconnected = 'disconnected',
  connecting = 'connecting',
  connected = 'connected',
  error = 'error',
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export interface ApiValidationErrorResponse extends ApiErrorResponse {
  fieldErrors: Array<Record<string, string>>;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

// Auth response types
export interface LoginResponse {
  email: string;
}

export interface RegisterResponse {
  email: string;
}
