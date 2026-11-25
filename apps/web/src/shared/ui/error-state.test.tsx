/** 오류 안내의 표시 계약과 복구 액션을 Provider 없이 검증한다. */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorState } from './error-state';

describe('ErrorState', () => {
  it('페이지형은 안전한 기본 안내와 장식 그림만 표시한다', () => {
    const fallbackProps = { error: new Error('비공개 서버 오류'), componentStack: '내부 경로' };
    render(<ErrorState {...fallbackProps} variant="page" onRetry={vi.fn<() => void>()} />);

    const alert = screen.getByRole('alert');
    expect(within(alert).getByRole('heading', { level: 2 })).toHaveTextContent(
      '앗, 오류가 발생했어요!',
    );
    expect(within(alert).getByText('잠시 후 다시 시도해 주세요.')).toBeVisible();
    expect(within(alert).getByRole('presentation')).toHaveAttribute('alt', '');
    expect(within(alert).queryByRole('img')).not.toBeInTheDocument();
    expect(alert.outerHTML).not.toMatch(/비공개 서버 오류|내부 경로/);
    expect(within(alert).queryByRole('link')).not.toBeInTheDocument();
  });

  it('영역형은 그림 없이 조회 대상과 호출자가 지정한 제목 계층을 표시한다', () => {
    render(
      <ErrorState
        variant="section"
        title="프로필을 불러오지 못했어요"
        titleAs="h3"
        description="연결 상태를 확인해 주세요."
        onRetry={vi.fn<() => void>()}
      />,
    );
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      '프로필을 불러오지 못했어요',
    );
    expect(screen.getByText('연결 상태를 확인해 주세요.')).toBeVisible();
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
  });

  it('폼 안에서도 재시도는 제출하지 않고 키보드로 호출한다', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn<() => void>();
    const onSubmit = vi.fn<(event: FormEvent) => void>((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ErrorState variant="section" onRetry={onRetry} />
      </form>,
    );
    expect(onRetry).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole('button', { name: '다시 시도' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('최종 복구용 액션 문구와 홈 링크를 명시적으로 제공할 수 있다', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn<() => void>();
    render(
      <ErrorState
        variant="page"
        titleAs="h1"
        onRetry={onRetry}
        retryLabel="새로고침"
        secondaryAction={{ label: '홈으로 이동', href: '/' }}
      />,
    );
    await user.click(screen.getByRole('button', { name: '새로고침' }));
    expect(onRetry).toHaveBeenCalledOnce();
    await user.tab();
    expect(screen.getByRole('link', { name: '홈으로 이동' })).toHaveFocus();
    expect(screen.getByRole('link', { name: '홈으로 이동' })).toHaveAttribute('href', '/');
  });
});
