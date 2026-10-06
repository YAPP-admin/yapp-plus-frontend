import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockLogin } from './login.mock';

afterEach(() => vi.useRealTimers());

describe('개발용 모의 로그인', () => {
  it.each([
    ['admin-demo', 'demo-password', 'success'],
    ['unknown', 'demo-password', 'invalid-credentials'],
    ['admin-demo', 'wrong', 'invalid-credentials'],
  ])('400ms 뒤 자격 증명을 판정한다: %s / %s', async (username, password, status) => {
    vi.useFakeTimers();
    const resolved = vi.fn<() => void>();
    const result = mockLogin({ username, password });

    void result.then(resolved);
    await vi.advanceTimersByTimeAsync(399);

    expect(resolved).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);

    await expect(result).resolves.toEqual({ status });
  });
});
