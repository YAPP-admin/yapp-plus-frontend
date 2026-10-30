import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import { getSessionAttendance } from '~/features/session-management';
import { createSessionStore } from '~/features/session-management/testing';
import { SessionAttendanceContent } from './session-attendance-content';

vi.mock('@tanstack/react-router', () => ({ useHydrated: () => true }));
vi.mock('~/features/session-management', () => ({
  getSessionAttendance: vi.fn<typeof getSessionAttendance>(),
}));

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
