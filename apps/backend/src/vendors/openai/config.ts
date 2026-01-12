import { OpenAIConfig, OpenAIModelss } from './types';

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
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
      timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000'),
    };
  }
}
