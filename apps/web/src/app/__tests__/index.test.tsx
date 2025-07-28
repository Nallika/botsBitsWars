import { render, screen } from '@testing-library/react';
import React from 'react';

import { AuthProvider } from '../../context/AuthContext';
import IndexPage from '../page';

// Mock the useAuth hook
const mockUseAuth = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => mockUseAuth(),
}));

function renderWithProvider(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe('IndexPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows login and register buttons when not authenticated', () => {
    // Mock unauthenticated state
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    renderWithProvider(<IndexPage />);
    expect(screen.getByText(/login/i)).toBeTruthy();
    expect(screen.getByText(/register/i)).toBeTruthy();
  });

  it('shows Start Chat and Logout when authenticated', async () => {
    // Mock authenticated user context
    const user = { email: 'test@example.com' };
    mockUseAuth.mockReturnValue({
      user,
      loading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
    
    renderWithProvider(<IndexPage />);
    expect(screen.getByText(/start chat/i)).toBeTruthy();
    expect(screen.getByText(/logout/i)).toBeTruthy();
  });
}); 