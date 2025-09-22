import React from 'react';
import Link from 'next/link';

import { ButtonProps } from '../../../types';
import Button from './Button';

interface LinkButtonProps extends ButtonProps {
  href: string;
}

const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  href,
  ...props
}) => {
  return (
    <Link href={href} data-testid="link-button">
      <Button {...props}>{children}</Button>
    </Link>
  );
};

export default LinkButton;
