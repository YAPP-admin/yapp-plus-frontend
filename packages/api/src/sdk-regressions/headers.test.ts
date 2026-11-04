import { describe, expect, it, vi } from 'vitest';
import ky from 'ky';
import { login } from '../generated/sdk.gen';
import { createClient } from '../generated/client';

const body = { loginId: 'demo', password: 'demo' };

describe('SDK 요청 헤더 전달', () => {
  it.each([
    ['record', { 'X-Request': 'retained', Authorization: 'Bearer explicit' }],
    ['Headers', new Headers({ 'X-Request': 'retained', Authorization: 'Bearer explicit' })],
    [
      'tuple',
      [
        ['X-Request', 'retained'],
        ['Authorization', 'Bearer explicit'],
      ],
    ],
  ] satisfies [string, HeadersInit][])(
    '%s를 실제 생성 SDK와 Ky까지 전달한다',
    async (_kind, headers) => {
      const requests: Request[] = [];
      const fetcher = vi.fn<typeof fetch>().mockImplementation((input, init) => {
        requests.push(new Request(input, init));
        return Promise.resolve(
          Response.json({ accessToken: 'memory', staff: { id: 1, displayName: '합성' } }),
        );
      });
      const client = createClient({
        baseUrl: 'https://sdk.test',
        ky: ky.create({ fetch: fetcher }),
        headers: { 'X-Default': 'default' },
      });
      await login({ client, body, headers, throwOnError: true });
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(requests[0]?.headers.get('X-Request')).toBe('retained');
      expect(requests[0]?.headers.get('Authorization')).toBe('Bearer explicit');
      expect(requests[0]?.headers.get('X-Default')).toBe('default');
      expect(requests[0]?.headers.get('Content-Type')).toBe('application/json');
    },
  );
});

it('record의 null 삭제 지시를 생성 SDK에서도 유지한다', async () => {
  const requests: Request[] = [];
  const client = createClient({
    baseUrl: 'https://sdk.test',
    headers: { 'X-Default': 'remove' },
    ky: ky.create({
      fetch: (input, init) => {
        requests.push(new Request(input, init));
        return Promise.resolve(Response.json({}));
      },
    }),
  });
  await login({ client, body, headers: { 'X-Default': null }, throwOnError: true });
  expect(requests[0]?.headers.has('X-Default')).toBe(false);
});
