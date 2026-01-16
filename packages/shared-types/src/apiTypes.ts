import { ProviderInfo } from './botsTypes';
import { ChatModeInfo } from './chatTypes';

// User type, stores in db
export interface User {
  id: string;
  email: string;
}
// @todo check is it needed, prbably can be used more than once if so?, mayve use LoginRequest/RegisterRequest instead ?
export type AuthData = {
  email: string;
  password: string;
};

// Base error response interface
export interface ErrorResponse {
  error: string;
}

// Specificly validation error response
export interface ApiValidationErrorResponse extends ErrorResponse {
  fieldErrors: Array<Record<string, string>>;
}

export interface LoginRequest {
  email: string;
  password: string;
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

// Response to prepare chat page that holds data to setup chat session
export interface ComposeChatResponse {
  availableModes: ChatModeInfo[];
  availableProviders: ProviderInfo[];
}

// Response to create new chat, "/chat" page

export interface CreateSessionResponse {
  sessionId: string;
}
