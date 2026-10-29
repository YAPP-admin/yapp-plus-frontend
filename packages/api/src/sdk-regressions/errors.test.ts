import { expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { createClient } from '../generated/client';
import { find2Options } from '../generated/@tanstack/react-query.gen';

const cases = [
  ['JSON', () => Response.json({ code: 'FORBIDDEN' }, { status: 403 }), { code: 'FORBIDDEN' }],
  ['텍스트', () => new Response('거절', { status: 403 }), '거절'],
  ['빈 본문', () => new Response(null, { status: 403 }), {}],
  ['false JSON', () => Response.json(false, { status: 403 }), false],
  ['0 JSON', () => Response.json(0, { status: 403 }), 0],
  ['null JSON', () => Response.json(null, { status: 403 }), null],
] as const;

it.each(cases)(
  '%s 오류를 throwOnError 양쪽 경로에서 보존하고 interceptor를 한 번 실행한다',
  async (_name, response, expected) => {
    for (const throwOnError of [true, false]) {
      const client = createClient({
        baseUrl: 'https://sdk.test',
        ky: ky.create({ fetch: () => Promise.resolve(response()) }),
      });
      const interceptor = vi.fn<(error: unknown) => unknown>().mockImplementation((error) => error);
      client.interceptors.error.use(interceptor);
      const result = client.get({ url: '/error', throwOnError });
      const outcome = await result.then(
        (value) => ({ returned: 'error' in value ? value.error : undefined }),
        (error: unknown) => ({ thrown: error }),
      );
      expect(outcome).toEqual(throwOnError ? { thrown: expected } : { returned: expected });
      expect(interceptor).toHaveBeenCalledExactlyOnceWith(
        expected,
        expect.any(Response),
        expect.any(Request),
        expect.anything(),
      );
    }
  },
);

it('실제 생성 Query helper가 서버 오류를 보존한다', async () => {
  const client = createClient({
    baseUrl: 'https://sdk.test',
    ky: ky.create({
      fetch: () => Promise.resolve(Response.json({ code: 'FORBIDDEN' }, { status: 403 })),
    }),
  });
  const interceptor = vi.fn<(error: unknown) => unknown>().mockImplementation((error) => error);
  client.interceptors.error.use(interceptor);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  try {
    await expect(queryClient.fetchQuery(find2Options({ client }))).rejects.toEqual({
      code: 'FORBIDDEN',
    });
    expect(interceptor).toHaveBeenCalledTimes(1);
  } finally {
    queryClient.clear();
  }
});

it('response interceptor가 응답을 대체하면 새 본문을 처리한다', async () => {
  const client = createClient({
    baseUrl: 'https://sdk.test',
    ky: ky.create({ fetch: () => Promise.resolve(Response.json({ old: true }, { status: 403 })) }),
  });
  client.interceptors.response.use(() => Response.json({ replaced: true }, { status: 403 }));
  await expect(client.get({ url: '/error', throwOnError: true })).rejects.toEqual({
    replaced: true,
  });
});

it('Ky의 HTTP 재시도 정책을 유지하고 최종 실패만 한 번 알린다', async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockImplementation(() =>
      Promise.resolve(Response.json({ code: 'UNAVAILABLE' }, { status: 503 })),
    );
  const client = createClient({
    baseUrl: 'https://sdk.test',
    ky: ky.create({ fetch: fetcher }),
    retry: { limit: 1, delay: () => 0 },
  });
  const interceptor = vi.fn<(error: unknown) => unknown>().mockImplementation((error) => error);
  client.interceptors.error.use(interceptor);
  await expect(client.get({ url: '/retry', throwOnError: true })).rejects.toEqual({
    code: 'UNAVAILABLE',
  });
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(interceptor).toHaveBeenCalledTimes(1);
});
