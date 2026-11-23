/** 생성 함수 이름이 바뀌어도 기존 API 경로의 mock 응답 계약을 보존합니다. */
import { expect, it } from 'vitest';
import {
  zAdminGenerationListResponse,
  zDetail1Response,
  zDetailResponse,
  zList4Response,
  zPresign1Response,
  zSubmit1Response,
} from '@yapp-plus/api/generated';
import { apiBaseUrl } from './server';

it.each([
  ['POST', '/api/attendance-reports', zSubmit1Response],
  ['GET', '/api/admin/generations', zAdminGenerationListResponse],
  ['POST', '/api/admin/generations/1/post-images/presign', zPresign1Response],
  ['GET', '/api/admin/generations/1/sessions/1/attendance', zList4Response],
  ['GET', '/api/admin/generations/1/posts/1', zDetail1Response],
  ['GET', '/api/admin/generations/1/members/1', zDetailResponse],
])('기존 %s %s 모킹을 같은 응답 계약으로 유지한다', async (method, path, schema) => {
  const response = await fetch(`${apiBaseUrl}${path}`, { method });
  expect(response.status).toBe(200);
  expect(schema.safeParse(await response.json()).success).toBe(true);
});
