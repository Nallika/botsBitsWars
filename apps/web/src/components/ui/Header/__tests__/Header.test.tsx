import { render, screen } from '@testing-library/react';
import React from 'react';

import Header from '../Header';

describe('Header', () => {
  it('renders with children content', () => {
    render(
      <Header>
        <h1>Page Title</h1>
        <nav>Navigation</nav>
      </Header>
    );

    const header = screen.getByTestId('header');
    expect(header).toBeTruthy();
    expect(screen.getByText('Page Title')).toBeTruthy();
    expect(screen.getByText('Navigation')).toBeTruthy();
  });
});
