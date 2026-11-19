/** 회식 상세의 고정 정보가 fixture에서 올바르게 표시되는지 검증합니다. */
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { getDiningDevelopmentFixtures } from '../model/dining-fixtures.development';
import { DiningDetailPage } from './dining-detail-page';

vi.mock('@/app/navigation/activity-link', () => ({
  ActivityLink: ({
    activityName: _activityName,
    activityParams: _activityParams,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    activityName: string;
    activityParams: object;
  }) => <a {...props}>{children}</a>,
}));

it('회식 제목·설명·일정·조사 기한을 표시한다', () => {
  const fixtures = getDiningDevelopmentFixtures();
  if (!fixtures) {
    throw new Error('개발 fixture가 필요합니다.');
  }

  render(<DiningDetailPage dining={fixtures.scenarios.openUnanswered} now={fixtures.now} />);

  expect(screen.getByRole('heading', { name: '33기 OT 뒤풀이' })).toBeVisible();
  expect(screen.getByText('OT 끝나고 다 같이 저녁 먹어요! 33기 첫 회식이에요.')).toBeVisible();
  expect(screen.getByText('2026.03.21 (토) 18:30')).toBeVisible();
  expect(screen.getByText('2026.03.20 (금) 23:59')).toBeVisible();
});
