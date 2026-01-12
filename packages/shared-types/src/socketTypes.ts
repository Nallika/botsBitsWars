
export enum CONNECTION_STATUS_ENUM {
  disconnected = 'disconnected',
  connecting = 'connecting',
  connected = 'connected',
  error = 'error',
}

export enum SOCKET_EVENTS_ENUM {
  // Client to Server
  INPUT_MESSAGE = 'message:input',

  // Server to Client
  OUTPUT_MESSAGE = 'message:output',
  BOT_TYPING = 'notification:bot_typing',
  ERROR = 'chat:error',
  SESSION_CREATED = 'chat:session_created',
}

export interface ChatMessageType {
  id: string;
  sessionId: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string; // ISO string
}

export interface BotMessage extends ChatMessageType {
  sender: 'bot';
  botName: string;
  color: string;
  respondingToMessageId: string;
  processingTime?: number;
}

export interface SocketError {
  error: string;
  code?: string;
  timestamp: string;
}
