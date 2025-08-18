import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import Button from '../Button';

jest.mock('../styles.module.scss', () => ({
  button: 'button',
  primary: 'primary',
  secondary: 'secondary',
  fullWidth: 'fullWidth',
}));

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByTestId('button');
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('Click me');
    expect(button.className).toContain('button primary');
  });

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByTestId('button');
    expect(button.className).toContain('secondary');
    expect(button.className).not.toContain('primary');
  });

  it('renders with fullWidth prop', () => {
    render(<Button fullWidth>Full Width</Button>);

    const button = screen.getByTestId('button');
    expect(button.className).toContain('fullWidth');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByTestId('button');
    expect(button.className).toContain('custom-class');
    expect(button.className).toContain('button primary');
  });

  it('forwards native button props', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled type="submit">
        Submit
      </Button>
    );

    const button = screen.getByTestId('button');
    expect(button).toHaveProperty('disabled', true);
    expect(button).toHaveProperty('type', 'submit');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByTestId('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
