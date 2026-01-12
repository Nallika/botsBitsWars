'use client';

import React, { useState, useRef, useEffect } from 'react';

import { ChevronDownIcon } from '../Icons';
import styles from './styles.module.scss';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectBoxProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const SelectBox: React.FC<SelectBoxProps> = ({
  options,
  value,
  placeholder = 'Select option...',
  disabled = false,
  fullWidth = false,
  className,
  onChange,
  onFocus,
  onBlur,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(() => {
    if (!value) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  });

  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValues(Array.isArray(value) ? value : value ? [value] : []);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onBlur]);

  const handleToggle = () => {
    if (disabled) {
      return;
    }

    if (!isOpen) {
      onFocus?.();
    }

    setIsOpen(!isOpen);
  };

  const handleOptionClick = (optionValue: string) => {
    setSelectedValues([optionValue]);
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }

    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }

    return `${selectedValues.length} selected`;
  };

  const selectClasses = [
    styles.selectBox,
    disabled ? styles.disabled : '',
    fullWidth ? styles.fullWidth : '',
    isOpen ? styles.open : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={selectRef} className={selectClasses} data-testid="select-box">
      <div
        className={styles.trigger}
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <span className={styles.text}>{getDisplayText()}</span>
        <span className={styles.arrow}>
          <ChevronDownIcon />
        </span>
      </div>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          {options.map(option => (
            <div
              key={option.value}
              className={[
                styles.option,
                selectedValues.includes(option.value) ? styles.selected : '',
                option.disabled ? styles.optionDisabled : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() =>
                !option.disabled && handleOptionClick(option.value)
              }
              role="option"
              aria-selected={selectedValues.includes(option.value)}
            >
              <span className={styles.label}>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};