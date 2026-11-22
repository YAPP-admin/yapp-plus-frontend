import type { AttendanceCodeResponse } from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import {
  getAttendanceCode,
  issueAttendanceCode,
  reissueAttendanceCode,
} from './attendance-code-api';

const codeResponse = {
  status: 'ISSUED',
  code: 123456,
  revision: 2,
  issuedAt: '2026-11-22T05:00:00Z',
  issuedByStaffId: 9,
} satisfies AttendanceCodeResponse;

it('출석 코드 조회·발급·재발급을 같은 세션 path로 구분해 호출한다', async () => {
  const requests: { method: string; pathname: string }[] = [];
  const endpoint = `${apiBaseUrl}/api/admin/generations/17/sessions/23/attendance-code`;
  server.use(
    http.get(endpoint, ({ request }) => {
      requests.push({ method: request.method, pathname: new URL(request.url).pathname });
      return HttpResponse.json(codeResponse);
    }),
    http.post(endpoint, ({ request }) => {
      requests.push({ method: request.method, pathname: new URL(request.url).pathname });
      return HttpResponse.json(codeResponse);
    }),
    http.post(`${endpoint}/reissue`, ({ request }) => {
      requests.push({ method: request.method, pathname: new URL(request.url).pathname });
      return HttpResponse.json(codeResponse);
    }),
  );

  await expect(getAttendanceCode({ generationId: 17, sessionId: 23 })).resolves.toEqual(
    codeResponse,
  );
  await expect(issueAttendanceCode({ generationId: 17, sessionId: 23 })).resolves.toEqual(
    codeResponse,
  );
  await expect(reissueAttendanceCode({ generationId: 17, sessionId: 23 })).resolves.toEqual(
    codeResponse,
  );

  expect(requests).toEqual([
    { method: 'GET', pathname: '/api/admin/generations/17/sessions/23/attendance-code' },
    { method: 'POST', pathname: '/api/admin/generations/17/sessions/23/attendance-code' },
    { method: 'POST', pathname: '/api/admin/generations/17/sessions/23/attendance-code/reissue' },
  ]);
});
