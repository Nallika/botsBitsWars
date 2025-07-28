export type AuthFormMode = 'login' | 'register';

export interface AuthFormProps {
  mode: AuthFormMode;
  onSubmit: (data: { email: string; password: string }) => void;
  loading?: boolean;
  error?: string;
}
export interface User {
  email: string;
}