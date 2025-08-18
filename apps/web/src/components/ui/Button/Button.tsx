import React from 'react';

import { ButtonProps } from '../../../types';
import styles from './styles.module.scss';

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className,
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    fullWidth ? styles.fullWidth : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button data-testid="button" className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
