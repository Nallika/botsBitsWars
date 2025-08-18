'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { AuthData } from '@repo/shared-types/src';

import { AuthForm } from '../../../components';
import { useAuth } from '../../../context/AuthContext';
import styles from './styles.module.scss';

export default function RegisterPage() {
  const { register, clearError, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    clearError();
  }, []);

  const handleRegister = async ({ email, password }: AuthData) => {
    const registered = await register(email, password);

    if (registered) {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className={styles.container}>
      <h1>Register to be able to login</h1>
      <p>
        Already have an account?{' '}
        <Link href="/login" className={styles.link}>
          Login here
        </Link>
      </p>
      <AuthForm onSubmit={handleRegister} loading={loading} error={error} />
    </div>
  );
}
