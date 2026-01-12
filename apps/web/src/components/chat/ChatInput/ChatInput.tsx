'use client';

import React, { useState } from 'react';
import { Input, Button } from '../../ui';
import { useChatStore } from '../../../stores/chatStore';
import styles from './ChatInput.module.scss';

/**
 * ChatInput organism component with Input and Button
 * Uses sendMessage from ChatContext as button click handler
 */
const ChatInput: React.FC = React.memo(() => {
  const [message, setMessage] = useState('');
  const connected = useChatStore(state => state.connected);
  const sendMessage = useChatStore(state => state.sendMessage);
  const error = useChatStore(state => state.error);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    try {
      sendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Let the error bubble up to be handled by error boundaries
      throw error;
    }
  };

  const isDisabled = !message.trim();

  return (
    <div className={styles.container} data-testid="chat-input">
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form className={styles.inputForm} onSubmit={handleSubmit}>
        <div className={styles.inputContainer}>
          <Input
            type="text"
            value={message}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setMessage(e.target.value)
            }
            placeholder={'Type your message...'}
            className={styles.messageInput}
            data-testid="message-input"
          />
        </div>

        <Button
          type="submit"
          disabled={isDisabled}
          className={styles.sendButton}
          data-testid="send-button"
        >
          Send
        </Button>
      </form>

      {/** Connection status indicator temp for development*/}
      <div className={styles.connectionStatus}>
        <span className={styles.statusText}>
          {!connected ? 'Initializing...' : 'Connected'}
        </span>
      </div>
    </div>
  );
});

export default ChatInput;
