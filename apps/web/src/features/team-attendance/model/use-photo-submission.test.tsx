/** 최종 확인에서 업로드한 imageKey와 참석 명단만 전송한다. */
import { http, HttpResponse } from 'msw';
import { beforeEach, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ApiError } from '@yapp-plus/api';
import { apiBaseUrl, server } from '@/mocks/server';
import { currentWeekFixture } from '@/mocks/session-handlers';
import { find1QueryKey, find6QueryKey, find8InfiniteQueryKey } from '@yapp-plus/api/generated';
import {
  teamAttendanceTargetSchema,
  type SubmissionError,
  type SubmissionInput,
} from './submission-input';
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
const historyKey = find8InfiniteQueryKey(apiOptions);
const weekKey = find6QueryKey(apiOptions);
const photoKey = find1QueryKey({ ...apiOptions, path: { sessionId: 1 } });
const otherPhotoKey = find1QueryKey({ ...apiOptions, path: { sessionId: 2 } });

beforeEach(() => {
  server.use(...successfulPresignAndUpload());
});

function setup() {
  const client = new QueryClient();
  client.setQueryData(historyKey, { pages: [], pageParams: [] });
  client.setQueryData(weekKey, currentWeekFixture);
  client.setQueryData(photoKey, { photo: null });
  client.setQueryData(otherPhotoKey, { photo: null });
  const hook = renderHook(() => usePhotoSubmission(apiOptions), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  return { ...hook, client };
}

function successfulPresignAndUpload() {
  return [
    http.post(`${endpoint}/presign`, () =>
      HttpResponse.json({
        imageKey: 'uploaded-key',
        uploadUrl: 'https://storage.test/photo',
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
        signedHeaders: { 'Content-Type': 'image/jpeg' },
      }),
    ),
    http.put('https://storage.test/photo', () => new HttpResponse(null, { status: 200 })),
  ];
}

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
  const { client, ...hook } = setup();
  await act(async () => {
    await expect(
      hook.result.current.submitPhoto(input, new AbortController().signal),
    ).resolves.toMatchObject({ teamName: '팀', status: 'PENDING' });
  });
  expect(client.getQueryState(historyKey)?.isInvalidated).toBe(true);
  expect(body).toEqual({ imageKey: 'uploaded-key', selectedMembershipIds: [10] });
  expect(client.getQueryState(weekKey)?.isInvalidated).toBe(true);
  expect(client.getQueryState(photoKey)?.isInvalidated).toBe(true);
  expect(client.getQueryState(otherPhotoKey)?.isInvalidated).toBe(false);
  hook.unmount();
  client.clear();
});

it('presign 최종 401은 원본 인증 오류를 보존한다', async () => {
  server.use(
    http.post(`${endpoint}/presign`, () => HttpResponse.json({ status: 401 }, { status: 401 })),
  );
  const { client, ...hook } = setup();

  await act(async () => {
    await expect(
      hook.result.current.submitPhoto(input, new AbortController().signal),
    ).rejects.toBeInstanceOf(ApiError);
  });

  expect(client.getQueryState(historyKey)?.isInvalidated).toBe(false);
  expect(client.getQueryState(weekKey)?.isInvalidated).toBe(false);
  expect(client.getQueryState(photoKey)?.isInvalidated).toBe(false);
  hook.unmount();
  client.clear();
});

it('최종 제출 401은 원본 인증 오류를 보존한다', async () => {
  server.use(
    ...successfulPresignAndUpload(),
    http.post(endpoint, () => HttpResponse.json({ status: 401 }, { status: 401 })),
  );
  const { client, ...hook } = setup();

  await act(async () => {
    await expect(
      hook.result.current.submitPhoto(input, new AbortController().signal),
    ).rejects.toBeInstanceOf(ApiError);
  });

  expect(client.getQueryState(historyKey)?.isInvalidated).toBe(false);
  expect(client.getQueryState(weekKey)?.isInvalidated).toBe(false);
  expect(client.getQueryState(photoKey)?.isInvalidated).toBe(false);
  hook.unmount();
  client.clear();
});

it('서명 URL PUT 실패는 재제출 가능한 로컬 오류로 바꾼다', async () => {
  server.use(
    http.post(`${endpoint}/presign`, () =>
      HttpResponse.json({
        imageKey: 'uploaded-key',
        uploadUrl: 'https://storage.test/photo',
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
        signedHeaders: { 'Content-Type': 'image/jpeg' },
      }),
    ),
    http.put('https://storage.test/photo', () => new HttpResponse(null, { status: 403 })),
  );
  const { client, ...hook } = setup();

  await act(async () => {
    await expect(
      hook.result.current.submitPhoto(input, new AbortController().signal),
    ).rejects.toMatchObject<Partial<SubmissionError>>({ kind: 'failed' });
  });

  expect(client.getQueryState(historyKey)?.isInvalidated).toBe(false);
  expect(client.getQueryState(weekKey)?.isInvalidated).toBe(false);
  expect(client.getQueryState(photoKey)?.isInvalidated).toBe(false);
  hook.unmount();
  client.clear();
});

it('접수 결과가 불명이면 자동 재제출하지 않는 로컬 오류로 바꾼다', async () => {
  server.use(
    ...successfulPresignAndUpload(),
    http.post(endpoint, () =>
      HttpResponse.json(
        { photoId: 12, submittedAt: '2026-11-16T00:00:00Z', status: 'PENDING' },
        { status: 200 },
      ),
    ),
  );
  const { client, ...hook } = setup();

  await act(async () => {
    await expect(
      hook.result.current.submitPhoto(input, new AbortController().signal),
    ).rejects.toMatchObject<Partial<SubmissionError>>({ kind: 'unknown' });
  });

  expect(client.getQueryState(historyKey)?.isInvalidated).toBe(false);
  expect(client.getQueryState(weekKey)?.isInvalidated).toBe(false);
  expect(client.getQueryState(photoKey)?.isInvalidated).toBe(false);
  hook.unmount();
  client.clear();
});
