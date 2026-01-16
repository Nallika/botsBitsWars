'use client';

import React from 'react';

import { Button } from '../Button';
import { MenuIcon } from '../Icons';
import styles from './MenuButton.module.scss';

interface MenuButtonProps {
  className?: string;
  onClick?: () => void;
}

/**
 * Menu Button component for mobile navigation
 * Features:
 * - Hamburger menu icon
 * - Only visible on mobile devices
 * - Customizable onClick handler
 */
export const MenuButton: React.FC<MenuButtonProps> = ({
  className,
  onClick,
}) => {
  return (
    <Button
      variant="transparent"
      iconOnly
      className={`${styles.menuButton} ${className || ''}`}
      onClick={onClick}
      aria-label="Open menu"
    >
      <MenuIcon className={styles.menuIcon} />
    </Button>
  );
};
