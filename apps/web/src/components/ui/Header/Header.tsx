import React, { ReactNode } from 'react';

import styles from './Header.module.scss';

interface HeaderProps {
  children: ReactNode;
  className?: string;
}

/**
 * Simple Header UI component
 * Features:
 * - Fixed position at top
 * - Accepts any children for flexible layout
 * - Gradient background matching design system
 * - Responsive design
 */
const Header: React.FC<HeaderProps> = ({ children, className }) => {
  return (
    <header
      className={`${styles.header} ${className || ''}`}
      data-testid="header"
    >
      {children}
    </header>
  );
};

export default Header;
