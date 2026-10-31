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

it('공지 이미지 presign부터 PUT까지 모의 업로드 origin에서 처리한다', async () => {
  const response = await fetch(`${apiBaseUrl}/api/admin/generations/1/post-images/presign`, {
    method: 'POST',
  });
  const upload = zPresign1Response.parse(await response.json());
  expect(new URL(upload.uploadUrl).origin).toBe('https://upload.yapp.test');
  const result = await fetch(upload.uploadUrl, {
    method: 'PUT',
    headers: upload.signedHeaders,
    body: new Uint8Array([1, 2, 3]),
  });
  expect(result.status).toBe(200);
});

it.each([
  ['PUT', 'https://upload.yapp.test/unknown'],
  ['POST', 'https://upload.yapp.test/post-images/example'],
])('모의 업로드의 미등록 %s 요청을 실제 네트워크로 보내지 않는다', async (method, url) => {
  await expect(fetch(url, { method })).rejects.toThrow(/Cannot bypass/);
});
