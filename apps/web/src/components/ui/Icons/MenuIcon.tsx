import React from 'react';

interface MenuIconProps {
  className?: string;
  size?: number;
}

/**
 * Menu Icon component (hamburger menu)
 * Used for mobile menu buttons
 */
const MenuIcon: React.FC<MenuIconProps> = ({ className, size = 20 }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  );
};

export default MenuIcon;
