/**
 * Manual test file for OpenAI integration
 * This is for development testing only - not part of the test suite
 *
 * To use:
 * 1. Create /vendors/openai/.env with your OPENAI_API_KEY
 * 2. Run: node -r esbuild-register src/test-openai.ts
 */

import { OpenAIBot } from '../../services/bot/OpenAIBot';

async function testOpenAIBot() {
  console.log('Testing OpenAI Bot integration...\n');

  const bot = new OpenAIBot();

  console.log('Bot details:');
  console.log(`- Provider ID: ${bot.providerId}`);
  console.log(`- Display Name: ${bot.displayName}`);
  console.log(`- Color: ${bot.color}`);
  console.log(`- Description: ${bot.description}\n`);

  // Test availability
  console.log('Checking availability...');
  try {
    const isAvailable = await bot.isAvailable();
    console.log(
      `Availability: ${isAvailable ? 'Available' : 'Not Available'}\n`
    );

    if (!isAvailable) {
      console.log(
        'Bot is not available. Please check your API key and configuration.'
      );
      return;
    }
  } catch (error) {
    console.error('Error checking availability:', error);
    return;
  }

  // Test simple message
  console.log('Sending test message...');
  try {
    const response = await bot.sendMessage(
      'Hello! Please respond with just "Hello there!" and nothing else.'
    );

    console.log('Response:');
    console.log(`- Success: ${response.success}`);
    console.log(`- Content: "${response.content}"`);
    console.log(`- Processing Time: ${response.processingTime}ms`);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testOpenAIBot().catch(console.error);
}
