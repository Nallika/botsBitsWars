import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { useRouter } from 'next/navigation';

import RegisterPage from '../page';

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

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders register page correctly', () => {
    mockUseAuth.mockReturnValue({
      register: jest.fn(),
      clearError: jest.fn(),
      loading: false,
      error: null,
    });

    renderWithProvider(<RegisterPage />);

    expect(screen.getByText('Register to be able to login')).toBeTruthy();
    expect(screen.getByText(/Already have an account/)).toBeTruthy();
    expect(screen.getByText('Login here')).toBeTruthy();
    expect(screen.getByTestId('auth-form')).toBeTruthy();
  });

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({
      register: jest.fn(),
      clearError: jest.fn(),
      loading: true,
      error: null,
    });

    renderWithProvider(<RegisterPage />);

    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('shows error state', () => {
    const errorMessage = 'Registration failed';
    mockUseAuth.mockReturnValue({
      register: jest.fn(),
      clearError: jest.fn(),
      loading: false,
      error: errorMessage,
    });

    renderWithProvider(<RegisterPage />);

    expect(screen.getByText(errorMessage)).toBeTruthy();
  });

  it('calls clearError on mount', () => {
    const mockClearError = jest.fn();
    mockUseAuth.mockReturnValue({
      register: jest.fn(),
      clearError: mockClearError,
      loading: false,
      error: null,
    });

    renderWithProvider(<RegisterPage />);

    expect(mockClearError).toHaveBeenCalled();
  });

  it('handle successfull register', async () => {
    const mockRegister = jest.fn().mockResolvedValue(true);
    const mockClearError = jest.fn();

    mockUseAuth.mockReturnValue({
      register: mockRegister,
      clearError: mockClearError,
      loading: false,
      error: null,
    });

    renderWithProvider(<RegisterPage />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password');
      expect(mockRouter.push).toHaveBeenCalledWith('/');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('does not navigate when registration fails', async () => {
    const mockRegister = jest.fn().mockResolvedValue(false);
    const mockClearError = jest.fn();

    mockUseAuth.mockReturnValue({
      register: mockRegister,
      clearError: mockClearError,
      loading: false,
      error: null,
    });

    renderWithProvider(<RegisterPage />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.input(passwordInput, { target: { value: 'password' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });

    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });
});
