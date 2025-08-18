import React from 'react';
import styles from './styles.module.scss';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({ className, ...props }) => {
  const inputClasses = [styles.input, className || '']
    .filter(Boolean)
    .join(' ');

  return <input className={inputClasses} {...props} />;
};

export default Input;
