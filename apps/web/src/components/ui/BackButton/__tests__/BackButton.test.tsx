import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { useRouter } from 'next/navigation';

import BackButton from '../BackButton';

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('BackButton', () => {
  // Mock window.history
  const originalHistory =
    typeof window !== 'undefined' ? window.history : undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Reset window.history mock only if window exists
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'history', {
        writable: true,
        value: { length: 2 },
      });
    }
  });

  afterEach(() => {
    // Restore original history only if window exists
    if (typeof window !== 'undefined' && originalHistory) {
      Object.defineProperty(window, 'history', {
        writable: true,
        value: originalHistory,
      });
    }
  });

  it('renders correctly with default props', async () => {
    render(<BackButton />);

    await waitFor(() => {
      const button = screen.getByTestId('button');
      expect(button).toBeTruthy();
      expect(button.getAttribute('aria-label')).toBe('Go back');
      expect(button.className).toContain('transparent');
      expect(button.className).toContain('iconOnly');
    });
  });

  it('hides button when history length <= 1', async () => {
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'history', {
        writable: true,
        value: { length: 1 },
      });
    }

    render(<BackButton />);

    await waitFor(() => {
      const button = screen.getByTestId('button');
      expect(button.className).toContain('hidden');
    });
  });

  it('calls router.back() when history is available', async () => {
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'history', {
        writable: true,
        value: { length: 3 },
      });
    }

    render(<BackButton />);

    await waitFor(() => {
      const button = screen.getByTestId('button');
      fireEvent.click(button);
      expect(mockRouter.back).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});
