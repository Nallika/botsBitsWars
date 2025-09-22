import React from 'react';

import styles from './styles.module.scss';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div data-testid="card" className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
