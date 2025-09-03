import { OpenAIConfig, OpenAIModel } from './types';

/**
 * OpenAI configuration settings
 */
export class OpenAIConfigManager {
  private static config: OpenAIConfig | null = null;

  /**
   * Get OpenAI configuration
   */
  static getConfig(): OpenAIConfig {
    if (!this.config) {
      this.config = this.loadConfig();
    }

    return this.config;
  }

  /**
   * Load configuration from environment or local config
   */
  private static loadConfig(): OpenAIConfig {
    // First try to load from local .env file in this directory
    const localEnvPath = __dirname + '/.env';

    try {
      require('dotenv').config({ path: localEnvPath });
    } catch (error) {
      // Local .env file doesn't exist, that's okay
      console.warn(
        'OpenAI local .env file not found, using global environment variables'
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'OpenAI API key not found. Please set OPENAI_API_KEY in environment variables or create .env file in vendors/openai/'
      );
    }

    return {
      apiKey,
      model: process.env.OPENAI_MODEL || OpenAIModel.GPT_3_5_TURBO,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
      timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000'), // 30 seconds
    };
  }

  /**
   * Update configuration (for future model switching)
   */
  static updateConfig(updates: Partial<OpenAIConfig>): void {
    this.config = {
      ...this.getConfig(),
      ...updates,
    };
  }
}
