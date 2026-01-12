'use client';

import React from 'react';

import { SelectBox } from '../../ui';
import { useComposeChatStore } from '../../../stores/composeChatStore';
import styles from './styles.module.scss';

export const SelectMode: React.FC = () => {
  const {
    availableModes,
    selectedChatMode,
    selectChatMode,
  } = useComposeChatStore();

  const handleModeChange = (value: string) => {
    selectChatMode(value);
  };

  const formattedModes = availableModes.map(mode => ({
    value: mode.modeId,
    label: mode.title,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.formGroup}>
        <label htmlFor="chat-mode" className={styles.label}>
          Choose chat mode
        </label>
        <SelectBox
          options={formattedModes}
          value={selectedChatMode?.modeId}
          placeholder="Select a chat mode..."
          onChange={handleModeChange}
          data-testid="mode-select"
        />
      </div>

      {selectedChatMode && (
        <div className={styles.modeDescription} data-testid="mode-description">
          <p>{selectedChatMode.description}</p>
          <p>
            Bots required: {selectedChatMode.minBots}
            {selectedChatMode.minBots !== selectedChatMode.maxBots && ` - ${selectedChatMode.maxBots}`}
          </p>
        </div>
      )}
    </div>
  );
};