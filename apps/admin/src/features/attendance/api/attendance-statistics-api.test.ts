import type {
  AdminAttendanceStatisticsDetailResponse,
  AdminAttendanceStatisticsListResponse,
} from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import {
  getAttendanceStatistics,
  getMembershipAttendanceStatistics,
} from './attendance-statistics-api';

const statistics = { items: [] } satisfies AdminAttendanceStatisticsListResponse;
const membershipStatistics = {
  membershipId: 71,
  name: '홍길동',
  generationNumber: 25,
  position: 'WEB',
  totalScore: 96,
  deductions: [],
} satisfies AdminAttendanceStatisticsDetailResponse;

it('기수 통계는 position query를 선택적으로 전달한다', async () => {
  let requestUrl: URL | undefined;
  const endpoint = `${apiBaseUrl}/api/admin/generations/17/attendance-statistics`;
  server.use(
    http.get(endpoint, ({ request }) => {
      requestUrl = new URL(request.url);
      return HttpResponse.json(statistics);
    }),
  );

  await expect(getAttendanceStatistics({ generationId: 17, position: 'WEB' })).resolves.toEqual(
    statistics,
  );
  expect(requestUrl?.pathname).toBe('/api/admin/generations/17/attendance-statistics');
  expect(requestUrl?.search).toBe('?position=WEB');
});

it('회원 통계는 generationId와 membershipId path를 사용한다', async () => {
  let requestPath: string | undefined;
  server.use(
    http.get(
      `${apiBaseUrl}/api/admin/generations/17/memberships/71/attendance-statistics`,
      ({ request }) => {
        requestPath = new URL(request.url).pathname;
        return HttpResponse.json(membershipStatistics);
      },
    ),
  );

  await expect(
    getMembershipAttendanceStatistics({ generationId: 17, membershipId: 71 }),
  ).resolves.toEqual(membershipStatistics);
  expect(requestPath).toBe('/api/admin/generations/17/memberships/71/attendance-statistics');
});
