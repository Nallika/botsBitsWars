import { render, screen } from '@testing-library/react';
import React from 'react';

import ChatPage from '../page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('../../../services/auth/serverAuth', () => ({
  isAuthenticated: jest.fn(),
}));

const { redirect } = require('next/navigation');
const { isAuthenticated } = require('../../../services/auth/serverAuth');

function renderWithProvider(ui: React.ReactElement) {
  return render(ui);
}

describe('ChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders ChatFrame when authenticated', async () => {
    isAuthenticated.mockResolvedValue(true);

    const component = await ChatPage();
    renderWithProvider(component);

    expect(screen.getByTestId('chat-frame')).toBeTruthy();
  });

  it('redirects to home when not authenticated', async () => {
    isAuthenticated.mockResolvedValue(false);

    await ChatPage();

    expect(redirect).toHaveBeenCalledWith('/');
  });
});
