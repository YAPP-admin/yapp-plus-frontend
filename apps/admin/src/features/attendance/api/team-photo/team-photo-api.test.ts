import type { DecideResponse, TeamPhotoListResponse } from '@yapp-plus/api/generated';
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { apiBaseUrl, server } from '../../../../mocks/server';
import { decideTeamAttendancePhoto, getTeamAttendancePhotos } from './team-photo-api';

const photos = { items: [] } satisfies TeamPhotoListResponse;
const decision = {
  photoId: 31,
  status: 'APPROVED',
  decidedAt: '2026-11-22T05:00:00Z',
} satisfies DecideResponse;

it('팀 사진 목록과 판정 endpoint에 path·body를 전달한다', async () => {
  let decisionBody: unknown;
  const listPath = '/api/admin/generations/17/sessions/23/team-attendance-photos';
  server.use(
    http.get(`${apiBaseUrl}${listPath}`, () => HttpResponse.json(photos)),
    http.post(`${apiBaseUrl}${listPath}/31/decision`, async ({ request }) => {
      decisionBody = await request.json();
      return HttpResponse.json(decision);
    }),
  );

  await expect(getTeamAttendancePhotos({ generationId: 17, sessionId: 23 })).resolves.toEqual(
    photos,
  );
  await expect(
    decideTeamAttendancePhoto({
      generationId: 17,
      sessionId: 23,
      photoId: 31,
      body: { decision: 'APPROVED', reason: '사진 확인 완료' },
    }),
  ).resolves.toEqual(decision);

  expect(decisionBody).toEqual({ decision: 'APPROVED', reason: '사진 확인 완료' });
});
