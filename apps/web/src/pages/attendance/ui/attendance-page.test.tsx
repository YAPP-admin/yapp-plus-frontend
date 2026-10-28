import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AttendancePage } from './attendance-page';

const navigation = vi.hoisted(() => ({
  back: vi.fn<() => void>(),
  replace: vi.fn<(url: string) => void>(),
  canGoBack: vi.fn<() => boolean>(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => navigation,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/app/navigation/navigation-history', () => ({
  useCanGoBack: () => ({ current: navigation.canGoBack }),
}));

beforeEach(() => vi.clearAllMocks());

describe('AttendancePage', () => {
  it('출석 내역이 없을 때(none 모드) 세션 현황 0% 및 빈 상태 그래픽 문구를 렌더링한다', () => {
    render(<AttendancePage initialMode="none" />);

    expect(screen.getByRole('heading', { name: '출석 내역' })).toBeInTheDocument();
    expect(screen.getByText('세션 현황')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getAllByText('12회')).toHaveLength(2);
    expect(screen.getByText('아직 출석 내역이 없어요')).toBeInTheDocument();
    expect(screen.queryByText('10번 이상 결석하면 재적처리 될 수 있어요.')).not.toBeInTheDocument();
  });

  it('출석 중일 때(active 모드) 50% 진행률과 6개 세션 목록 및 상태 칩을 렌더링한다', () => {
    render(<AttendancePage initialMode="active" />);

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('5회')).toBeInTheDocument();

    const listSection = screen.getByRole('region', { name: '세션 출석 내역' });
    expect(within(listSection).getByText('개발-디자인 세션')).toBeInTheDocument();
    expect(within(listSection).getByText('팀세션')).toBeInTheDocument();
    expect(within(listSection).getByText('기획 세션')).toBeInTheDocument();
    expect(within(listSection).getByText('친바라 세션')).toBeInTheDocument();
    expect(within(listSection).getByText('팀빌딩')).toBeInTheDocument();
    expect(within(listSection).getByText('OT')).toBeInTheDocument();

    // 칩 렌더링 확인
    expect(within(listSection).getAllByText('결석')).toHaveLength(2);
    expect(within(listSection).getAllByText('지각')).toHaveLength(2);
    expect(within(listSection).getAllByText('출석')).toHaveLength(2);

    // 결석 2회이므로 경고 배너 미노출
    expect(screen.queryByText('10번 이상 결석하면 재적처리 될 수 있어요.')).not.toBeInTheDocument();
  });

  it('결석이 5회 이상이거나 warning 모드일 때 경고 배너를 표시한다', () => {
    render(<AttendancePage initialMode="warning" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('10번 이상 결석하면 재적처리 될 수 있어요.')).toBeInTheDocument();

    const listSection = screen.getByRole('region', { name: '세션 출석 내역' });
    expect(within(listSection).getByText('개발-디자인 세션')).toBeInTheDocument();
  });
});
