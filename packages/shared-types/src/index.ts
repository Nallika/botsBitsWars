export interface ChatMessageType {
  id: string;
  sessionId: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string; // ISO string
}

/**
 * Socket-related constants
 */
export enum SOCKET_EVENTS_ENUM {
  // Client to Server
  INPUT_MESSAGE = 'message:input',

  // Server to Client
  OUTPUT_MESSAGE = 'message:output',
  BOT_TYPING = 'notification:bot_typing',
  ERROR = 'chat:error',
  SESSION_CREATED = 'chat:session_created',
}

/**
 * Bot-related constants
 */
export enum CHAT_MODE_ENUM {
  DEFAULT = 'default',
}

export type ChatModeInfo = {
  modeId: string;
  title: string;
  description: string;
  minBots: number;
  maxBots: number;
};

/**
 * Bot-related constants
 */
export enum PROVIDERS_ENUM {
  OPENAI = 'openai',
}

// Enhanced message type for bot responses
export interface BotMessage extends ChatMessageType {
  sender: 'bot';
  botName: string;
  color: string;
  respondingToMessageId: string;
  processingTime?: number;
}

export interface BotInfo {
  providerId: string;
  name: string;
  color: string;
  description: string;
}

export interface BotResponse {
  color: string;
  botName: string;
  content: string;
  processingTime: number;
  success: boolean;
}

export interface BotContext {
  conversationHistory?: ChatMessageType[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
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

// Connection states
export enum CONNECTION_STATUS_ENUM {
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
export interface LoginResponse {
  email: string;
}

export interface RegisterResponse {
  email: string;
}

export interface PrepareChatResponse {
  modes: ChatModeInfo[];
  bots: BotInfo[];
}

export interface CreateSessionResponse {
  sessionId: string;
}
