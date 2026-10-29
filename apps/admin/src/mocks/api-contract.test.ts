/** 생성 함수 이름이 바뀌어도 기존 API 경로의 mock 응답 계약을 보존합니다. */
import { expect, it } from 'vitest';
import { zList3Response, zPresign1Response, zSubmit1Response } from '@yapp-plus/api/generated';
import { apiBaseUrl } from './server';

it.each([
  ['POST', '/api/attendance-reports', zSubmit1Response],
  ['POST', '/api/admin/generations/1/post-images/presign', zPresign1Response],
  ['GET', '/api/admin/generations/1/sessions/1/attendance', zList3Response],
])('기존 %s %s 모킹을 같은 응답 계약으로 유지한다', async (method, path, schema) => {
  const response = await fetch(`${apiBaseUrl}${path}`, { method });
  expect(response.status).toBe(200);
  expect(schema.safeParse(await response.json()).success).toBe(true);
});
