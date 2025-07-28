import React from 'react';
import Modal from '../ui/Modal/Modal';
import AuthForm from '../molecules/AuthForm';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (data: { email: string; password: string }) => void;
  loading?: boolean;
  error?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onLogin, loading, error }) => (
  <Modal open={open} onClose={onClose}>
    <AuthForm mode="login" onSubmit={onLogin} loading={loading} error={error} />
  </Modal>
);

export default LoginModal; 