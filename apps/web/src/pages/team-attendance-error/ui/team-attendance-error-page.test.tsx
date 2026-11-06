import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TeamAttendanceErrorPage } from './team-attendance-error-page';

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

describe('TeamAttendanceErrorPage', () => {
  it('에러 메시지와 확인 버튼을 정상적으로 렌더링한다', () => {
    render(<TeamAttendanceErrorPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: '인증 사진을 업로드하지 못했어요' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/10MB 이하의 사진만 업로드할 수 있어요/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '확인' })).toHaveAttribute('href', '/');
  });
});
