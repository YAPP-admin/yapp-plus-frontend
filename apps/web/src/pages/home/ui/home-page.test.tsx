import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HomePage } from './home-page';

const mockPush = vi.fn<(url: string) => void>();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: vi.fn<() => void>(),
    push: mockPush,
    replace: vi.fn<(url: string) => void>(),
  }),
  useSearchParams: () => ({
    get: vi.fn<(name: string) => string | null>().mockReturnValue(null),
  }),
}));

afterEach(() => {
  vi.unstubAllEnvs();
  mockPush.mockClear();
});

describe('HomePage', () => {
  it('홈에 개발용 화면 목록 링크를 노출하지 않는다', () => {
    render(<HomePage />);
    expect(screen.queryByRole('link', { name: '개발용 화면 목록' })).not.toBeInTheDocument();
  });

  it('이번 주 공지 3개가 각각의 공지 상세 페이지로 연결된다', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: '5주차 개발-디자인 세션 공지' })).toHaveAttribute(
      'href',
      '/notices/3',
    );
    expect(screen.getByRole('link', { name: '뒷풀이 참석 여부 수요 조사' })).toHaveAttribute(
      'href',
      '/notices/4',
    );
    expect(screen.getByRole('link', { name: '운영진 공지 사항' })).toHaveAttribute(
      'href',
      '/notices/5',
    );
  });

  it('정기 세션과 팀 세션 모드를 토글할 수 있다', () => {
    render(<HomePage />);
    const toggleButton = screen.getByRole('button', { name: '팀 세션 화면으로 전환' });
    expect(toggleButton).toBeInTheDocument();

    // 팀 세션 전환
    fireEvent.click(toggleButton);
    expect(
      screen.getByRole('heading', { level: 2, name: '이번 주는 팀 세션이에요' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '인증 사진 올리기' })).toBeInTheDocument();
  });

  it('세션 정보, 주간 캘린더, 출석하기 버튼을 렌더링한다', () => {
    render(<HomePage />);
    expect(screen.getByText('DMC 첨단산업센터')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '이번 주는 유저 플로우 리뷰 세션이에요' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('주간 일정')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '출석하기' })).toBeInTheDocument();
  });

  it('일정 및 출결 보고 바로가기 카드와 툴팁을 제공한다', () => {
    render(<HomePage />);
    expect(screen.getByText('세션 시작 전에 미리 보고해 주세요')).toBeInTheDocument();
    const navigation = within(screen.getByRole('navigation', { name: '홈 바로가기' }));
    expect(navigation.getByRole('link', { name: '이번 달 전체 세션 확인하기' })).toHaveAttribute(
      'href',
      '/schedule',
    );
    expect(navigation.getByRole('button', { name: '출결 보고 미리하기' })).toBeInTheDocument();
  });

  it('출석하기 버튼 클릭 시 출석 코드 바텀시트가 열린다', () => {
    render(<HomePage />);
    const attendanceBtn = screen.getByRole('button', { name: '출석하기' });
    fireEvent.click(attendanceBtn);

    expect(screen.getByText('출석 코드를 입력해 주세요')).toBeInTheDocument();
    expect(screen.getByText('코드를 입력하면 출석이 완료돼요')).toBeInTheDocument();
  });

  it('출결 보고 버튼 클릭 시 출결 보고 바텀시트가 열린다', () => {
    render(<HomePage />);
    const reportBtn = screen.getByRole('button', { name: '출결 보고 미리하기' });
    fireEvent.click(reportBtn);

    expect(screen.getByText('출결을 보고해 주세요')).toBeInTheDocument();
    expect(screen.getByText('미리 알려주시면 점수 차감이 줄어들어요')).toBeInTheDocument();
  });

  it('이번 주 공지 목록을 제공한다', () => {
    render(<HomePage />);
    const section = screen.getByRole('region', { name: '이번 주 공지' });
    expect(
      within(section).getByRole('heading', { level: 2, name: '이번 주 공지' }),
    ).toBeInTheDocument();
    expect(within(section).getByText('5주차 개발-디자인 세션 공지')).toBeInTheDocument();
    expect(within(section).getByText('뒷풀이 참석 여부 수요 조사')).toBeInTheDocument();
    expect(within(section).getByText('운영진 공지 사항')).toBeInTheDocument();
  });
});
