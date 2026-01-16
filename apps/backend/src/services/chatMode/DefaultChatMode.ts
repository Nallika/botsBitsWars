import { Observable, Subscription, switchMap, from } from 'rxjs';

import {
  type BotResponse,
  ChatMessageType,
  BotMessage,
  ChatModeInfo,
} from '@repo/shared-types';

import { ChatBot } from '../bot';
import { generateMessageId } from '../../utils/helpers';
import { logger } from '../logger';
import { CHAT_MODE_ENUM, ChatModeInterface } from '../../types';

/**
 * Default chat mode implementation
 */
export class DefaultChatMode implements ChatModeInterface {
  // @todo should we hold it here ?
  static readonly modeId: CHAT_MODE_ENUM = CHAT_MODE_ENUM.DEFAULT;
  static readonly minBots: number = 1;
  static readonly maxBots: number = 5;
  static readonly title: string = 'Standard Chat';
  static readonly description: string =
    'All selected bots respond to each message';

  bots: ChatBot[] = [];
  private messageSubscription?: Subscription;

  static getModeInfo(): ChatModeInfo {
    return {
      modeId: this.modeId,
      title: this.title,
      description: this.description,
      minBots: this.minBots,
      maxBots: this.maxBots,
    };
  }

  addBots(bots: ChatBot[]): void {
    this.bots = bots;
  }

  setupMessageProcessing(
    messageStream: Observable<ChatMessageType>,
    onBotResponse: (message: BotMessage) => void
  ): void {
    this.messageSubscription = messageStream
      .pipe(
        switchMap(userMessage => from(this.processUserMessage(userMessage)))
      )
      .subscribe({
        next: botMessages => {
          // Emit each bot response individually
          botMessages.forEach(botMessage => onBotResponse(botMessage));
        },
        error: error => {
          logger.error('Error processing message in DefaultChatMode %s', error);
        },
      });
  }

  async processUserMessage(
    userMessage: ChatMessageType
  ): Promise<BotMessage[]> {
    const promises = this.bots.map(bot => bot.sendMessage(userMessage.content));

    const responses = await Promise.all(promises);

    return responses.map(res => this.parseBotResponse(res, userMessage));
  }

  parseBotResponse(
    response: BotResponse,
    userMessage: ChatMessageType
  ): BotMessage {
    return {
      id: generateMessageId(),
      sessionId: userMessage.sessionId ?? '',
      sender: 'bot',
      content: response.content ?? '',
      timestamp: new Date().toISOString(),
      botName: response.botName,
      color: response.color,
      respondingToMessageId: userMessage.id,
      // @todo return it
      // processingTime: response.processingTime,
    };
  }

  /**
   * Cleanup subscriptions when chat mode is destroyed,
   * @todo: call bots destroy here
   */
  destroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = undefined;
    }
  }
}
