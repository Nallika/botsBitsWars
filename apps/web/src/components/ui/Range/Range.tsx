'use client';

import React, { useState, useRef } from 'react';

import styles from './styles.module.scss';

export interface RangeProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  showValue?: boolean;
  className?: string;
  onChange?: (value: number) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const Range: React.FC<RangeProps> = ({
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
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Ensure value is within bounds
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  const handleChange = (newValue: number) => {
    if (disabled) {
      return;
    }

    const steppedValue = Math.round(newValue / step) * step;
    const clampedSteppedValue = Math.min(Math.max(steppedValue, min), max);

    if (clampedSteppedValue !== value) {
      onChange?.(clampedSteppedValue);
    }
  };

  const getValueFromPosition = (clientX: number): number => {
    if (!sliderRef.current) {
      return value;
    }

    const rect = sliderRef.current.getBoundingClientRect();
    const position = (clientX - rect.left) / rect.width;
    const newValue = min + position * (max - min);

    return newValue;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) {
      return;
    }

    setIsDragging(true);
    onFocus?.();

    const newValue = getValueFromPosition(e.clientX);
    handleChange(newValue);

    const handleMouseMove = (e: MouseEvent) => {
      const newValue = getValueFromPosition(e.clientX);
      handleChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onBlur?.();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) {
      return;
    }

    let newValue = clampedValue;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = clampedValue - step;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = clampedValue + step;
        break;
      case 'Home':
        e.preventDefault();
        newValue = min;
        break;
      case 'End':
        e.preventDefault();
        newValue = max;
        break;
      case 'PageDown':
        e.preventDefault();
        newValue = clampedValue - (max - min) * 0.1;
        break;
      case 'PageUp':
        e.preventDefault();
        newValue = clampedValue + (max - min) * 0.1;
        break;
      default:
        return;
    }

    handleChange(newValue);
  };

  const rangeClasses = [
    styles.range,
    disabled ? styles.disabled : '',
    fullWidth ? styles.fullWidth : '',
    isDragging ? styles.dragging : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rangeClasses} data-testid="range">
      {label && (
        <div className={styles.header}>
          <label className={styles.label}>{label}</label>
          {showValue && <span className={styles.value}>{clampedValue}</span>}
        </div>
      )}

      <div
        ref={sliderRef}
        className={styles.slider}
        onMouseDown={handleMouseDown}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clampedValue}
        aria-disabled={disabled}
        aria-label={label || 'Range slider'}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${percentage}%` }} />
        </div>
        <div className={styles.thumb} style={{ left: `${percentage}%` }} />
      </div>

      {!label && showValue && (
        <div className={styles.valueOnly}>
          <span className={styles.value}>{clampedValue}</span>
        </div>
      )}
    </div>
  );
};

export default Range;
