/**
 * Bot-related types and interfaces
 */

// Bot config chema to provide to front
export interface BotConfigSchemaField {
  name: string;
  type: 'number' | 'string' | 'boolean';
  defaultValue?: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  hidden?: boolean;
}

export interface BotInfo {
  providerId: string;
  botsList: string[];
  botConfigSchema: BotConfigSchemaField[];
}

export interface BotConfigField {
  name: string;
  value: number | string | boolean;
}

// Generic version for type safety
export interface TypedBotConfigField<T extends Record<string, any>> {
  name: keyof T;
  value: T[keyof T];
}

export interface BotSnapshot {
  providerId: string;
  modelId: string;
  config?: BotConfigField[];
}