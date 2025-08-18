import React, { act } from 'react';
import { renderHook } from '@testing-library/react';

import { AuthProvider, useAuth } from '../AuthContext';

jest.mock('../../services/auth', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
}));

const authService = require('../../services/auth');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial state correctly', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('handles successful login', async () => {
    const mockUserData = { email: 'test@example.com' };
    authService.login.mockResolvedValue(mockUserData);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let success;
    await act(async () => {
      success = await result.current.login('test@example.com', 'password');
    });

    expect(success).toBe(true);
    expect(result.current.user).toEqual({ email: 'test@example.com' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials';
    authService.login.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const success = await result.current.login('test@example.com', 'password');
      expect(success).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('handles successful registration', async () => {
    const mockUserData = { email: 'test@example.com' };
    authService.register.mockResolvedValue(mockUserData);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const success = await result.current.register('test@example.com', 'password');
      expect(success).toBe(true);
    });

    expect(result.current.user).toEqual({ email: 'test@example.com' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
    expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('handles registration error', async () => {
    const errorMessage = 'Email already exists';
    authService.register.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const success = await result.current.register('test@example.com', 'password');
      expect(success).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('handles logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      result.current.login('test@example.com', 'password');
    });

    await act(async () => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('clears error when clearError is called', async () => {
    const errorMessage = 'Some error';
    authService.login.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.error).toBe(errorMessage);

    await act(async () => {
      result.current.clearError();
    });

    expect(result.current.error).toBe('');
  });

  it('throws error when useAuth is used outside of AuthProvider', () => {
    // Suppress console.error for this test since we expect an error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');

    // Restore console.error
    consoleSpy.mockRestore();
  });
});
