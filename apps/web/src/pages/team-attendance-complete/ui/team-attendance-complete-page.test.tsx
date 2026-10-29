import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TeamAttendanceCompletePage } from './team-attendance-complete-page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn<() => void>(),
    push: vi.fn<(url: string) => void>(),
    replace: vi.fn<(url: string) => void>(),
  }),
}));

describe('TeamAttendanceCompletePage', () => {
  it('팀 세션 완료 정보와 확인 버튼을 정상적으로 렌더링한다', () => {
    render(<TeamAttendanceCompletePage />);

    expect(
      screen.getByRole('heading', { level: 1, name: '인증 사진을 올렸어요!' }),
    ).toBeInTheDocument();
    expect(screen.getByText('운영진이 승인하면 출석이 완료돼요')).toBeInTheDocument();
    expect(screen.getByText('Web 4팀 채소집')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '확인' })).toHaveAttribute('href', '/');
  });
});
