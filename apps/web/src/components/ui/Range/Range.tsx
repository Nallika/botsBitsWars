'use client';

import React from 'react';

import styles from './styles.module.scss';

export interface RangeProps {
  value?: number;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  showValue?: boolean;
  className?: string;
  onChange?: (value: number) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLInputElement>) => void;
}

export const Range: React.FC<RangeProps> = ({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  label,
  disabled = false,
  fullWidth = false,
  showValue = true,
  className,
  onChange,
  onFocus,
  onBlur,
  onPointerUp,
  name,
}) => {
  // Ensure value is within bounds
  const clampedValue = Math.min(Math.max(value, min), max);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange?.(newValue);
  };

  const rangeClasses = [
    styles.range,
    disabled ? styles.disabled : '',
    fullWidth ? styles.fullWidth : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rangeClasses} data-testid="range">
      {label && (
        <div className={styles.header}>
          <label className={styles.label} htmlFor={`range-${label}`}>
            {label}
          </label>
          {showValue && <span className={styles.value}>{clampedValue}</span>}
        </div>
      )}

      <input
        id={label ? `range-${label}` : undefined}
        type="range"
        className={styles.slider}
        value={clampedValue}
        name={name}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onPointerUp={onPointerUp}
        aria-label={label || 'Range slider'}
      />

      {!label && showValue && (
        <div className={styles.valueOnly}>
          <span className={styles.value}>{clampedValue}</span>
        </div>
      )}
    </div>
  );
};
