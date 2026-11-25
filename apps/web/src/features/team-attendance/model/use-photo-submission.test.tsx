/** 최종 확인에서 업로드한 imageKey와 참석 명단만 전송한다. */
import { http, HttpResponse } from 'msw';
import { beforeEach, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { apiBaseUrl, server } from '@/mocks/server';
import { currentWeekFixture } from '@/mocks/session-handlers';
import { find1QueryKey, find6QueryKey } from '@yapp-plus/api/generated';
import { teamAttendanceTargetSchema, type SubmissionInput } from './submission-input';
import { usePhotoSubmission } from './use-photo-submission';

const endpoint = `${apiBaseUrl}/api/sessions/1/team-attendance-photos`;
const input: SubmissionInput = {
  target: teamAttendanceTargetSchema.parse({
    sessionId: 1,
    teamId: 1,
    teamName: '팀',
    selfMembershipId: 10,
    members: [{ membershipId: 10, name: '본인', positionLabel: 'Web' }],
  }),
  photo: new File(['abc'], 'team-attendance.jpg', { type: 'image/jpeg' }),
  selectedMembershipIds: [10],
};

const apiOptions = { baseUrl: apiBaseUrl, auth: 'test-token' };
const weekKey = find6QueryKey(apiOptions);
const photoKey = find1QueryKey({ ...apiOptions, path: { sessionId: 1 } });
const otherPhotoKey = find1QueryKey({ ...apiOptions, path: { sessionId: 2 } });

beforeEach(() => {
  server.use(
    http.post(`${endpoint}/presign`, () =>
      HttpResponse.json({
        imageKey: 'uploaded-key',
        uploadUrl: 'https://storage.test/photo',
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
        signedHeaders: { 'Content-Type': 'image/jpeg' },
      }),
    ),
    http.put('https://storage.test/photo', () => new HttpResponse(null, { status: 200 })),
  );
});

function setup() {
  const client = new QueryClient();
  client.setQueryData(weekKey, currentWeekFixture);
  client.setQueryData(photoKey, { photo: null });
  client.setQueryData(otherPhotoKey, { photo: null });
  const hook = renderHook(() => usePhotoSubmission(apiOptions), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  return { hook, client };
}

it('접수 성공 시 주간 상태와 제출한 세션의 사진 캐시를 무효화한다', async () => {
  let body: unknown;
  server.use(
    http.post(endpoint, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json(
        { photoId: 12, submittedAt: '2026-11-16T00:00:00Z', status: 'PENDING' },
        { status: 201 },
      );
    }),
  );
  const { hook, client } = setup();
  await act(async () => {
    await expect(
      hook.result.current.submitPhoto(input, new AbortController().signal),
    ).resolves.toMatchObject({ teamName: '팀', status: 'PENDING' });
  });
  expect(body).toEqual({ imageKey: 'uploaded-key', selectedMembershipIds: [10] });
  expect(client.getQueryState(weekKey)?.isInvalidated).toBe(true);
  expect(client.getQueryState(photoKey)?.isInvalidated).toBe(true);
  expect(client.getQueryState(otherPhotoKey)?.isInvalidated).toBe(false);
  hook.unmount();
  client.clear();
});

it.each([
  { status: 409, body: {}, kind: 'failed' },
  {
    status: 201,
    body: { photoId: 12, submittedAt: '2026-11-16T00:00:00Z', status: 'REJECTED' },
    kind: 'unknown',
  },
])('접수 실패나 유효하지 않은 응답은 캐시를 무효화하지 않는다: $kind', async (response) => {
  server.use(
    http.post(endpoint, () => HttpResponse.json(response.body, { status: response.status })),
  );
  const { hook, client } = setup();
  await act(async () => {
    await expect(
      hook.result.current.submitPhoto(input, new AbortController().signal),
    ).rejects.toMatchObject({ kind: response.kind });
  });
  expect(client.getQueryState(weekKey)?.isInvalidated).toBe(false);
  expect(client.getQueryState(photoKey)?.isInvalidated).toBe(false);
  hook.unmount();
  client.clear();
});
