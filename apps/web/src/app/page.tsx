import { LinkButton, Header } from '../components/ui';
import { LogoutButton } from '../components/auth';
import { isAuthenticated } from '../services/auth/serverAuth';
import styles from './styles.module.scss';

export default async function HomePage() {
  const authenticated = await isAuthenticated();

  return (
    <div className={styles.container}>
      <Header>
        <h1 className={styles.headerTitle}>BotsBitsWars</h1>
      </Header>
      <main className={styles.contentWrapper}>
        <div className={styles.content}>
          {!authenticated ? (
            <>
              <LinkButton href="/login" size="medium">
                Login
              </LinkButton>
              <LinkButton href="/register" variant="secondary" size="medium">
                Register
              </LinkButton>
            </>
          ) : (
            <>
              <LinkButton href="/prepare" size="medium">
                Start Chat
              </LinkButton>
              <LogoutButton />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
