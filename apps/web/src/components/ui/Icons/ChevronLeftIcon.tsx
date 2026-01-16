import React from 'react';

interface ChevronLeftIconProps {
  className?: string;
  size?: number;
}

/**
 * Chevron Left Icon component
 * Used for back navigation buttons
 */
export const ChevronLeftIcon: React.FC<ChevronLeftIconProps> = ({
  className,
  size = 20,
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
};
