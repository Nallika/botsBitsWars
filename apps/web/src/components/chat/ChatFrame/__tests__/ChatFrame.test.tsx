import { render, screen } from '@testing-library/react';
import React from 'react';

import ChatFrame from '../ChatFrame';
import {
  mockChatStore,
  resetMockChatStore,
} from '../../../../stores/__mocks__/chatStore';

jest.mock('../../../stores/chatStore', () => ({
  useChatStore: (selector: any) => selector(mockChatStore),
}));

describe('ChatFrame', () => {
  beforeEach(() => {
    resetMockChatStore();
  });

  it('renders with correct structure and content', () => {
    render(<ChatFrame />);

    expect(screen.getByTestId('messages-list-empty')).toBeTruthy();
    expect(screen.getByTestId('chat-input')).toBeTruthy();
  });

  it('initializes chat on mount', () => {
    render(<ChatFrame />);

    expect(mockChatStore.initializeChat).toHaveBeenCalledTimes(1);
  });

  it('cleans up on unmount', () => {
    const { unmount } = render(<ChatFrame />);

    unmount();

    expect(mockChatStore.destroy).toHaveBeenCalledTimes(1);
  });
});
