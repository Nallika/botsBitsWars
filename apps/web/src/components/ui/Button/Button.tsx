import React from 'react';

import { ButtonProps } from '../../../types';
import styles from './styles.module.scss';

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'flexible',
  iconOnly = false,
  className,
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    iconOnly ? styles.iconOnly : '',
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
