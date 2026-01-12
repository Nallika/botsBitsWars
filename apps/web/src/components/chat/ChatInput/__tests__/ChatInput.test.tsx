import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import ChatInput from '../ChatInput';
import {
  mockChatStore,
  resetMockChatStore,
} from '../../../../stores/__mocks__/chatStore';

jest.mock('../../../stores/chatStore', () => ({
  useChatStore: (selector: any) => selector(mockChatStore),
}));

describe('ChatInput', () => {
  beforeEach(() => {
    resetMockChatStore();
    console.error = jest.fn(); // Mock console.error
  });

  it('renders with connected state', () => {
    render(<ChatInput />);

    expect(screen.getByTestId('message-input')).toBeTruthy();
    expect(screen.getByTestId('send-button')).toBeTruthy();
    expect(screen.getByText('Send')).toBeTruthy();
    expect(screen.getByPlaceholderText('Type your message...')).toBeTruthy();
  });

  it('renders with disconnected state', () => {
    mockChatStore.connected = false;

    render(<ChatInput />);

    expect(screen.getByTestId('send-button').hasAttribute('disabled')).toBe(
      true
    );
  });

  it('displays error message when error exists', () => {
    mockChatStore.error = 'Connection failed';

    render(<ChatInput />);

    expect(screen.getByText('Connection failed')).toBeTruthy();
  });

  it('sends message on button click', async () => {
    render(<ChatInput />);

    const input = screen.getByTestId('message-input') as HTMLInputElement;
    const button = screen.getByTestId('send-button');

    fireEvent.change(input, { target: { value: 'Test text' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockChatStore.sendMessage).toHaveBeenCalledWith('Test text');
      expect(input.value).toBe('');
    });
  });

  it('trims whitespace from messages', async () => {
    render(<ChatInput />);

    const input = screen.getByTestId('message-input') as HTMLInputElement;
    const button = screen.getByTestId('send-button');

    fireEvent.change(input, { target: { value: '  trimmed message  ' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockChatStore.sendMessage).toHaveBeenCalledWith('trimmed message');
    });
  });

  it('does not send empty messages', () => {
    render(<ChatInput />);

    const input = screen.getByTestId('message-input') as HTMLInputElement;
    const button = screen.getByTestId('send-button');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(button);

    expect(mockChatStore.sendMessage).not.toHaveBeenCalled();
  });

  it('returns early when submitting whitespace-only message', () => {
    render(<ChatInput />);

    const input = screen.getByTestId('message-input') as HTMLInputElement;
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(form);

    expect(mockChatStore.sendMessage).not.toHaveBeenCalled();
    expect(input.value).toBe('   ');
  });
});
