import { expect, it, vi } from 'vitest';
import ky from 'ky';
import { createClient } from '../generated/client';
import { find2 } from '../generated/sdk.gen';

it.each([
  ['요청', 'Bearer request'],
  ['기본 설정', 'Bearer configured'],
  ['auth 콜백', 'Bearer global'],
])('%s 인증 헤더 우선순위를 유지한다', async (source, expected) => {
  const sent: Request[] = [];
  const auth = vi.fn<() => string>().mockReturnValue('global');
  const client = createClient({
    baseUrl: 'https://sdk.test',
    auth,
    headers: source === 'auth 콜백' ? undefined : { Authorization: 'Bearer configured' },
    ky: ky.create({
      fetch: (input, init) => {
        sent.push(new Request(input, init));
        return Promise.resolve(Response.json({}));
      },
    }),
  });
  await find2({
    client,
    headers: source === '요청' ? { Authorization: expected } : undefined,
    throwOnError: true,
  });
  expect(sent[0]?.headers.get('Authorization')).toBe(expected);
  expect(auth).toHaveBeenCalledTimes(source === 'auth 콜백' ? 1 : 0);
});
