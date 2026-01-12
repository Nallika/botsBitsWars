import React from 'react';
import { render, screen } from '@testing-library/react';
import type { ChatMessageType } from '@repo/shared-types';

import { mockMessages } from '../../../../stores/__mocks__/chatStore';
import ChatMessage from '../ChatMessage';

describe('ChatMessage', () => {
  it('renders message correctly', () => {
    render(<ChatMessage message={mockMessages[0]} />);

    expect(screen.getByText(mockMessages[0].content)).toBeTruthy();
    expect(screen.getByText('12:00')).toBeTruthy();
  });
});
