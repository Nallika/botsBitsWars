import { render, screen } from '@testing-library/react';
import React from 'react';

import Card from '../Card';

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Test content</Card>);

    const card = screen.getByTestId('card');
    expect(card).toBeTruthy();
    expect(card.textContent).toBe('Test content');
    expect(card.className).toContain('card');
    expect(card.className).toContain('default');
    expect(card.className).toContain('padding-md');
  });

  it('forwards native div props', () => {
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick} id="test-card">
        Content
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveProperty('id', 'test-card');

    card.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
