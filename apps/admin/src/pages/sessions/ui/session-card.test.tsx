/** 카드의 세션 정보와 다섯 출석 집계가 빠짐없이 표시되는지 검증합니다. */
import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { sessionSchema } from '../model/session';
import { SessionCard } from './session-card';

it('세션 정보와 서로 다른 다섯 출석 집계를 생략 없이 표시한다', () => {
  const session = sessionSchema.parse({
    id: 'sample-session',
    name: '긴 세션명도 전체 내용으로 제공하는 오프라인 세션',
    location: '서울 예시 교육장 3층 다목적 강의실',
    type: 'offline',
    date: '2026-12-31',
    startTime: '09:05',
    endTime: '18:30',
    attendance: { present: 10, late: 2, absent: 3, pending: 4, reported: 5 },
  });

  render(<SessionCard session={session} />);

  const card = screen.getByRole('article');
  expect(within(card).getByRole('heading', { name: session.name })).toBeVisible();
  expect(within(card).getByText(session.location)).toBeVisible();
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
