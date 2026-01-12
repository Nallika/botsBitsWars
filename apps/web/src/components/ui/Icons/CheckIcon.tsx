import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  className?: string;
}

export const CheckIcon: React.FC<IconProps> = ({
  width = 12,
  height = 9,
  className,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 12 9"
    fill="none"
    className={className}
  >
    <path
      d="M1 4.5L4.5 8L11 1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
