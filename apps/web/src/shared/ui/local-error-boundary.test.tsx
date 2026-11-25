/** LocalErrorBoundary의 일반 복구와 상위 오류 위임을 Query 정책과 분리해 검증한다. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorBoundaryPolicyProvider } from './error-boundary-policy';
import { LocalErrorBoundary } from './local-error-boundary';

function Thrower({ error }: { error: Error | null }) {
  if (error) {
    throw error;
  }
  return <p>정상 콘텐츠</p>;
}

afterEach(() => vi.restoreAllMocks());

describe('LocalErrorBoundary', () => {
  it('일반 오류를 호출자가 제공한 fallback으로 바꾸고 수동 reset한다', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn<() => void>();
    function Subject() {
      const [error, setError] = useState<Error | null>(new Error('조회 실패'));
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setError(null);
              onReset();
            }}
          >
            다시 시도
          </button>
          <LocalErrorBoundary resetKeys={[error]} fallback={<p>지역 오류</p>}>
            <Thrower error={error} />
          </LocalErrorBoundary>
        </>
      );
    }
    render(<Subject />);
    expect(screen.getByText('지역 오류')).toBeVisible();
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(onReset).toHaveBeenCalledOnce();
    expect(screen.getByText('정상 콘텐츠')).toBeVisible();
  });

  it('정책이 지정한 오류는 지역 fallback에서 처리하지 않고 상위로 전달한다', () => {
    render(
      <ErrorBoundary fallback={<p>상위 오류</p>}>
        <ErrorBoundaryPolicyProvider policy={{ shouldRethrow: () => true }}>
          <LocalErrorBoundary fallback={<p>지역 오류</p>}>
            <Thrower error={new Error('인증 필요')} />
          </LocalErrorBoundary>
        </ErrorBoundaryPolicyProvider>
      </ErrorBoundary>,
    );
    expect(screen.getByText('상위 오류')).toBeVisible();
    expect(screen.queryByText('지역 오류')).not.toBeInTheDocument();
  });

  it('reset key 변경은 오류 상태만 다시 열고 정상 자식을 유지한다', () => {
    const { rerender } = render(
      <LocalErrorBoundary resetKeys={['첫 값']} fallback={<p>오류</p>}>
        <Thrower error={null} />
      </LocalErrorBoundary>,
    );
    const content = screen.getByText('정상 콘텐츠');
    rerender(
      <LocalErrorBoundary resetKeys={['다음 값']} fallback={<p>오류</p>}>
        <Thrower error={null} />
      </LocalErrorBoundary>,
    );
    expect(screen.getByText('정상 콘텐츠')).toBe(content);
  });
});
