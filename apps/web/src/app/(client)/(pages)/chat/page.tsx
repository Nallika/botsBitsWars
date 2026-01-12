import { ChatFrame } from '../../../../components/chat';
import styles from './page.module.scss';

/**
 * Chat page - authenticated users only
 * Renders ChatFrame component with authentication check
 */
export default function ChatPage() {
  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        <ChatFrame />
      </div>
    </div>
  );
}
