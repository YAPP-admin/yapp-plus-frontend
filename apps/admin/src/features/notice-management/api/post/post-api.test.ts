import type {
  AdminPostDetailResponse,
  AdminPostListResponse,
  CreateAdminPostRequest,
  UpdateAdminPostRequest,
} from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import {
  createAdminPost,
  deleteAdminPost,
  getAdminPost,
  listAdminPosts,
  updateAdminPost,
} from './post-api';

const listResponse = {
  totalPostCount: 1,
  items: [],
  nextCursor: null,
} satisfies AdminPostListResponse;
const detailResponse = {
  postId: 9,
  title: '공지',
  contentMarkdown: '내용',
  type: 'NOTICE',
  audience: { type: 'GROUP', target: 'ALL_USERS', positions: [] },
  createdAt: '2026-11-22T05:00:00Z',
  publishedAt: '2026-11-22T05:00:00Z',
  updatedAt: '2026-11-22T05:00:00Z',
  recipientCount: 1,
  readCount: 0,
  assignment: null,
  images: [],
} satisfies AdminPostDetailResponse;

describe('post API adapter', () => {
  it('목록과 상세 조회에 generationId, postId, cursor를 전달한다', async () => {
    const requests: URL[] = [];
    server.use(
      http.get(`${apiBaseUrl}/api/admin/generations/12/posts`, ({ request }) => {
        requests.push(new URL(request.url));
        return HttpResponse.json(listResponse);
      }),
      http.get(`${apiBaseUrl}/api/admin/generations/12/posts/9`, ({ request }) => {
        requests.push(new URL(request.url));
        return HttpResponse.json(detailResponse);
      }),
    );

    await expect(
      listAdminPosts({ generationId: 12, type: 'NOTICE', cursor: 'next' }),
    ).resolves.toEqual(listResponse);
    await expect(getAdminPost({ generationId: 12, postId: 9 })).resolves.toEqual(detailResponse);

    expect(requests.map((request) => `${request.pathname}${request.search}`)).toEqual([
      '/api/admin/generations/12/posts?type=NOTICE&cursor=next',
      '/api/admin/generations/12/posts/9',
    ]);
  });

  it('작성 요청에 Idempotency-Key와 body를 전달한다', async () => {
    const body = {
      type: 'NOTICE',
      audience: { type: 'GROUP', target: 'ALL_USERS' },
      title: '새 공지',
      contentMarkdown: '내용',
    } satisfies CreateAdminPostRequest;
    let receivedKey: string | null = null;
    let receivedBody: unknown;
    server.use(
      http.post(`${apiBaseUrl}/api/admin/generations/12/posts`, async ({ request }) => {
        receivedKey = request.headers.get('Idempotency-Key');
        receivedBody = await request.json();
        return HttpResponse.json({ postId: 9 }, { status: 201 });
      }),
    );

    await expect(
      createAdminPost({ generationId: 12, idempotencyKey: 'notice-1', body }),
    ).resolves.toEqual({ postId: 9 });
    expect(receivedKey).toBe('notice-1');
    expect(receivedBody).toEqual(body);
  });

  it('수정 요청은 generated body를 그대로 전달한다', async () => {
    const updateBody = {
      title: '수정 공지',
      contentMarkdown: '수정 내용',
      imageKeys: ['image-key'],
    } satisfies UpdateAdminPostRequest;
    let receivedUpdate: unknown;
    server.use(
      http.patch(`${apiBaseUrl}/api/admin/generations/12/posts/9`, async ({ request }) => {
        receivedUpdate = await request.json();
        return HttpResponse.json(detailResponse);
      }),
    );

    await expect(
      updateAdminPost({ generationId: 12, postId: 9, body: updateBody }),
    ).resolves.toEqual(detailResponse);
    expect(receivedUpdate).toEqual(updateBody);
  });

  it('공지 삭제는 204 응답을 성공으로 처리한다', async () => {
    server.use(
      http.delete(
        `${apiBaseUrl}/api/admin/generations/12/posts/9`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    await expect(deleteAdminPost({ generationId: 12, postId: 9 })).resolves.toBeUndefined();
  });
});
