import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { sessionSchema, type Session } from '../model/session';
import { SessionCard } from './session-card';

it('세션 정보와 서로 다른 다섯 출석 집계를 생략 없이 표시한다', () => {
  const session = sessionSchema.parse({
    id: 'sample-session',
    name: '긴 세션명도 전체 내용으로 제공하는 오프라인 세션',
    location: {
      roadAddress: '서울특별시 중구 세종대로 110',
      detailAddress: '예시 교육장',
      latitude: 37.5665,
      longitude: 126.978,
    },
    type: 'offline',
    date: '2026-12-31',
    startTime: '09:05',
    endTime: '18:30',
    attendance: { present: 10, late: 2, absent: 3, pending: 4, reported: 5 },
  });

  render(<SessionCard session={session} />);

  const card = screen.getByRole('article');
  expect(within(card).getByRole('heading', { name: session.name })).toBeVisible();
  expect(within(card).getByText('서울특별시 중구 세종대로 110 예시 교육장')).toBeVisible();
  expect(within(card).getByText('오프라인')).toBeVisible();
  expect(within(card).getByText('2026.12.31 · 09:05')).toBeVisible();
  expect(within(card).getByText('18:30')).toBeVisible();

  const terms = within(card).getAllByRole('term');
  const values = within(card).getAllByRole('definition');

  expect(terms.map((term) => term.textContent)).toEqual([
    '일정',
    '장소',
    '출석',
    '지각',
    '결석',
    '미처리',
    '출결 보고',
  ]);
  expect(values.slice(2).map((value) => value.textContent)).toEqual([
    '10명',
    '2명',
    '3명',
    '4명',
    '5명',
  ]);
});

it.each(['', '팀에서 정한 장소'])('팀 안내 %s를 표시한다', (guide) => {
  const session = sessionSchema.parse({
    id: 'team',
    name: '팀 세션',
    type: 'team',
    location: { guide },
    date: '2026-12-31',
    startTime: '09:00',
    endTime: '10:00',
    attendance: { present: 0, late: 0, absent: 0, pending: 0, reported: 0 },
  });
  render(<SessionCard session={session} />);
  expect(screen.getByText(guide || '팀별 자율 장소')).toBeVisible();
});

const editableSession = sessionSchema.parse({
  id: 'editable-team',
  name: '수정할 팀 세션',
  type: 'team',
  location: { guide: '' },
  date: '2026-12-31',
  startTime: '09:00',
  endTime: '10:00',
  attendance: { present: 0, late: 0, absent: 0, pending: 0, reported: 0 },
});

it('메뉴에서 수정을 선택하면 해당 세션을 전달하고 메뉴를 닫는다', async () => {
  const user = userEvent.setup();
  const onEdit = vi.fn<(session: Session) => void>();
  render(<SessionCard session={editableSession} onEdit={onEdit} />);

  await user.click(screen.getByRole('button', { name: '수정할 팀 세션 정보' }));
  await user.click(await screen.findByRole('menuitem', { name: '수정' }));

  expect(onEdit).toHaveBeenCalledExactlyOnceWith(editableSession);
  await waitFor(() => expect(screen.getByRole('menu')).toHaveAttribute('data-hidden'));
});

it('Escape와 바깥 클릭으로 메뉴만 닫고 수정은 시작하지 않는다', async () => {
  const user = userEvent.setup();
  const onEdit = vi.fn<(session: Session) => void>();
  render(<SessionCard session={editableSession} onEdit={onEdit} />);
  const trigger = screen.getByRole('button', { name: '수정할 팀 세션 정보' });

  trigger.focus();
  await user.keyboard('{Enter}');
  expect(await screen.findByRole('menuitem', { name: '수정' })).toHaveFocus();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.getByRole('menu')).toHaveAttribute('data-hidden'));

  await user.click(trigger);
  expect(await screen.findByRole('menu')).toBeVisible();
  await user.click(screen.getByRole('heading', { name: editableSession.name }));
  await waitFor(() => expect(screen.getByRole('menu')).toHaveAttribute('data-hidden'));
  expect(onEdit).not.toHaveBeenCalled();
});
