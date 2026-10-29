import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NoticeDetailPage } from './notice-detail-page';

const navigation = vi.hoisted(() => ({
  back: vi.fn<() => void>(),
  replace: vi.fn<(url: string) => void>(),
  canGoBack: vi.fn<() => boolean>(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => navigation,
  useParams: () => ({ noticeId: '1' }),
}));
vi.mock('@/app/navigation/navigation-history', () => ({
  useCanGoBack: () => ({ current: navigation.canGoBack }),
}));
beforeEach(() => vi.clearAllMocks());

describe('NoticeDetailPage', () => {
  it('과제 공지 상세(id="1")를 정상적으로 렌더링한다', () => {
    render(<NoticeDetailPage noticeId="1" />);

    // 헤더 카테고리 및 제목
    expect(screen.getAllByText('과제').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', { level: 1, name: '팀빌딩 소개서 작성' }),
    ).toBeInTheDocument();
    expect(screen.getByText('D-2')).toBeInTheDocument();
    expect(screen.getByText('2026.09.30 (수)')).toBeInTheDocument();

    // 제출 안내 메타 박스
    expect(screen.getByText('2026년 10월 01일 (금) 11:59까지')).toBeInTheDocument();
    expect(screen.getByText('PM, Designer')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /노션 페이지/ })).toHaveAttribute(
      'href',
      'https://notion.so',
    );

    // 본문 내용
    expect(
      screen.getByText(/팀빌딩 과정의 첫 번째 단계인 '팀빌딩 자기소개서' 제출 안내드립니다/),
    ).toBeInTheDocument();

    // 확인 섹션
    expect(screen.getByText('공지를 다 읽으셨나요?')).toBeInTheDocument();
    expect(screen.getByText('지금까지 13명이 확인했어요!')).toBeInTheDocument();
  });

  it('세션 공지 상세(id="3")를 정상적으로 렌더링하고 제출 메타 박스가 표시되지 않는다', () => {
    render(<NoticeDetailPage noticeId="3" />);

    expect(screen.getAllByText('세션').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', { level: 1, name: '5주차 개발-디자인 세션 공지' }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('제출 안내')).not.toBeInTheDocument();
    expect(
      screen.getByText(/이번 주 토요일 진행되는 5주차 개발-디자인 세션 안내드립니다/),
    ).toBeInTheDocument();
    expect(screen.getByText('지금까지 25명이 확인했어요!')).toBeInTheDocument();
  });

  it('"확인했어요" 버튼을 클릭하면 확인 상태 및 카운트가 토글된다', () => {
    render(<NoticeDetailPage noticeId="1" />);

    const confirmButton = screen.getByRole('button', { name: /확인했어요/ });
    expect(confirmButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('지금까지 13명이 확인했어요!')).toBeInTheDocument();

    // 확인하기 클릭
    fireEvent.click(confirmButton);
    expect(confirmButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('지금까지 14명이 확인했어요!')).toBeInTheDocument();

    // 취소 클릭
    fireEvent.click(confirmButton);
    expect(confirmButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('지금까지 13명이 확인했어요!')).toBeInTheDocument();
  });

  it('뒤로가기 버튼이 정상적으로 렌더링된다', () => {
    render(<NoticeDetailPage noticeId="1" />);

    const backButton = screen.getByRole('button', { name: '뒤로가기' });
    expect(backButton).toBeInTheDocument();
  });

  it('존재하지 않는 공지 ID일 경우 오류 화면(NoticeErrorPage)을 렌더링한다', () => {
    render(<NoticeDetailPage noticeId="unknown-id" />);

    expect(
      screen.getByRole('heading', { level: 1, name: '앗, 오류가 발생했어요!' }),
    ).toBeInTheDocument();
    expect(screen.getByText('잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
  });
});
