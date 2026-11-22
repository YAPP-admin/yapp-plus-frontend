import type { PresignPostImageRequest, PresignPostImageResponse } from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import { presignAdminPostImage } from './post-image-api';

describe('post image API adapter', () => {
  it('이미지 presign 요청은 generated body를 그대로 전달한다', async () => {
    const body = {
      filename: 'notice.png',
      contentType: 'image/png',
      sizeBytes: 123,
      checksumSha256: 'checksum',
    } satisfies PresignPostImageRequest;
    const response = {
      imageKey: 'image-key',
      uploadUrl: 'https://upload.example.test/put',
      signedHeaders: { 'Content-Type': 'image/png' },
      expiresAt: '2026-11-22T05:05:00Z',
    } satisfies PresignPostImageResponse;
    let receivedBody: unknown;
    server.use(
      http.post(
        `${apiBaseUrl}/api/admin/generations/12/post-images/presign`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(response);
        },
      ),
    );

    await expect(presignAdminPostImage({ generationId: 12, body })).resolves.toEqual(response);
    expect(receivedBody).toEqual(body);
  });
});
