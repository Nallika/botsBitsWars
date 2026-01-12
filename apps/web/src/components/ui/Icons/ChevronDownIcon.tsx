import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  className?: string;
}

export const ChevronDownIcon: React.FC<IconProps> = ({
  width = 12,
  height = 8,
  className,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 12 8"
    fill="none"
    className={className}
  >
    <path
      d="M1 1.5L6 6.5L11 1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);