import React, { useState } from 'react';

import Input from '../ui/Input/Input';
import Button from '../ui/Button/Button';
import { AuthFormProps } from '../../types';

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {error && <div style={{ color: 'var(--color-error)', marginBottom: 8 }}>{error}</div>}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Register'}
      </Button>
    </form>
  );
};

export default AuthForm; 