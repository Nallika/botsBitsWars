'use client';

import React, { useEffect } from 'react';

import MessagesList from '../MessagesList/MessagesList';
import ChatInput from '../ChatInput/ChatInput';
import styles from './ChatFrame.module.scss';
import { useChatStore } from '../../stores/chatStore';

/**
 * ChatFrame organism component that wraps ChatInput and MessagesList
 * in ChatContext with proper styling
 */
const ChatFrame: React.FC = React.memo(() => {
  const initializeChat = useChatStore(state => state.initializeChat);
  const destroy = useChatStore(state => state.destroy);

  useEffect(() => {
    initializeChat();

    // Cleanup on unmount
    return () => {
      destroy();
    };
  }, [initializeChat, destroy]);

  return (
    <div className={styles.chatFrame} data-testid="chat-frame">
      <div className={styles.messagesContainer}>
        <MessagesList />
      </div>

      <div className={styles.inputContainer}>
        <ChatInput />
      </div>
    </div>
  );
});

export default ChatFrame;
