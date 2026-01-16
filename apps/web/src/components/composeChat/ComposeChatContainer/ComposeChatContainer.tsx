'use client';

import React, { useEffect } from 'react';

import { Button } from '../../ui';
import { useComposeChatStore } from '../../../stores/composeChatStore';
import { AddBotLayout } from '../AddBotLayout/AddBotLayout';
import { SelectMode } from '../SelectMode/SelectMode';
import styles from './styles.module.scss';
import { useRouter } from 'next/navigation';

/**
 * Main component for composing a new chat session.
 * Loads available chat modes and bot providers on mount.
 * Allows selecting chat mode, adding/configuring bots, and starting a new chat session.
 */
export const ComposeChatContainer: React.FC = () => {
  const router = useRouter();
  const { loading, error, loadComposeChatData, startNewChat } =
    useComposeChatStore();

  useEffect(() => {
    loadComposeChatData();
  }, [loadComposeChatData]);

  const handleSubmit = async () => {
    const sessionId = await startNewChat();

    // Navigate to chat interface if session was created successfully
    if (sessionId) {
      router.push('/chat');
      router.refresh();
    }
  };

  if (loading) {
    return <div>Loading chat modes...</div>;
  }

  return (
    <div data-testid="prepare-chat-form">
      <SelectMode />
      <AddBotLayout />

      {error && (
        <div className={styles.errorMessage} data-testid="error-message">
          {error}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        size="fullWidth"
        data-testid="submit-button"
      >
        {loading ? 'Loading...' : 'Continue'}
      </Button>
    </div>
  );
};
