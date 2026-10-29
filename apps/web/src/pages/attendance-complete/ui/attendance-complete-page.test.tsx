import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AttendanceCompletePage } from './attendance-complete-page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn<() => void>(),
    push: vi.fn<(url: string) => void>(),
    replace: vi.fn<(url: string) => void>(),
  }),
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
