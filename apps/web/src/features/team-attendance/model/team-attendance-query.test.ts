import { QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '@/mocks/server';
import { teamAttendanceEntryQueryOptions } from './team-attendance-query';

const sessionUrl = `${apiBaseUrl}/api/sessions/42`;
const rosterUrl = `${sessionUrl}/team-members`;
const photoUrl = `${sessionUrl}/team-attendance-photos`;
const roster = {
  teamId: 7,
  teamName: '7팀',
  members: [
    { membershipId: 11, name: '팀원', position: null, isMe: false },
    { membershipId: 12, name: '본인', position: 'IOS', isMe: true },
  ],
};
const photo = {
  photoId: 13,
  teamId: 7,
  teamName: '7팀',
  imageUrl: 'https://example.test/team-photo',
  imageUrlExpiresAt: '2026-11-24T05:10:00Z',
  uploadedAt: '2026-11-24T05:00:00Z',
  uploadedTime: '14:00',
  submittedAt: '2026-11-24T05:01:00Z',
  uploader: { userId: 5, name: '본인' },
  selectedMemberCount: 2,
};
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

const options = (authSessionId = 'test-session') =>
  teamAttendanceEntryQueryOptions({
    sessionId: 42,
    authSessionId,
    apiOptions: { auth: 'test-token' },
  });

it.each(['PENDING', 'APPROVED', 'REJECTED'])(
  '검증한 명단과 %s 제출 여부만 반환한다',
  async (status) => {
    server.use(
      http.get(rosterUrl, ({ request }) => {
        expect(request.headers.get('Authorization')).toBe('Bearer test-token');
        return HttpResponse.json(roster);
      }),
      http.get(photoUrl, () => HttpResponse.json({ photo: { ...photo, status } })),
    );

    await expect(new QueryClient().fetchQuery(options())).resolves.toEqual({
      target: {
        sessionId: 42,
        teamId: 7,
        teamName: '7팀',
        selfMembershipId: 12,
        members: [
          { membershipId: 11, name: '팀원', positionLabel: '—' },
          { membershipId: 12, name: '본인', positionLabel: 'iOS' },
        ],
      },
      hasExistingPhoto: true,
    });
  },
);

it.each([
  { members: [] },
  { members: roster.members.map((member) => ({ ...member, isMe: true })) },
  { members: [{ ...roster.members[0], membershipId: 12 }, roster.members[1]] },
  { members: [{ ...roster.members[1], membershipId: '9007199254740993' }] },
])('유효하지 않은 명단을 차단하고 사진을 조회하지 않는다', async ({ members }) => {
  const lookupPhoto = vi.fn<() => void>();
  server.use(
    http.get(rosterUrl, () => HttpResponse.json({ ...roster, members })),
    http.get(photoUrl, () => {
      lookupPhoto();
      return HttpResponse.json({ photo: null });
    }),
  );

  await expect(new QueryClient().fetchQuery(options())).rejects.toThrow(Error);
  expect(lookupPhoto).not.toHaveBeenCalled();
});

it('팀원 조회 실패는 호출자에게 전달한다', async () => {
  server.use(
    http.get(rosterUrl, () =>
      HttpResponse.json(
        { code: 'TEAM_PHOTO_NOT_ELIGIBLE', message: '조회할 수 없습니다.' },
        { status: 403 },
      ),
    ),
  );

  await expect(new QueryClient().fetchQuery(options())).rejects.toMatchObject({ status: 403 });
});

it.each([
  () => HttpResponse.json({ photo: null }),
  () => HttpResponse.json({ photo: { status: 'PENDING' } }),
  () => HttpResponse.json({ code: 'TEAM_PHOTO_STORAGE_FAILED' }, { status: 503 }),
])('미제출 또는 사진 조회 실패만 기존 제출 없음으로 처리한다', async (lookupPhoto) => {
  server.use(
    http.get(rosterUrl, () => HttpResponse.json(roster)),
    http.get(photoUrl, lookupPhoto),
  );

  await expect(new QueryClient().fetchQuery(options())).resolves.toMatchObject({
    hasExistingPhoto: false,
  });
});

it('이전 인증 세션의 캐시를 재사용하지 않는다', async () => {
  const queryClient = new QueryClient();
  server.use(
    http.get(rosterUrl, () => HttpResponse.json(roster)),
    http.get(photoUrl, () => HttpResponse.json({ photo: { ...photo, status: 'PENDING' } })),
  );
  await expect(queryClient.fetchQuery(options())).resolves.toMatchObject({
    hasExistingPhoto: true,
  });

  server.use(http.get(photoUrl, () => HttpResponse.json({ photo: null })));
  await expect(queryClient.fetchQuery(options('new-session'))).resolves.toMatchObject({
    hasExistingPhoto: false,
  });
});

it('사진 조회 중 취소는 미제출 성공으로 저장하지 않는다', async () => {
  const queryClient = new QueryClient();
  const entryOptions = options();
  const started = deferred();
  const release = deferred();
  server.use(
    http.get(rosterUrl, () => HttpResponse.json(roster)),
    http.get(photoUrl, async () => {
      started.resolve();
      await release.promise;
      return HttpResponse.json({ photo: null });
    }),
  );

  const pending = queryClient.fetchQuery(entryOptions);
  try {
    await started.promise;
    await Promise.all([
      expect(pending).rejects.toThrow('CancelledError'),
      queryClient.cancelQueries({ queryKey: entryOptions.queryKey }),
    ]);
    expect(queryClient.getQueryData(entryOptions.queryKey)).toBeUndefined();
  } finally {
    release.resolve();
  }
});
