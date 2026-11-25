/** 최상위 오류 경계가 Provider 없이 복구 UI와 명시적 액션을 제공하는지 검증한다. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { JSX } from 'react';
import { expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './app-error-boundary';

function Thrower(): JSX.Element {
  throw new Error('렌더링 오류');
}

it('최상위 오류에서 새로고침과 홈 이동을 제공한다', async () => {
  const user = userEvent.setup();
  const reload = vi.spyOn(window.location, 'reload').mockImplementation(() => {});
  render(
    <AppErrorBoundary>
      <Thrower />
    </AppErrorBoundary>,
  );
  expect(screen.getByRole('heading', { level: 1, name: '앗, 오류가 발생했어요!' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: '새로고침' }));
  expect(reload).toHaveBeenCalledOnce();
  expect(screen.getByRole('link', { name: '홈으로 이동' })).toHaveAttribute('href', '/');
});
