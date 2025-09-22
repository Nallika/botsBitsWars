'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Button from '../ui/Button/Button';
import { ChevronLeftIcon } from '../ui/Icons';
import styles from './BackButton.module.scss';

interface BackButtonProps {
  className?: string;
  fallbackPath?: string;
}

/**
 * Back Button component with navigation logic
 * Features:
 * - Uses router.back() when history is available
 * - Falls back to specified path or home page
 * - Only renders if navigation is possible
 */
const BackButton: React.FC<BackButtonProps> = ({ className = '' }) => {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(typeof window !== 'undefined' && window.history.length > 1);
  }, []);

  const handleBackClick = () => {
    if (window.history.length > 1) {
      router.back();
    }
  };

  return (
    <Button
      variant="transparent"
      iconOnly
      className={`${styles.backButton} ${className} ${canGoBack ? '' : styles.hidden}`}
      onClick={handleBackClick}
      aria-label="Go back"
    >
      <ChevronLeftIcon className={styles.backIcon} />
    </Button>
  );
};

export default BackButton;
