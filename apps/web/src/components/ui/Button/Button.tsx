import React from 'react';
import './Button.scss';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  ...props
}) => (
  <button
    className={`atom-btn atom-btn--${variant}${fullWidth ? ' atom-btn--full' : ''}`}
    {...props}
  >
    {children}
  </button>
);

export default Button; 