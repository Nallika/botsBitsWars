import { render, screen } from '@testing-library/react';
import React from 'react';

import HomePage from '../page';

jest.mock('../../services/auth/serverAuth', () => ({
  isAuthenticated: jest.fn(),
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

jest.mock('../../components', () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
  LogoutButton: () => <button>Logout</button>,
}));

const { isAuthenticated } = require('../../services/auth/serverAuth');

function renderWithProvider(ui: React.ReactElement) {
  return render(ui);
}

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows login and register buttons when not authenticated', async () => {
    isAuthenticated.mockResolvedValue(false);

    const component = await HomePage();
    renderWithProvider(component);

    expect(screen.getByText(/login/i)).toBeTruthy();
    expect(screen.getByText(/register/i)).toBeTruthy();
  });

  it('shows logout button when authenticated', async () => {
    isAuthenticated.mockResolvedValue(true);

    const component = await HomePage();
    renderWithProvider(component);

    expect(screen.getByText(/logout/i)).toBeTruthy();
  });
});
