'use client';

import React, { useState } from 'react';

import Input from '../ui/Input/Input';
import Button from '../ui/Button/Button';
import styles from './styles.module.scss';

type AuthFormProps = {
  onSubmit: (data: { email: string; password: string }) => void;
  loading?: boolean;
  error?: string;
};

const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} data-testid="auth-form">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        data-testid="email-input"
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        data-testid="password-input"
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
      <Button
        type="submit"
        fullWidth
        disabled={loading}
        data-testid="submit-button"
      >
        {loading ? 'Loading...' : 'Submit'}
      </Button>
    </form>
  );
};

export default AuthForm;
