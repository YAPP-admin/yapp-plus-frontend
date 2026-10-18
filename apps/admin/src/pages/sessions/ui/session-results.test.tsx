/** 세션 조회의 로딩·실패·복구와 빈 상태 CTA, 프로덕션 조회 차단을 검증합니다. */
import { useState } from 'react';
import type { SessionFilter } from '../model/session-search';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { listSessions } from '../model/sessions';
import { sessionSchema, type Session } from '../model/session';
import { SessionResults } from './session-results';

vi.mock('../model/sessions', () => ({ listSessions: vi.fn<typeof listSessions>() }));

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

const session = sessionSchema.parse({
  id: 'regular',
  name: '정규 세션 모임',
  location: '교육장',
  type: 'regular',
  date: '2026-10-18',
  startTime: '09:00',
  endTime: '10:00',
  attendance: { present: 0, late: 0, absent: 0, pending: 0, reported: 0 },
});

function ResultsPreview({ initialType }: { initialType: SessionFilter }) {
  const [type, setType] = useState(initialType);
  return <SessionResults type={type} onResetFilter={() => setType('all')} onCreate={() => {}} />;
}

function renderResults(type: 'all' | 'team' = 'all') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });

  return render(
    <QueryClientProvider client={client}>
      <ResultsPreview initialType={type} />
    </QueryClientProvider>,
  );
}

it('조회가 끝날 때까지 로딩을 안내하고 완료되면 목록을 표시한다', async () => {
  let complete: (sessions: Session[]) => void = vi.fn<(sessions: Session[]) => void>();
  const response = new Promise<Session[]>((resolve) => {
    complete = resolve;
  });
  vi.mocked(listSessions).mockReturnValue(response);

  renderResults();

  expect(screen.getByRole('status')).toHaveTextContent('세션 목록을 불러오는 중입니다.');

  complete([session]);

  expect(await screen.findByRole('heading', { name: '정규 세션 모임' })).toBeVisible();
});

it('조회 실패 후 다시 시도하면 목록을 복구한다', async () => {
  vi.mocked(listSessions)
    .mockRejectedValueOnce(new Error('조회 실패'))
    .mockResolvedValueOnce([session]);
  const user = userEvent.setup();

  renderResults();

  expect(await screen.findByRole('alert')).toHaveTextContent('세션 목록을 불러오지 못했어요');

  await user.click(screen.getByRole('button', { name: '다시 시도' }));

  expect(await screen.findByRole('heading', { name: '정규 세션 모임' })).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('전체 데이터가 없으면 등록된 세션이 없다고 안내한다', async () => {
  vi.mocked(listSessions).mockResolvedValue([]);

  renderResults();

  expect(await screen.findByRole('heading', { name: '아직 만든 세션이 없어요' })).toBeVisible();
  expect(screen.getByRole('button', { name: '세션 만들기' })).toBeEnabled();
});

it('다른 유형의 데이터만 있으면 유형 변경을 안내한다', async () => {
  vi.mocked(listSessions).mockResolvedValue([session]);

  renderResults('team');

  expect(await screen.findByRole('heading', { name: '조건에 맞는 세션이 없어요' })).toBeVisible();

  await userEvent.setup().click(screen.getByRole('button', { name: '필터 초기화' }));

  expect(await screen.findByRole('heading', { name: '정규 세션 모임' })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('전체 1개');
});

it('프로덕션에서는 조회하지 않고 준비 중 안내를 표시한다', () => {
  vi.stubEnv('DEV', false);

  renderResults();

  expect(screen.getByText('세션 관리 기능을 준비 중입니다.')).toBeVisible();
  expect(listSessions).not.toHaveBeenCalled();
});

it('전체 데이터가 없어도 필터 선택 중이면 초기화 후 생성 안내를 표시한다', async () => {
  vi.mocked(listSessions).mockResolvedValue([]);
  renderResults('team');

  await userEvent.setup().click(await screen.findByRole('button', { name: '필터 초기화' }));

  expect(await screen.findByRole('heading', { name: '아직 만든 세션이 없어요' })).toBeVisible();
});
