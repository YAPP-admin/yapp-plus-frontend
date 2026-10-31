import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import type { MemberScoreViewModel } from '~/features/session-management';
import { filterMemberScores, ScoreRow } from './attendance-page';

const scores: MemberScoreViewModel[] = [
  {
    membershipId: 'member-1',
    name: '가상 회원 1',
    part: 'pm',
    initialScore: 100,
    attendanceEntries: [
      {
        sessionId: 'session-1',
        title: '출석 세션 1',
        score: { source: 'mock', delta: -62, description: 'mock 출결 점수' },
      },
    ],
    adjustmentEntries: [],
    totalScore: 38,
    warning: true,
  },
  {
    membershipId: 'member-2',
    name: '가상 회원 2',
    part: 'ios',
    initialScore: 100,
    attendanceEntries: [
      {
        sessionId: 'session-2',
        title: '출석 세션 2',
        score: { source: 'unknown', delta: null, description: '서버 점수 확인 필요' },
      },
    ],
    adjustmentEntries: [{ id: 'adjustment-1', kind: 'fee', delta: -5, description: '예시 조정' }],
    totalScore: null,
    warning: null,
  },
];

it('회원별 총점과 상세 근거, 40점 미만 경고를 표시한다', async () => {
  const firstScore = scores[0];
  const secondScore = scores[1];
  if (!firstScore || !secondScore) {
    throw new Error('점수 예시가 없습니다.');
  }
  render(
    <table>
      <tbody>
        <ScoreRow score={firstScore} />
        <ScoreRow score={secondScore} />
      </tbody>
    </table>,
  );

  const table = screen.getByRole('table');
  const user = userEvent.setup();
  const detailSummaries = within(table).getAllByText('상세 보기');
  const [firstSummary, secondSummary] = detailSummaries;
  if (!firstSummary || !secondSummary) {
    throw new Error('점수 상세 버튼이 없습니다.');
  }
  await user.click(firstSummary);
  await user.click(secondSummary);
  expect(within(table).getByText('38점')).toBeVisible();
  expect(within(table).getByText(/40점 미만/)).toBeVisible();
  expect(within(table).getByText('계산 대기')).toBeVisible();
  expect(within(table).getByText('출석 세션 1')).toBeVisible();
  expect(within(table).getByText('예시 조정')).toBeVisible();
});

it('직군 필터에 맞는 회원만 반환한다', () => {
  expect(filterMemberScores(scores, 'ios')).toEqual([scores[1]]);
});
