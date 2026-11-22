import type { AdminPostRecipientListResponse } from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import { listAdminPostRecipients } from './post-recipient-api';

const response = {
  asOf: '2026-11-22T05:00:00Z',
  recipientCount: 1,
  readCount: 0,
  items: [],
  nextCursor: null,
} satisfies AdminPostRecipientListResponse;

describe('post recipient API adapter', () => {
  it('공지 수신자 조회에 generationId, postId, cursor를 전달한다', async () => {
    let receivedUrl: URL | undefined;
    server.use(
      http.get(`${apiBaseUrl}/api/admin/generations/12/posts/9/recipients`, ({ request }) => {
        receivedUrl = new URL(request.url);
        return HttpResponse.json(response);
      }),
    );

    await expect(
      listAdminPostRecipients({ generationId: 12, postId: 9, cursor: 'recipient-next' }),
    ).resolves.toEqual(response);
    expect(`${receivedUrl?.pathname}${receivedUrl?.search}`).toBe(
      '/api/admin/generations/12/posts/9/recipients?cursor=recipient-next',
    );
  });
});
