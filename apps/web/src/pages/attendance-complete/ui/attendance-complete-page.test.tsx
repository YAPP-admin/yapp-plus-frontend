import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AttendanceCompletePage } from './attendance-complete-page';

vi.mock('@stackflow/react', () => ({ useActivity: () => ({ isRoot: true }) }));

vi.mock('@stackflow/react/future', () => ({
  useFlow: () => ({
    pop: vi.fn<() => void>(),
    replace: vi.fn<(activityName: string, params: object) => void>(),
  }),
}));
vi.mock('@/app/navigation/tab-link', () => ({
  TabLink: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props} href="/?attendance=attended">
      {children}
    </a>
  ),
}));

describe('AttendanceCompletePage', () => {
  it('완료 메시지와 확인 버튼을 렌더링한다', () => {
    render(<AttendanceCompletePage />);

    expect(
      screen.getByRole('heading', { level: 1, name: '출석을 완료했어요!' }),
    ).toBeInTheDocument();
    expect(screen.getByText('출석 내역은 마이페이지에서 확인할 수 있어요')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '확인' })).toHaveAttribute(
      'href',
      '/?attendance=attended',
    );
  });
});
