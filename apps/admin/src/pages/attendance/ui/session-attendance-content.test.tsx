import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import {
  cancelAttendance,
  closeAttendance,
  getAttendanceHistory,
  getSessionAttendance,
  getTeamReviews,
  updateMemberAttendance,
  updateMemberBadge,
  updateTeamPhotoReview,
} from '~/features/session-management';
import { createSessionStore } from '~/features/session-management/testing';
import { SessionAttendanceContent } from './session-attendance-content';

vi.mock('@tanstack/react-router', () => ({ useHydrated: () => true }));
vi.mock('~/features/session-management', () => ({
  cancelAttendance: vi.fn<typeof cancelAttendance>(),
  closeAttendance: vi.fn<typeof closeAttendance>(),
  getAttendanceHistory: vi.fn<typeof getAttendanceHistory>(),
  getSessionAttendance: vi.fn<typeof getSessionAttendance>(),
  getTeamReviews: vi.fn<typeof getTeamReviews>(),
  updateMemberAttendance: vi.fn<typeof updateMemberAttendance>(),
  updateMemberBadge: vi.fn<typeof updateMemberBadge>(),
  updateTeamPhotoReview: vi.fn<typeof updateTeamPhotoReview>(),
  sessionAttendanceQueryOptions: (sessionId: string) => ({
    queryKey: ['admin', 'sessions', sessionId, 'attendance'],
    queryFn: () => getSessionAttendance(sessionId),
    retry: false,
  }),
  attendanceHistoryQueryOptions: (sessionId: string, membershipId: string) => ({
    queryKey: ['admin', 'sessions', sessionId, 'attendance-history', membershipId],
    queryFn: () => getAttendanceHistory(sessionId, membershipId),
    retry: false,
  }),
  teamReviewsQueryOptions: (sessionId: string) => ({
    queryKey: ['admin', 'sessions', sessionId, 'team-reviews'],
    queryFn: () => getTeamReviews(sessionId),
    retry: false,
  }),
}));

void cancelAttendance;
void closeAttendance;
void updateTeamPhotoReview;

it('열린 오프라인 세션에서 출석 마감 요청을 보낸다', async () => {
  const data = createSessionStore().getSessionAttendance('demo-offline-session');
  vi.mocked(getSessionAttendance).mockResolvedValue(data);
  vi.mocked(closeAttendance).mockResolvedValue(data);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionAttendanceContent sessionId={data.session.id} part="all" />
    </QueryClientProvider>,
  );
  await screen.findByRole('table', { name: /출석 체크/ });
  await userEvent.click(screen.getByRole('button', { name: '출석 마감' }));
  expect(closeAttendance).toHaveBeenCalledWith(data.session.id);
});

it('직군을 바꿔도 세션 전체 집계는 유지하고 사전 보고와 실제 출결을 별도로 표시한다', async () => {
  const data = createSessionStore().getSessionAttendance('demo-offline-session');
  vi.mocked(getSessionAttendance).mockResolvedValue(data);
  const client = new QueryClient();
  const view = (part: 'all' | 'web') => (
    <QueryClientProvider client={client}>
      <SessionAttendanceContent sessionId={data.session.id} part={part} />
    </QueryClientProvider>
  );
  const { rerender } = render(view('all'));
  expect(await screen.findByText(`출석 체크 · ${data.members.length}명`)).toBeVisible();
  rerender(view('web'));
  const filtered = data.members.filter((member) => member.part === 'web');
  expect(screen.getByText(`출석 체크 · ${filtered.length}명`)).toBeVisible();
  expect(screen.getByText(`출석 요약 · 전체 ${data.members.length}명`)).toBeVisible();
  expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(filtered.length + 1);
  expect(screen.getByRole('columnheader', { name: '사전 보고' })).toBeVisible();
  expect(screen.getByRole('columnheader', { name: '현재 출결 · 점수' })).toBeVisible();
  rerender(view('all'));
  await userEvent.click(screen.getByRole('button', { name: /사전 보고 기록/ }));
  expect(screen.getByRole('table', { name: /사전 보고 기록/ })).toBeVisible();
  expect(screen.getByText('사전 보고 기록 · 3명')).toBeVisible();
});

it('회원별 변경 이력을 열고 이력이 없는 상태를 구분한다', async () => {
  const data = createSessionStore().getSessionAttendance('demo-offline-session');
  vi.mocked(getSessionAttendance).mockResolvedValue(data);
  vi.mocked(getAttendanceHistory).mockResolvedValue([]);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionAttendanceContent sessionId={data.session.id} part="all" />
    </QueryClientProvider>,
  );
  await screen.findByRole('table', { name: /출석 체크/ });
  const historyButton = screen.getAllByRole('button', { name: '이력' })[0];
  if (!historyButton) {
    throw new Error('이력 버튼이 없습니다.');
  }
  await userEvent.click(historyButton);
  expect(await screen.findByRole('region', { name: '출결 변경 이력' })).toHaveTextContent(
    '변경 이력이 없습니다.',
  );
  expect(getAttendanceHistory).toHaveBeenCalledWith(data.session.id, 'mock-member-1');
});

it('조회 실패 후 다시 시도하면 빈 목록을 표시한다', async () => {
  const data = createSessionStore().getSessionAttendance('demo-offline-session');
  vi.mocked(getSessionAttendance)
    .mockRejectedValueOnce(new Error('조회 실패'))
    .mockResolvedValueOnce({ ...data, members: [] });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionAttendanceContent sessionId={data.session.id} part="all" />
    </QueryClientProvider>,
  );
  expect(await screen.findByRole('alert')).toHaveTextContent('출석 내역을 불러오지 못했습니다.');
  await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByText('해당 직군의 출석 대상자가 없습니다.')).toBeVisible();
});

it('출결 상태와 명찰 확인은 서로 독립적으로 mock mutation을 호출한다', async () => {
  const data = createSessionStore().getSessionAttendance('demo-offline-session');
  const member = data.members[0];
  if (!member) {
    throw new Error('mock 회원이 없습니다.');
  }
  vi.mocked(getSessionAttendance).mockResolvedValue(data);
  vi.mocked(updateMemberAttendance).mockResolvedValue(member);
  vi.mocked(updateMemberBadge).mockResolvedValue(member);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionAttendanceContent sessionId={data.session.id} part="all" />
    </QueryClientProvider>,
  );
  await screen.findByRole('table', { name: /출석 체크/ });
  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: '가상 회원 1 출결 상태' }),
    'absent',
  );
  const badgeButton = screen.getAllByRole('button', { name: '명찰 확인' })[0];
  if (!badgeButton) {
    throw new Error('명찰 버튼이 없습니다.');
  }
  await userEvent.click(badgeButton);
  expect(updateMemberAttendance).toHaveBeenCalledWith(
    data.session.id,
    expect.objectContaining({ membershipId: 'mock-member-1', status: 'absent' }),
  );
  expect(updateMemberBadge).toHaveBeenCalledWith(data.session.id, {
    membershipId: 'mock-member-1',
    verified: true,
  });
});

it('팀 세션의 검수 대기 사진은 출석 마감을 막고 승인 후 마감할 수 있다', async () => {
  const store = createSessionStore();
  const data = store.getSessionAttendance('demo-team-session');
  const reviews = store.getTeamReviews('demo-team-session');
  const pending = reviews.find((review) => review.reviewState === 'pending');
  if (!pending?.photo) {
    throw new Error('검수 대기 사진이 필요합니다.');
  }
  const pendingPhoto = pending.photo;
  vi.mocked(getSessionAttendance).mockResolvedValue(data);
  vi.mocked(getTeamReviews).mockResolvedValue(reviews);
  vi.mocked(updateTeamPhotoReview).mockResolvedValue({
    teamId: pending.teamId,
    teamName: pending.teamName,
    members: pending.members,
    reviewState: 'approved',
    photo: pendingPhoto,
    decisionDraft: null,
  });
  vi.mocked(closeAttendance).mockResolvedValue({
    ...data,
    session: { ...data.session, phase: 'closed', canCancelClose: true },
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionAttendanceContent sessionId={data.session.id} part="all" />
    </QueryClientProvider>,
  );
  await screen.findByText('검수 대기');
  expect(screen.getByRole('region', { name: '팀 사진 검수' })).toHaveTextContent('검수 대기');
  expect(screen.getByRole('button', { name: '출석 마감' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: '승인' }));
  expect(updateTeamPhotoReview).toHaveBeenCalledWith(data.session.id, {
    photoId: pendingPhoto.photoId,
    decision: 'approve',
    reason: null,
  });
});
