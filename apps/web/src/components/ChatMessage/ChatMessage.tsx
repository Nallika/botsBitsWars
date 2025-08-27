import React from 'react';
import type { ChatMessageType } from '@repo/shared-types';
import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Simple UI component for displaying a chat message bubble
 */
const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message }) => {
  const messageClasses = [
    styles.message,
    styles[message.sender], // 'user' or 'bot' specific styles
  ]
    .filter(Boolean)
    .join(' ');

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-UK', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={messageClasses} data-testid="chat-message">
      <div className={styles.bubble}>
        <div className={styles.content}>{message.content}</div>
        <div className={styles.timestamp}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
});

export default ChatMessage;
