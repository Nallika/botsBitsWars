import React from 'react';
import styles from './styles.module.scss';

type RadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Radio: React.FC<RadioProps> = ({ className, label, ...props }) => {
  const radioClasses = [styles.radio, className || '']
    .filter(Boolean)
    .join(' ');

  if (label) {
    return (
      <label className={styles.radioLabel}>
        <input type="radio" className={radioClasses} {...props} />
        <span className={styles.labelText}>{label}</span>
      </label>
    );
  }

  return <input type="radio" className={radioClasses} {...props} />;
};
