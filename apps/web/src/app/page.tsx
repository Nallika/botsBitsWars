'use client';

import { useState } from 'react';

import Button from '../components/ui/Button/Button';
import LoginModal from '../components/auth/LoginModal';
import RegisterModal from '../components/auth/RegisterModal';
import { useAuth } from '../context/AuthContext';

export default function IndexPage() {
  const { user, login, register, loading, error, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center' }}>
      <h1>Welcome to BotsBitsWars</h1>
      {!user ? (
        <>
          <Button onClick={() => setShowLogin(true)} fullWidth style={{ marginBottom: 8 }}>
            Login
          </Button>
          <Button onClick={() => setShowRegister(true)} variant="secondary" fullWidth>
            Register
          </Button>
        </>
      ) : (
        <>
          <Button fullWidth style={{ marginBottom: 8 }}>Start Chat</Button>
          <Button onClick={logout} variant="secondary" fullWidth>Logout</Button>
        </>
      )}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={async ({ email, password }) => {
          await login(email, password);
          setShowLogin(false);
        }}
        loading={loading}
        error={error || undefined}
      />
      <RegisterModal
        open={showRegister}
        onClose={() => setShowRegister(false)}
        onRegister={async ({ email, password }) => {
          await register(email, password);
          setShowRegister(false);
        }}
        loading={loading}
        error={error || undefined}
      />
    </div>
  );
}
