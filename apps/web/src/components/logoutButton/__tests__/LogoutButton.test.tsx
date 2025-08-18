import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { useRouter } from 'next/navigation';

import LogoutButton from '../LogoutButton';

const mockLogout = jest.fn();
const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../services/auth/authService', () => ({
  logout: () => mockLogout(),
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockLogout.mockResolvedValue(undefined);
  });

  it('renders with default props', () => {
    render(<LogoutButton />);

    const button = screen.getByTestId('logout-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('Logout');
  });

  it('calls logout service and navigates on successful logout', async () => {
    render(<LogoutButton />);

    fireEvent.click(screen.getByTestId('logout-button'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).toHaveBeenCalledWith('/');
      expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
    });
  });

  it('handles logout service error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Logout failed');
    mockLogout.mockRejectedValue(error);

    render(<LogoutButton />);

    fireEvent.click(screen.getByTestId('logout-button'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Logout failed:', error);
    });

    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(mockRouter.refresh).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('does not navigate multiple times on multiple clicks', async () => {
    render(<LogoutButton />);

    const button = screen.getByTestId('logout-button');

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(3);
    });

    expect(mockRouter.push).toHaveBeenCalledTimes(3);
    expect(mockRouter.refresh).toHaveBeenCalledTimes(3);
  });
});
