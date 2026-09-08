import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('HomePage', () => {
  it('renders the product identity', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 1, name: 'YAPP+' })).toBeInTheDocument();
    expect(screen.getByText('함께 만드는 순간을 더 가까이.')).toBeVisible();
  });
});
