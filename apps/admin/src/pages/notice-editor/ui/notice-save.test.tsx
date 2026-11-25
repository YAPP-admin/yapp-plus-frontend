import { QueryClient } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { expect, it } from 'vitest';
import { create3Mutation } from '@yapp-plus/api/generated';
import { apiBaseUrl, server } from '~/mocks/server';

const variables = {
  path: { generationId: 25 },
  headers: { 'Idempotency-Key': 'notice-create-retry-key' },
  body: {
    type: 'SESSION' as const,
    audience: { type: 'GROUP' as const, target: 'ALL_USERS' as const },
    title: '세션 안내',
    contentMarkdown: '# 본문',
    imageKeys: [] as string[],
    assignment: null,
  },
};

it('공지 작성은 생성 SDK의 Markdown 본문·대상·idempotency key를 그대로 전송한다', async () => {
  let requestedBody: unknown;
  let idempotencyKey = '';
  server.use(
    http.post(`${apiBaseUrl}/api/admin/generations/:generationId/posts`, async ({ request }) => {
      requestedBody = await request.json();
      idempotencyKey = request.headers.get('Idempotency-Key') ?? '';
      return HttpResponse.json({ postId: 101 }, { status: 201 });
    }),
  );

  const client = new QueryClient();
  const result = await client
    .getMutationCache()
    .build(client, { ...create3Mutation(), retry: false })
    .execute(variables);

  expect(result).toEqual({ postId: 101 });
  expect(idempotencyKey).toBe('notice-create-retry-key');
  expect(requestedBody).toEqual(variables.body);
});
