'use client';

import Card from 'apps/web/src/components/ui/Card/Card';
import styles from './page.module.scss';
import { SelectBox } from 'apps/web/src/components/ui';

/**
 * Chat page - authenticated users only
 * Renders ChatFrame component with authentication check
 */
export default function PreparePage() {
  const models = [
    {
      label: 'Chat GPT-4',
      value: 'chat-gpt-4',
    },
    {
      label: 'Chat GPT-3.5',
      value: 'chat-gpt-3-5',
    },
    {
      label: 'Chat GPT-3',
      value: 'chat-gpt-3',
    },
  ];

  return (
    <div className={styles.container}>
      <h1>Prepare your chat</h1>
      <Card>
        <p>Choose a model to start chatting with:</p>
        <SelectBox options={models} />
      </Card>
    </div>
  );
}
