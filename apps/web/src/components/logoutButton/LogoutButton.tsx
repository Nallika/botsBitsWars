'use client';

import { useRouter } from 'next/navigation';

import { ButtonProps } from '../../types';
import Button from '../ui/Button/Button';
import { logout } from '../../services/auth/authService';

export default function LogoutButton({
  variant = 'secondary',
  fullWidth = false,
  className,
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
      fullWidth={fullWidth}
      className={className}
      onClick={handleLogout}
      data-testid="logout-button"
    >
      Logout
    </Button>
  );
}
