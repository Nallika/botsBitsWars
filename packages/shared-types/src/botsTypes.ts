/**
 * Bot-related types and interfaces
 */

// This represents bot configuration field, used for dynamic forms and validation
export interface BotConfigSchemaField {
  name: string;
  type: 'number' | 'string' | 'boolean';
  defaultValue: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  hidden?: boolean;
}

// Information about available bot provider and its bots
export interface ProviderInfo {
  providerId: string;
  botsList: string[];
  botConfigSchema: BotConfigSchemaField[];
}

// Abstractbot configuration field, can be extended for specific bot types
export interface BaseBotConfig {
  [key: string]: string | number | boolean;
}

// Snapshot that represents the bot's configuration, to hold in database and re-use when chat is re-loaded
export interface BotSnapshot {
  providerId: string;
  modelId: string;
  botConfiguration?: BaseBotConfig;
}
