import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardPage } from './index';

describe('DashboardPage', () => {
  it('renders the dashboard empty state', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { level: 1, name: '대시보드' })).toBeInTheDocument();
    expect(screen.getByText('표시할 데이터가 없습니다')).toBeVisible();
  });
});
