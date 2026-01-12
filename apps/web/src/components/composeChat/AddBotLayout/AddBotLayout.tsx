'use client';

import React from 'react';

import { Card } from '../../ui';
import { useComposeChatStore } from '../../../stores/composeChatStore';
import { BotForm } from '../BotForm/BotForm';
import { Button } from '../../ui/Button';
import styles from './styles.module.scss';

/**
 * Layout component that allows user add new bots based on selected chat mode
 * Display bot forms, add new form
 */
export const AddBotLayout: React.FC = () => {
  const {
    addNewBot,
    selectedChatMode,
    selectedBots,
  } = useComposeChatStore();

  const showAddButton = selectedChatMode && selectedChatMode.maxBots > selectedBots.length;

  return (
    <Card>
      {selectedBots.map((botData) => (
        <BotForm key={botData.botId} botData={botData} />
      ))}
      {showAddButton && (
        <Button variant="transparent" size="small" onClick={addNewBot} className={styles.button}>
          {'New Bot'}
        </Button>
      )}
    </Card>
  );
};