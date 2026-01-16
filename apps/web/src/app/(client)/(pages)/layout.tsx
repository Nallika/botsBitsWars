'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { BackButton, Header, MenuButton } from '../../../components/ui';
import styles from './styles.module.scss';
import { check } from '../../../services/auth';

export default function LoggedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    check().then(isAuthenticated => {
      if (!isAuthenticated) {
        router.push('/');
      }
    });
  }, [router]);

  return (
    <div className={styles.container}>
      <Header>
        <BackButton />
        <Link href="/" className={styles.headerTitle}>
          <h1>BotsBitsWars</h1>
        </Link>
        <MenuButton />
      </Header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
