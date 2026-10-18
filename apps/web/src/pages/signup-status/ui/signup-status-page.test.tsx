import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SignupStatusPage } from './signup-status-page';

describe('SignupStatusPage', () => {
  it('운영진 승인 대기 안내를 표시한다', () => {
    const { container } = render(<SignupStatusPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: '운영진 승인을 기다리고 있어요...' }),
    ).toBeInTheDocument();
    expect(screen.getByText('승인 완료까지 잠시만 기다려 주세요')).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
