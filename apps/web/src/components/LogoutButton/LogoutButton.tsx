'use client';

import { useRouter } from 'next/navigation';

import { ButtonProps } from '../../types';
import Button from '../ui/Button/Button';
import { logout } from '../../services/auth/authService';

export default function LogoutButton({
  variant = 'secondary',
  ...props
}: ButtonProps) {
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
      variant={variant}
      onClick={handleLogout}
      data-testid="logout-button"
      {...props}
    >
      Logout
    </Button>
  );
}
