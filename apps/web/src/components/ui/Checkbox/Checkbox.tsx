import React from 'react';

import { CheckIcon } from '../Icons';
import styles from './styles.module.scss';

export interface CheckboxProps {
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (checked: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  label,
  disabled = false,
  className,
  onChange,
  onFocus,
  onBlur,
}) => {
  const handleChange = () => {
    if (disabled) {
      return;
    }

    onChange?.(!checked);
  };

  const checkboxClasses = [
    styles.checkbox,
    disabled ? styles.disabled : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={checkboxClasses} data-testid="checkbox">
      <div
        className={[styles.box, checked ? styles.checked : '']
          .filter(Boolean)
          .join(' ')}
        onClick={handleChange}
        role="checkbox"
        tabIndex={disabled ? -1 : 0}
        aria-checked={checked}
        aria-disabled={disabled}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleChange();
          }
        }}
      >
        {checked && <CheckIcon className={styles.icon} />}
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};

export default Checkbox;
