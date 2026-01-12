import { BotInfo } from "./botsTypes";
import { ChatModeInfo } from "./chatTypes";

export interface User {
  id: string;
  email: string;
}

export type AuthData = {
  email: string;
  password: string;
};

export interface ErrorResponse {
  error: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiValidationErrorResponse extends ErrorResponse {
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

export interface PrepareChatData {
  modes: ChatModeInfo[];
  bots: BotInfo[];
}

export interface CreateSessionResponse {
  sessionId: string;
}
