import React from 'react';
import Modal from '../ui/Modal/Modal';
import AuthForm from '../molecules/AuthForm';

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onRegister: (data: { email: string; password: string }) => void;
  loading?: boolean;
  error?: string;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ open, onClose, onRegister, loading, error }) => (
  <Modal open={open} onClose={onClose}>
    <AuthForm mode="register" onSubmit={onRegister} loading={loading} error={error} />
  </Modal>
);

export default RegisterModal; 