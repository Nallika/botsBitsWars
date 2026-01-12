import { render, screen } from '@testing-library/react';
import React from 'react';

import MessagesList from '../MessagesList';
import {
  mockChatStore,
  resetMockChatStore,
  mockMessages,
} from '../../../../stores/__mocks__/chatStore';

jest.mock('../../../stores/chatStore', () => ({
  useChatStore: (selector: any) => selector(mockChatStore),
}));

describe('MessagesList', () => {
  beforeEach(() => {
    resetMockChatStore();
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('displays empty state when no messages', () => {
    mockChatStore.messages = [];

    render(<MessagesList />);

    expect(
      screen.getByText('Start a conversation by sending a message below.')
    ).toBeTruthy();
    expect(screen.queryByTestId('chat-message-1')).toBeFalsy();
  });

  it('renders messages in correct order', () => {
    mockChatStore.messages = mockMessages;

    render(<MessagesList />);

    const messagesList = screen.getAllByTestId('chat-message');

    expect(messagesList).toHaveLength(2);
    expect(messagesList[0].innerHTML).toContain(mockMessages[0].content);
    expect(messagesList[1].innerHTML).toContain(mockMessages[1].content);
  });
});
