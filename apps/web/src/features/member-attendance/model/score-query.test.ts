import { createAppQueryClient } from '@/app/providers';
import { mineQueryKey } from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../mocks/server';
import { scoreFixture } from '../../../mocks/member-attendance-handlers';
import { memberScoreQueryOptions } from './score-query';

const url = `${apiBaseUrl}/api/attendance-scores/me`;
const query = () => createAppQueryClient().fetchQuery(memberScoreQueryOptions());

it('생성 query key와 안전한 number ID를 반환한다', async () => {
  expect(memberScoreQueryOptions().queryKey).toEqual(mineQueryKey());
  await expect(query()).resolves.toEqual({ status: 'available', score: scoreFixture });
});

it('문자열 int64도 안전 범위에서 number로 정규화한다', async () => {
  server.use(http.get(url, () => HttpResponse.json({ ...scoreFixture, generationId: '28' })));
  await expect(query()).resolves.toMatchObject({
    status: 'available',
    score: { generationId: 28 },
  });
});

it.each([
  { generationId: '9007199254740993' },
  { generationId: 1.5 },
  { attendanceCount: -1 },
  { totalScore: -1 },
  { lateCount: 0.5 },
  { absentCount: null },
])('잘못된 응답은 실패한다 (%j)', async (invalid) => {
  server.use(http.get(url, () => HttpResponse.json({ ...scoreFixture, ...invalid })));
  await expect(query()).rejects.toThrow(Error);
});

it.each([
  [403, 'ATTENDANCE_SCORE_NOT_ELIGIBLE'],
  [404, 'CURRENT_GENERATION_NOT_FOUND'],
  [404, 'ATTENDANCE_SCORE_NOT_ELIGIBLE'],
  [500, 'CURRENT_GENERATION_NOT_FOUND'],
])('미대상은 HTTP status 대신 code로 판별하고 사유를 보존한다 (%s, %s)', async (status, code) => {
  server.use(http.get(url, () => HttpResponse.json({ code, message: '미대상' }, { status })));
  await expect(query()).resolves.toEqual({ status: 'unavailable', reason: code });
});

it.each([
  [401, 'UNKNOWN'],
  [403, 'ATTENDANCE_REPORT_NOT_ELIGIBLE'],
  [404, 'UNKNOWN'],
  [409, 'UNKNOWN'],
  [500, 'UNKNOWN'],
])('미대상이 아닌 오류는 조회 실패다 (%s, %s)', async (status, code) => {
  server.use(http.get(url, () => HttpResponse.json({ code, message: '조회 실패' }, { status })));
  await expect(query()).rejects.toEqual({ code, message: '조회 실패' });
});

it('미대상 오류 본문도 검증한다', async () => {
  server.use(
    http.get(url, () =>
      HttpResponse.json({ code: 'ATTENDANCE_SCORE_NOT_ELIGIBLE' }, { status: 403 }),
    ),
  );
  await expect(query()).rejects.toEqual({ code: 'ATTENDANCE_SCORE_NOT_ELIGIBLE' });
});

it('응답 없는 네트워크 오류를 미대상으로 바꾸지 않는다', async () => {
  server.use(http.get(url, () => HttpResponse.error()));
  await expect(query()).rejects.toThrow(Error);
});
