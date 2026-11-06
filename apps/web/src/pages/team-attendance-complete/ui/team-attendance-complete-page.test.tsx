import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TeamAttendanceCompletePage } from './team-attendance-complete-page';

vi.mock('@stackflow/react', () => ({
  useActivity: () => ({ isRoot: true }),
  useFlow: () => ({
    pop: vi.fn<() => void>(),
    replace: vi.fn<(activityName: string, params: object) => void>(),
  }),
}));

vi.mock('@/app/navigation/tab-link', () => ({
  TabLink: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props} href="/">
      {children}
    </a>
  ),
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
