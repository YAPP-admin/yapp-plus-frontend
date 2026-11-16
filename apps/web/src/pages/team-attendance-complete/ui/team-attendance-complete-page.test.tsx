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
    render(
      <TeamAttendanceCompletePage
        receipt={{
          photoId: 7,
          status: 'PENDING',
          submittedAt: '2026-11-16T05:25:00Z',
          teamName: '검증용 팀',
          members: [{ membershipId: 2, name: '검증 참석자', positionLabel: 'Web' }],
        }}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: '인증 사진을 올렸어요!' }),
    ).toBeInTheDocument();
    expect(screen.getByText('운영진이 승인하면 출석이 완료돼요')).toBeInTheDocument();
    expect(screen.getByText('검증용 팀')).toBeInTheDocument();
    expect(screen.getByText('검증 참석자')).toBeInTheDocument();
    expect(screen.getByText('1명')).toBeInTheDocument();
    expect(
      screen.getByText(new Date('2026-11-16T05:25:00Z').toLocaleString('ko-KR')),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '확인' })).toHaveAttribute('href', '/');
  });
});
