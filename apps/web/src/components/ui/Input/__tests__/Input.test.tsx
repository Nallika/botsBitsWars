import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import Input from '../Input';

jest.mock('../styles.module.scss', () => ({
  input: 'input',
}));

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toBeTruthy();
    expect(input.className).toBe('input');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);

    const input = screen.getByRole('textbox');
    expect(input.className).toBe('input custom-class');
  });

  it('forwards native input props', () => {
    render(
      <Input
        type="email"
        placeholder="Enter email"
        required
        disabled
        value="test@example.com"
        data-testid="email-input"
      />
    );

    const input = screen.getByTestId('email-input') as HTMLInputElement;
    expect(input.type).toBe('email');
    expect(input.placeholder).toBe('Enter email');
    expect(input.required).toBe(true);
    expect(input.disabled).toBe(true);
    expect(input.value).toBe('test@example.com');
  });
});
