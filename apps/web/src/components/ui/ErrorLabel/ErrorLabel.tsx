import React from 'react';

import styles from './styles.module.scss';

export interface ErrorLabelProps {
  error?: string;
  className?: string;
}

export const ErrorLabel: React.FC<ErrorLabelProps> = ({ error, className }) => {
  if (!error) {
    return null;
  }

  const errorClasses = [styles.errorLabel, className || '']
    .filter(Boolean)
    .join(' ');

  return (
    <span data-testid="error-label" className={errorClasses} role="alert">
      {error}
    </span>
  );
};
