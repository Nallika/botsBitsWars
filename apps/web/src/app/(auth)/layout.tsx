'use client';

import Link from 'next/link';

import { Header } from '../../components/ui';
import { AuthProvider } from '../../components/auth';
import styles from './styles.module.scss';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <Header>
        <Link href="/" className={styles.headerTitle}>
          <h1>BotsBitsWars</h1>
        </Link>
      </Header>
      <AuthProvider>
        <main className={styles.contentWrapper}>
          <div className={styles.content}>{children}</div>
        </main>
      </AuthProvider>
    </div>
  );
}
