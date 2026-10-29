import { expect, it, vi } from 'vitest';
import ky from 'ky';
import { login } from '../generated/sdk.gen';
import { createClient } from '../generated/client';

it('요청 interceptor가 바꾼 URL·method·body·headers와 fetch 옵션을 실제 Ky 전송까지 유지한다', async () => {
  const sent: Request[] = [];
  const fetcher = vi.fn<typeof fetch>().mockImplementation((input, init) => {
    sent.push(new Request(input, init));
    return Promise.resolve(Response.json({}));
  });
  const client = createClient({
    baseUrl: 'https://sdk.test',
    ky: ky.create({ fetch: fetcher }),
    credentials: 'omit',
  });
  const interceptor = vi.fn<(request: Request) => Request>().mockImplementation((request) => {
    expect(request.credentials).toBe('omit');
    return new Request('https://sdk.test/changed', {
      method: 'PUT',
      body: 'intercepted',
      headers: { 'X-Intercepted': 'yes' },
      credentials: 'include',
      cache: 'no-store',
      signal: request.signal,
    });
  });
  client.interceptors.request.use(interceptor);
  await login({
    client,
    body: { loginId: 'demo', password: 'demo' },
    headers: { 'X-Original': 'remove' },
    throwOnError: true,
  });
  expect(interceptor).toHaveBeenCalledTimes(1);
  expect(fetcher).toHaveBeenCalledTimes(1);
  const request = sent[0];
  expect(request?.url).toBe('https://sdk.test/changed');
  expect(request?.method).toBe('PUT');
  expect(await request?.text()).toBe('intercepted');
  expect(request?.headers.get('X-Intercepted')).toBe('yes');
  expect(request?.headers.has('X-Original')).toBe(false);
  expect(request?.credentials).toBe('include');
  expect(request?.cache).toBe('no-store');
});
