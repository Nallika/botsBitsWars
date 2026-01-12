'use client';

import { useRouter } from 'next/navigation';

import { ButtonProps } from '../../../types';
import { Button } from '../../ui';
import { logout } from '../../../services/auth/authService';

export const LogoutButton = ({
  variant = 'secondary',
  ...props
}: ButtonProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      data-testid="logout-button"
      variant="secondary"
      size="medium"
      {...props}
    >
      Logout
    </Button>
  );
};
