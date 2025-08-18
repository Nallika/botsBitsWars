'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { AuthData } from '@repo/shared-types/src';

import { AuthForm } from '../../../components';
import { useAuth } from '../../../context/AuthContext';
import styles from './styles.module.scss';

export default function LoginPage() {
  const { login, clearError, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    clearError();
  }, []);

  const handleLogin = async ({ email, password }: AuthData) => {
    const logged = await login(email, password);

    if (logged) {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className={styles.container}>
      <h1>Login</h1>
      <p>
        Don't have an account?&nbsp;
        <Link href="/register" className={styles.link}>
          Register here
        </Link>
      </p>

      <AuthForm onSubmit={handleLogin} loading={loading} error={error} />
    </div>
  );
}
