import type {
  AdminAttendanceListResponse,
  BadgeRequest,
  OverrideAttendanceRequest,
} from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import {
  cancelAttendanceClose,
  closeAttendance,
  getAttendance,
  overrideAttendance,
  updateAttendanceBadge,
} from './attendance-api';

const attendance = {
  items: [],
  nextCursor: null,
} satisfies AdminAttendanceListResponse;

const path = '/api/admin/generations/17/sessions/23/attendance';

it('출석 목록 조회는 path와 페이지 query를 generated SDK에 전달한다', async () => {
  let requestUrl: URL | undefined;
  server.use(
    http.get(`${apiBaseUrl}${path}`, ({ request }) => {
      requestUrl = new URL(request.url);
      return HttpResponse.json(attendance);
    }),
  );

  await expect(
    getAttendance({ generationId: 17, sessionId: 23, cursor: 41, size: 20 }),
  ).resolves.toEqual(attendance);
  expect(requestUrl?.pathname).toBe(path);
  expect(requestUrl?.search).toBe('?cursor=41&size=20');
});

it('출석 정정과 명찰 변경은 서로 다른 PATCH body를 사용한다', async () => {
  const requests: { url: string; body: unknown }[] = [];
  server.use(
    http.patch(`${apiBaseUrl}${path}/71`, async ({ request }) => {
      requests.push({ url: new URL(request.url).pathname, body: await request.json() });
      return HttpResponse.json({});
    }),
    http.patch(`${apiBaseUrl}${path}/71/badge`, async ({ request }) => {
      requests.push({ url: new URL(request.url).pathname, body: await request.json() });
      return HttpResponse.json({});
    }),
  );

  const attendanceBody = {
    status: 'LATE_ONE_HOUR',
    reason: '운영진 확인',
    checkedInAt: '2026-11-22T05:00:00Z',
    earlyLeaveAt: null,
  } satisfies OverrideAttendanceRequest;
  const badgeBody = { enabled: true } satisfies BadgeRequest;

  await overrideAttendance({
    generationId: 17,
    sessionId: 23,
    membershipId: 71,
    body: attendanceBody,
  });
  await updateAttendanceBadge({
    generationId: 17,
    sessionId: 23,
    membershipId: 71,
    body: badgeBody,
  });

  expect(requests).toEqual([
    { url: `${path}/71`, body: attendanceBody },
    { url: `${path}/71/badge`, body: badgeBody },
  ]);
});

it('출석 마감과 취소는 각각 별도 POST endpoint를 호출한다', async () => {
  const paths: string[] = [];
  server.use(
    http.post(`${apiBaseUrl}${path}/close`, ({ request }) => {
      paths.push(new URL(request.url).pathname);
      return HttpResponse.json({ closed: true });
    }),
    http.post(`${apiBaseUrl}${path}/close/cancel`, ({ request }) => {
      paths.push(new URL(request.url).pathname);
      return HttpResponse.json({ cancelled: true });
    }),
  );

  await closeAttendance({ generationId: 17, sessionId: 23 });
  await cancelAttendanceClose({ generationId: 17, sessionId: 23 });

  expect(paths).toEqual([`${path}/close`, `${path}/close/cancel`]);
});
