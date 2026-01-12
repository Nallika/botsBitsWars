'use client';

import React, { useEffect } from 'react';

import { Button } from '../../ui';
import { usePrepareChatStore } from '../../../stores/prepareChatStore';
import { AddBotLayout } from '../AddBotLayout/AddBotLayout';
import { SelectMode } from '../SelectMode/SelectMode';
import styles from './styles.module.scss';

export const PrepareChat: React.FC = () => {
  const {
    loading,
    error,
    loadPrepareChatData,
  } = usePrepareChatStore();

  useEffect(() => {
    loadPrepareChatData();
  }, [loadPrepareChatData]);

  const handleSubmit = (e: React.FormEvent) => {
    // TODO: Implement form submission logic
    console.log('Form submitted');
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