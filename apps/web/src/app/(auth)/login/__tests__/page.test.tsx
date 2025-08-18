import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { useRouter } from 'next/navigation';

import LoginPage from '../page';

const mockUseAuth = jest.fn();

jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/link', () => {
  return function MockedLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
};

function renderWithProvider(ui: React.ReactElement) {
  return render(ui);
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders login page correctly', () => {
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
      clearError: jest.fn(),
      loading: false,
      error: null,
    });

    renderWithProvider(<LoginPage />);

    expect(screen.getByText('Login')).toBeTruthy();
    expect(screen.getByText(/Don't have an account/)).toBeTruthy();
    expect(screen.getByText('Register here')).toBeTruthy();
    expect(screen.getByTestId('auth-form')).toBeTruthy();
  });

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
      clearError: jest.fn(),
      loading: true,
      error: null,
    });

    renderWithProvider(<LoginPage />);

    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('shows error state', () => {
    const errorMessage = 'Login failed';
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
      clearError: jest.fn(),
      loading: false,
      error: errorMessage,
    });

    renderWithProvider(<LoginPage />);

    expect(screen.getByText(errorMessage)).toBeTruthy();
  });

  it('calls clearError on mount', () => {
    const mockClearError = jest.fn();
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
      clearError: mockClearError,
      loading: false,
      error: null,
    });

    renderWithProvider(<LoginPage />);

    expect(mockClearError).toHaveBeenCalled();
  });

  it('handle successful login', async () => {
    const mockLogin = jest.fn().mockResolvedValue(true);
    const mockClearError = jest.fn();

    mockUseAuth.mockReturnValue({
      login: mockLogin,
      clearError: mockClearError,
      loading: false,
      error: null,
    });

    renderWithProvider(<LoginPage />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
      expect(mockRouter.push).toHaveBeenCalledWith('/');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('does not navigate when login fails', async () => {
    const mockLogin = jest.fn().mockResolvedValue(false);
    const mockClearError = jest.fn();

    mockUseAuth.mockReturnValue({
      login: mockLogin,
      clearError: mockClearError,
      loading: false,
      error: null,
    });

    renderWithProvider(<LoginPage />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
    });

    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });
});
