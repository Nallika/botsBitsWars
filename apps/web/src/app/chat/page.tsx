import { redirect } from 'next/navigation';

import { isAuthenticated } from '../../services/auth/serverAuth';
import { ChatFrame } from '../../components';
import styles from './page.module.scss';

/**
 * Chat page - authenticated users only
 * Renders ChatFrame component with authentication check
 */
export default async function ChatPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/');
  }

  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        <ChatFrame />
      </div>
    </div>
  );
}
