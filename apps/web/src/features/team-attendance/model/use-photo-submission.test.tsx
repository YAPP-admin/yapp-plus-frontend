/** 실제 생성 SDK와 MSW를 연결해 체크섬·PUT 격리·접수 판정을 검증한다. */
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { apiBaseUrl, server } from '@/mocks/server';
import { teamAttendanceTargetSchema, type SubmissionInput } from './submission-input';
import { usePhotoSubmission } from './use-photo-submission';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const endpoint = `${apiBaseUrl}/api/sessions/1/team-attendance-photos`;
const uploadUrl = 'https://storage.test/photo';
const checksum = 'ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0='; // 'abc'의 SHA-256 Base64
const makeInput = (): SubmissionInput => ({
  target: teamAttendanceTargetSchema.parse({
    sessionId: 1,
    teamName: '팀',
    selfMembershipId: 10,
    members: [
      { membershipId: 10, name: '본인', positionLabel: 'Web' },
      { membershipId: 11, name: '팀원', positionLabel: 'iOS' },
    ],
  }),
  selectedMembershipIds: [10],
  photo: new File(['abc'], 'team-attendance.jpg', { type: 'image/jpeg' }),
});
const signed = () => ({
  imageKey: 'key',
  uploadUrl,
  expiresAt: new Date(Date.now() + 300_000).toISOString(),
  signedHeaders: { 'Content-Type': 'image/jpeg', 'x-amz-checksum-sha256': checksum },
});
const receipt = { photoId: 12, submittedAt: '2026-11-16T00:00:00Z', status: 'PENDING' };
const calls: string[] = [];
function setup() {
  const client = new QueryClient();
  const hook = renderHook(() => usePhotoSubmission({ auth: 'test-token' }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  return { ...hook, client };
}
const run = async (signal = new AbortController().signal) => {
  const { result, unmount, client } = setup();
  try {
    let resultReceipt;
    await act(async () => {
      resultReceipt = await result.current.submitPhoto(makeInput(), signal);
    });
    return resultReceipt;
  } finally {
    unmount();
    client.clear();
  }
};
const requests: Request[] = [];
beforeEach(() => {
  calls.length = 0;
  requests.length = 0;
  server.use(
    http.post(`${endpoint}/presign`, ({ request }) => {
      calls.push('presign');
      requests.push(request);
      return HttpResponse.json(signed());
    }),
    http.put(uploadUrl, ({ request }) => {
      calls.push('put');
      requests.push(request);
      return new HttpResponse(null, { status: 200 });
    }),
    http.post(endpoint, ({ request }) => {
      calls.push('submit');
      requests.push(request);
      return HttpResponse.json(receipt, { status: 201 });
    }),
  );
});
afterEach(() => vi.restoreAllMocks());
it('최종 바이트의 체크섬과 격리된 PUT을 거쳐 서버 접수·명단을 반환한다', async () => {
  expect(await run()).toEqual({
    ...receipt,
    teamName: '팀',
    members: [makeInput().target.members[0]],
  });
  expect(calls).toEqual(['presign', 'put', 'submit']);
  const [presignRequest, putRequest, submitRequest] = requests;
  expect(presignRequest?.headers.get('authorization')).toBe('Bearer test-token');
  expect(await presignRequest?.json()).toEqual({
    filename: 'team-attendance.jpg',
    contentType: 'image/jpeg',
    sizeBytes: 3,
    checksumSha256: checksum,
  });
  expect(putRequest?.credentials).toBe('omit');
  expect(putRequest?.redirect).toBe('error');
  expect(putRequest?.headers.has('authorization')).toBe(false);
  expect(putRequest?.headers.get('x-amz-checksum-sha256')).toBe(checksum);
  expect(await putRequest?.text()).toBe('abc');
  expect(submitRequest?.headers.get('authorization')).toBe('Bearer test-token');
  expect(await submitRequest?.json()).toEqual({ imageKey: 'key', selectedMembershipIds: [10] });
});
it('오프라인은 예약하거나 전송하지 않는다', async () => {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
  await expect(run()).rejects.toMatchObject({ kind: 'offline' });
  expect(calls).toEqual([]);
});
it('PUT 실패 뒤 최종 제출하지 않으며 재시도는 presign부터 시작한다', async () => {
  let attempts = 0;
  server.use(
    http.put(uploadUrl, () => new HttpResponse(null, { status: ++attempts === 1 ? 500 : 200 })),
  );
  await expect(run()).rejects.toMatchObject({ kind: 'failed' });
  expect(calls).toEqual(['presign']);
  await run();
  expect(calls).toEqual(['presign', 'presign', 'submit']);
});
it.each([400, 401, 403, 404, 409])(
  '최종 %i는 원문을 숨긴 확정 실패이며 재전송하지 않는다',
  async (status) => {
    let count = 0;
    server.use(
      http.post(endpoint, () => {
        count++;
        return HttpResponse.json({ message: 'secret' }, { status });
      }),
    );
    await expect(run()).rejects.toMatchObject({
      kind: 'failed',
      message: expect.not.stringContaining('secret'),
    });
    expect(count).toBe(1);
  },
);
it.each([
  () => HttpResponse.error(),
  () => new HttpResponse(null, { status: 503 }),
  () => HttpResponse.json(receipt, { status: 200 }),
  () => HttpResponse.json({ ...receipt, status: 'APPROVED' }, { status: 201 }),
  () => HttpResponse.json({ ...receipt, photoId: '9007199254740993' }, { status: 201 }),
  () =>
    HttpResponse.text('invalid json', {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }),
])('응답 유실·5xx·잘못된 접수 응답은 결과 불명이다: %#', async (response) => {
  let count = 0;
  server.use(
    http.post(endpoint, () => {
      count++;
      return response();
    }),
  );
  await expect(run()).rejects.toMatchObject({ kind: 'unknown' });
  expect(count).toBe(1);
});
it('presign 응답 중 이탈하면 PUT을 시작하지 않는다', async () => {
  const controller = new AbortController();
  server.use(
    http.post(`${endpoint}/presign`, () => {
      controller.abort();
      return HttpResponse.json(signed());
    }),
  );
  await expect(run(controller.signal)).rejects.toMatchObject({ kind: 'failed' });
  expect(calls).toEqual([]);
});
it('presign 실패는 업로드 없이 끝나고 원문 오류를 보관하지 않는다', async () => {
  server.use(
    http.post(`${endpoint}/presign`, () =>
      HttpResponse.json({ message: 'secret' }, { status: 503 }),
    ),
  );
  await expect(run()).rejects.toMatchObject({
    kind: 'failed',
    message: expect.not.stringContaining('secret'),
  });
  expect(calls).toEqual([]);
});
it('PUT 응답 중 이탈하면 최종 제출을 시작하지 않는다', async () => {
  const controller = new AbortController();
  server.use(
    http.put(uploadUrl, () => {
      controller.abort();
      return new HttpResponse(null, { status: 200 });
    }),
  );
  await expect(run(controller.signal)).rejects.toMatchObject({ kind: 'failed' });
  expect(calls).toEqual(['presign']);
});
it('PUT은 30초 뒤 실패하고 자동 재시도·최종 제출을 하지 않는다', async () => {
  vi.useFakeTimers();
  let finishUpload: (() => void) | undefined;
  server.use(
    http.put(uploadUrl, async () => {
      calls.push('put');
      await new Promise<void>((resolve) => {
        finishUpload = resolve;
      });
      return new HttpResponse(null, { status: 200 });
    }),
  );

  try {
    await Promise.all([
      expect(run()).rejects.toMatchObject({ kind: 'failed' }),
      (async () => {
        await vi.waitFor(() => expect(calls).toEqual(['presign', 'put']));
        await vi.advanceTimersByTimeAsync(30_000);
      })(),
    ]);
    expect(calls).toEqual(['presign', 'put']);
  } finally {
    finishUpload?.();
    vi.useRealTimers();
  }
});
