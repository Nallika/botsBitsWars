export enum AuthFormMode {
  LOGIN = 'login',
  REGISTER = 'register',
}

export interface User {
  email: string;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'transparent';
  size?: 'flexible' | 'small' | 'medium' | 'big' | 'fullWidth';
  iconOnly?: boolean;
  className?: string;
}
