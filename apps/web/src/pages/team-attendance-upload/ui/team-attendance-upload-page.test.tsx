/** 사진 미리보기와 참석자 선택을 유지하고 최종 확인에서 접수한다. */
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ScreenActiveContext } from '@/shared/lib/screen-activity';
import { teamAttendanceTargetSchema, type TeamAttendanceReceipt } from '@/features/team-attendance';
import { apiBaseUrl, server } from '@/mocks/server';
import { TeamAttendanceUploadPage } from './team-attendance-upload-page';
import {
  TeamAttendancePhotoDraftProvider,
  useTeamAttendancePhotoDraft,
} from '../model/team-attendance-photo-draft';

const auth = vi.hoisted(() => ({
  phase: 'SIGNED_IN',
  session: { userId: 1 },
  apiOptions: {},
}));
vi.mock('@/features/auth', () => ({ useNativeAuthSession: () => auth }));
vi.mock('@stackflow/react', () => ({
  useActivity: () => ({ isRoot: true }),
  useFlow: () => ({ replace: vi.fn<() => void>(), pop: vi.fn<() => void>() }),
}));
vi.mock('@/app/navigation/tab-link', () => ({
  TabLink: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}));

const target = teamAttendanceTargetSchema.parse({
  sessionId: 1,
  teamId: 1,
  teamName: '검증 팀',
  selfMembershipId: 2,
  members: [
    { membershipId: 1, name: '강야뿌', positionLabel: 'PM' },
    { membershipId: 2, name: '김야뿌', positionLabel: 'Design' },
  ],
});
const onSubmitted = vi.fn<(receipt: TeamAttendanceReceipt) => void>();

function PhotoDraftFixture({ children }: { children: ReactNode }) {
  const { setPhoto } = useTeamAttendancePhotoDraft();
  useEffect(() => {
    setPhoto(new File(['abc'], 'team-attendance.jpg', { type: 'image/jpeg' }));
  }, [setPhoto]);
  return children;
}

function setup() {
  const client = new QueryClient();
  return {
    ...render(
      <QueryClientProvider client={client}>
        <TeamAttendancePhotoDraftProvider>
          <PhotoDraftFixture>
            <ScreenActiveContext value>
              <TeamAttendanceUploadPage target={target} onSubmitted={onSubmitted} />
            </ScreenActiveContext>
          </PhotoDraftFixture>
        </TeamAttendancePhotoDraftProvider>
      </QueryClientProvider>,
    ),
    user: userEvent.setup(),
  };
}

beforeEach(() => vi.clearAllMocks());

it('선택한 사진을 미리보기로 유지하고 확인 때 명단과 함께 접수한다', async () => {
  server.use(
    http.post(`${apiBaseUrl}/api/sessions/1/team-attendance-photos/presign`, () =>
      HttpResponse.json({
        imageKey: 'uploaded-key',
        uploadUrl: 'https://storage.test/photo',
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
        signedHeaders: { 'Content-Type': 'image/jpeg' },
      }),
    ),
    http.put('https://storage.test/photo', () => new HttpResponse(null, { status: 200 })),
    http.post(`${apiBaseUrl}/api/sessions/1/team-attendance-photos`, () =>
      HttpResponse.json(
        { photoId: 1, submittedAt: '2026-11-16T00:00:00Z', status: 'PENDING' },
        { status: 201 },
      ),
    ),
  );
  const { user } = setup();
  expect((await screen.findByAltText('선택한 팀 인증 사진')).getAttribute('src')).toMatch(/^blob:/);
  expect(screen.getByRole('checkbox', { name: /김야뿌/ })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: /김야뿌/ })).toBeDisabled();
  await user.click(screen.getByRole('checkbox', { name: /강야뿌/ }));
  await user.click(screen.getByRole('button', { name: '인증 사진 제출하기' }));
  await waitFor(() =>
    expect(onSubmitted).toHaveBeenCalledWith(
      expect.objectContaining({ teamName: '검증 팀', status: 'PENDING' }),
    ),
  );
});
