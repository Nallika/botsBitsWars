import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import AuthForm from '../AuthForm';

jest.mock('../styles.module.scss', () => ({
  errorMessage: 'errorMessage',
}));

describe('AuthForm', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    loading: false,
    error: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with email and password inputs', () => {
    render(<AuthForm {...defaultProps} />);

    expect(screen.getByTestId('email-input')).toBeTruthy();
    expect(screen.getByTestId('password-input')).toBeTruthy();
    expect(screen.getByTestId('submit-button')).toBeTruthy();
  });

  it('shows loading text and disables button when loading', () => {
    render(<AuthForm {...defaultProps} loading={true} />);

    expect(screen.getByText('Loading...')).toBeTruthy();

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveProperty('disabled', true);
  });

  it('displays error message when error is provided', () => {
    const errorMessage = 'Login failed';
    render(<AuthForm {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeTruthy();
  });

  it('submits form with email and password values', async () => {
    const mockOnSubmit = jest.fn();
    render(<AuthForm {...defaultProps} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
