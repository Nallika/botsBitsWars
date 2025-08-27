'use client';

import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import ChatMessage from '../ChatMessage/ChatMessage';
import styles from './MessagesList.module.scss';

/**
 * MessagesList component listens to messages from store
 * and renders ChatMessage components with auto-scroll
 */
const MessagesList: React.FC = React.memo(() => {
  const messages = useChatStore(state => state.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  };

  if (messages.length === 0) {
    return (
      <div className={styles.container} data-testid="messages-list-empty">
        <div className={styles.emptyState}>
          <p>Start a conversation by sending a message below.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.messagesList} data-testid="messages-list">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

export default MessagesList;
