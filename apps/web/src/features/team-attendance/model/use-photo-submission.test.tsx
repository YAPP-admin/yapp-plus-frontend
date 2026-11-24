/** 최종 확인에서 업로드한 imageKey와 참석 명단만 전송한다. */
import { http, HttpResponse } from 'msw';
import { expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { apiBaseUrl, server } from '@/mocks/server';
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

it('확인 시 imageKey와 명단을 생성 API에 접수한다', async () => {
  let body: unknown;
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
    http.post(endpoint, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json(
        { photoId: 12, submittedAt: '2026-11-16T00:00:00Z', status: 'PENDING' },
        { status: 201 },
      );
    }),
  );
  const client = new QueryClient();
  const hook = renderHook(() => usePhotoSubmission({ auth: 'test-token' }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  await act(async () => {
    await expect(
      hook.result.current.submitPhoto(input, new AbortController().signal),
    ).resolves.toMatchObject({ teamName: '팀', status: 'PENDING' });
  });
  expect(body).toEqual({ imageKey: 'uploaded-key', selectedMembershipIds: [10] });
  hook.unmount();
  client.clear();
});
