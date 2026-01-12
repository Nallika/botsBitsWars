'use client';

import React from 'react';

import { Card } from '../../ui';
import { usePrepareChatStore } from '../../../stores/prepareChatStore';
import { BotForm } from '../BotForm/BotForm';
import { Button } from '../../ui/Button';
import styles from './styles.module.scss';

export const AddBotLayout: React.FC = () => {
  const {
    addNewBot,
    selectedChatMode,
    selectedBots,
  } = usePrepareChatStore();

  const showAddButton = selectedChatMode && selectedChatMode.maxBots > selectedBots.length;

  return (
    <Card>
      {selectedBots.map((botData) => (
        <BotForm key={botData.botId} botData={botData} />
      ))}
      {showAddButton && (
        <Button variant="transparent" size="small" onClick={() => addNewBot()} className={styles.button}>
          {'New Bot'}
        </Button>
      )}
    </Card>
  );
};