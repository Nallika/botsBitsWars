'use client';

import { Card } from 'apps/web/src/components/ui';
import { PrepareChat } from 'apps/web/src/components/composeChat';

import styles from './page.module.scss';

/**
 * Prepare chat page - authenticated users only
 * Allows users to configure chat settings before starting a session
 */
export default function PreparePage() {
  return (
    <div className={styles.container}>
      <h1>Prepare your chat</h1>
      <Card>
        <PrepareChat />
      </Card>
    </div>
  );
}
