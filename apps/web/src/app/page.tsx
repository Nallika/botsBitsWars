import Link from 'next/link';

import { Button, LogoutButton } from '../components';
import { isAuthenticated } from '../services/auth/serverAuth';
import styles from './styles.module.scss';

export default async function HomePage() {
  const authenticated = await isAuthenticated();

  return (
    <div className={styles.container}>
      <h1>This is server side page</h1>
      {!authenticated ? (
        <>
          <Link href="/login">
            <Button fullWidth className={styles.buttonSpacing}>
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary" fullWidth>
              Register
            </Button>
          </Link>
        </>
      ) : (
        <>
          <LogoutButton variant="secondary" fullWidth />
        </>
      )}
    </div>
  );
}
