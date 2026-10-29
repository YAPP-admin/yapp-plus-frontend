import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AlertsPage } from './alerts-page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn<() => void>(),
    push: vi.fn<(url: string) => void>(),
    replace: vi.fn<(url: string) => void>(),
  }),
}));

describe('AlertsPage', () => {
  it('알림 헤더와 목록을 정상적으로 렌더링한다', () => {
    render(<AlertsPage />);

    expect(screen.getByRole('heading', { level: 1, name: '알림' })).toBeInTheDocument();
    expect(screen.getByText(/내일 세션이 있어요/)).toBeInTheDocument();
    expect(screen.getByText('10월 1일')).toBeInTheDocument();
  });
});
