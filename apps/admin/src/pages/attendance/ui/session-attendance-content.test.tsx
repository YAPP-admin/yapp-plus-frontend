import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type * as TanStackRouter from '@tanstack/react-router';
import { expect, it, vi } from 'vitest';
import type * as SessionManagement from '~/features/session-management';
import {
  cancelAttendance,
  closeAttendance,
  getAttendanceCode,
  getAttendanceHistory,
  getSessionAttendance,
  getTeamReviews,
  updateMemberAttendance,
  updateMemberBadge,
  updateTeamPhotoReview,
  issueAttendanceCode,
  reissueAttendanceCode,
} from '~/features/session-management';
import { createSessionStore } from '~/features/session-management/testing';
import { SessionAttendanceContent } from './session-attendance-content';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof TanStackRouter>();
  return { ...actual, useHydrated: () => true };
});
vi.mock('~/features/session-management', async (importOriginal) => {
  const actual = await importOriginal<typeof SessionManagement>();
  return {
    ...actual,
    cancelAttendance: vi.fn<typeof cancelAttendance>(),
    closeAttendance: vi.fn<typeof closeAttendance>(),
    getAttendanceCode: vi.fn<typeof getAttendanceCode>(),
    getAttendanceHistory: vi.fn<typeof getAttendanceHistory>(),
    getSessionAttendance: vi.fn<typeof getSessionAttendance>(),
    getTeamReviews: vi.fn<typeof getTeamReviews>(),
    updateMemberAttendance: vi.fn<typeof updateMemberAttendance>(),
    updateMemberBadge: vi.fn<typeof updateMemberBadge>(),
    updateTeamPhotoReview: vi.fn<typeof updateTeamPhotoReview>(),
    issueAttendanceCode: vi.fn<typeof issueAttendanceCode>(),
    reissueAttendanceCode: vi.fn<typeof reissueAttendanceCode>(),
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
    attendanceCodeQueryOptions: (sessionId: string) => ({
      queryKey: ['admin', 'sessions', sessionId, 'attendance-code'],
      queryFn: () => getAttendanceCode(sessionId),
      retry: false,
    }),
  };
});

void cancelAttendance;
void closeAttendance;
void updateTeamPhotoReview;
void issueAttendanceCode;
void reissueAttendanceCode;

it('열린 정규 세션에서 출석 마감 요청을 보낸다', async () => {
  const data = createSessionStore().getSessionAttendance('demo-regular-session');
  vi.mocked(getSessionAttendance).mockResolvedValue(data);
  vi.mocked(getAttendanceCode).mockResolvedValue({
    state: 'notIssued',
    code: null,
    expiresAt: null,
  });
  vi.mocked(closeAttendance).mockResolvedValue(data);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionAttendanceContent sessionId={data.session.id} part="all" />
    </QueryClientProvider>,
  );
  await screen.findByRole('table', { name: /출석 체크/ });
  await userEvent.click(screen.getByRole('button', { name: '출석 마감' }));
  expect(closeAttendance).toHaveBeenCalledWith(data.session.id);
  expect(await screen.findByRole('button', { name: '마감 취소' })).toBeVisible();
});

it('출석 코드를 발급하고 재발급하면 코드 조회를 갱신한다', async () => {
  const data = createSessionStore().getSessionAttendance('demo-regular-session');
  vi.mocked(getSessionAttendance).mockResolvedValue(data);
  vi.mocked(getAttendanceCode)
    .mockResolvedValueOnce({ state: 'notIssued', code: null, expiresAt: null })
    .mockResolvedValueOnce({
      state: 'active',
      code: '101739',
      expiresAt: '2026-11-01T15:10:00+09:00',
    });
  vi.mocked(issueAttendanceCode).mockResolvedValue({
    state: 'active',
    code: '101739',
    expiresAt: '2026-11-01T15:10:00+09:00',
  });
  vi.mocked(reissueAttendanceCode).mockResolvedValue({
    state: 'active',
    code: '103478',
    expiresAt: '2026-11-01T15:20:00+09:00',
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionAttendanceContent sessionId={data.session.id} part="all" />
    </QueryClientProvider>,
  );
  await screen.findByRole('region', { name: '출석 코드' });
  await userEvent.click(screen.getByRole('button', { name: '출석 코드 발급' }));
  expect(issueAttendanceCode).toHaveBeenCalledWith(data.session.id);
});

it('직군을 바꿔도 세션 전체 집계는 유지하고 사전 보고와 실제 출결을 별도로 표시한다', async () => {
  const data = createSessionStore().getSessionAttendance('demo-regular-session');
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
  const tabs = screen.getAllByRole('tab');
  expect(tabs).toHaveLength(2);
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'attendance-tab');
  rerender(view('all'));
  await userEvent.click(screen.getByRole('tab', { name: /사전 보고 기록/ }));
  expect(screen.getByRole('tab', { name: /사전 보고 기록/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'reports-tab');
  expect(screen.getByRole('table', { name: /사전 보고 기록/ })).toBeVisible();
  expect(screen.getByText('사전 보고 기록 · 3명')).toBeVisible();
});

it('회원별 변경 이력을 열고 이력이 없는 상태를 구분한다', async () => {
  const data = createSessionStore().getSessionAttendance('demo-regular-session');
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
  expect(await screen.findByText('변경 이력이 없습니다.')).toBeVisible();
  expect(screen.getByRole('region', { name: '출결 변경 이력' })).toBeVisible();
  expect(getAttendanceHistory).toHaveBeenCalledWith(data.session.id, 'mock-member-1');
});

it('변경 이력 조회 실패 후 다시 시도할 수 있다', async () => {
  const data = createSessionStore().getSessionAttendance('demo-regular-session');
  const member = data.members[0];
  if (!member) {
    throw new Error('mock 회원이 없습니다.');
  }
  vi.mocked(getSessionAttendance).mockResolvedValue(data);
  vi.mocked(getAttendanceHistory)
    .mockRejectedValueOnce(new Error('조회 실패'))
    .mockResolvedValueOnce([]);
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
  expect(await screen.findByRole('alert')).toHaveTextContent('변경 이력을 불러오지 못했습니다.');
  await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(await screen.findByText('변경 이력이 없습니다.')).toBeVisible();
});

it('조회 실패 후 다시 시도하면 빈 목록을 표시한다', async () => {
  const data = createSessionStore().getSessionAttendance('demo-regular-session');
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
  const data = createSessionStore().getSessionAttendance('demo-regular-session');
  const member = data.members[0];
  if (!member) {
    throw new Error('mock 회원이 없습니다.');
  }
  vi.mocked(getSessionAttendance).mockResolvedValue(data);
  vi.mocked(getAttendanceCode).mockResolvedValue({
    state: 'notIssued',
    code: null,
    expiresAt: null,
  });
  vi.mocked(updateMemberAttendance).mockResolvedValue(member);
  vi.mocked(updateMemberBadge).mockResolvedValue(member);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionAttendanceContent sessionId={data.session.id} part="all" />
    </QueryClientProvider>,
  );
  await screen.findByRole('table', { name: /출석 체크/ });
  await userEvent.click(screen.getByRole('button', { name: /가상 회원 1 출결 상태/ }));
  const picker = await screen.findByRole('dialog', { name: '현재 출결 선택' });
  for (const label of ['출석', '결석', '무단결석', '지각', '무단지각', '조퇴', '무단조퇴']) {
    expect(within(picker).getAllByText(label, { exact: true }).length).toBeGreaterThan(0);
  }
  expect(within(picker).getAllByText('1시간', { exact: true })).toHaveLength(4);
  expect(within(picker).getAllByText('3시간', { exact: true })).toHaveLength(4);
  await userEvent.click(within(picker).getByRole('button', { name: /^무단결석 -20점/ }));
  const badgeButton = screen.getAllByRole('button', { name: '명찰 확인' })[0];
  if (!badgeButton) {
    throw new Error('명찰 버튼이 없습니다.');
  }
  await userEvent.click(badgeButton);
  expect(updateMemberAttendance).toHaveBeenCalledWith(
    data.session.id,
    expect.objectContaining({
      membershipId: 'mock-member-1',
      status: 'absent',
      penaltyCategory: 'unauthorized',
    }),
  );
  expect(updateMemberBadge).toHaveBeenCalledWith(data.session.id, {
    membershipId: 'mock-member-1',
    verified: true,
  });
});

it('시간 상태는 여러 그룹을 선택해 함께 적용한다', async () => {
  const data = createSessionStore().getSessionAttendance('demo-regular-session');
  vi.mocked(getSessionAttendance).mockResolvedValue(data);
  vi.mocked(getAttendanceCode).mockResolvedValue({
    state: 'notIssued',
    code: null,
    expiresAt: null,
  });
  const member = data.members[0];
  if (!member) {
    throw new Error('mock 회원이 없습니다.');
  }
  vi.mocked(updateMemberAttendance).mockClear().mockResolvedValue(member);
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SessionAttendanceContent sessionId={data.session.id} part="all" />
    </QueryClientProvider>,
  );

  await screen.findByRole('table', { name: /출석 체크/ });
  await userEvent.click(screen.getByRole('button', { name: /가상 회원 1 출결 상태/ }));
  const picker = await screen.findByRole('dialog', { name: '현재 출결 선택' });
  const oneHourOptions = within(picker).getAllByRole('button', { name: '1시간 -4점' });
  const lateOption = oneHourOptions[0];
  const earlyLeaveOption = oneHourOptions[1];
  if (!lateOption || !earlyLeaveOption) {
    throw new Error('지각·조퇴 선택지가 없습니다.');
  }

  await userEvent.click(lateOption);
  await userEvent.click(earlyLeaveOption);
  expect(lateOption).toHaveAttribute('aria-pressed', 'true');
  expect(earlyLeaveOption).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(within(picker).getByRole('button', { name: '선택 적용' }));

  expect(updateMemberAttendance).toHaveBeenNthCalledWith(
    1,
    data.session.id,
    expect.objectContaining({ status: 'late', durationBand: 'withinOneHour' }),
  );
  expect(updateMemberAttendance).toHaveBeenNthCalledWith(
    2,
    data.session.id,
    expect.objectContaining({ status: 'earlyLeave', durationBand: 'withinOneHour' }),
  );
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
  expect(screen.queryByRole('region', { name: '출석 코드' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '출석 마감' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: '승인' }));
  expect(updateTeamPhotoReview).toHaveBeenCalledWith(data.session.id, {
    photoId: pendingPhoto.photoId,
    decision: 'approve',
    reason: null,
  });
});
