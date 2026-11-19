/** 회식 응답 완료 뒤 사용자가 즉시 제출 결과를 확인하는 흐름을 검증합니다. */
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from '@yapp-plus/ui';
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

it('미응답 회식에 참석 여부를 제출하면 성공 Snackbar를 표시한다', async () => {
  const fixtures = getDiningDevelopmentFixtures();
  if (!fixtures) {
    throw new Error('개발 fixture가 필요합니다.');
  }

  const user = userEvent.setup();

  render(
    <SnackbarProvider>
      <DiningDetailPage
        dining={fixtures.scenarios.openUnanswered}
        now={fixtures.now}
        currentMemberId={fixtures.currentMemberId}
      />
    </SnackbarProvider>,
  );

  expect(screen.getByRole('heading', { name: '33기 OT 뒤풀이' })).toBeVisible();
  expect(screen.getByText('OT 끝나고 다 같이 저녁 먹어요! 33기 첫 회식이에요.')).toBeVisible();
  expect(screen.getByText('2026.03.21 (토) 18:30')).toBeVisible();
  expect(screen.getByText('2026.03.20 (금) 23:59')).toBeVisible();

  const attendButtons = screen.getAllByRole('button', { name: '참석' });
  const [firstRoundAttendButton, secondRoundAttendButton] = attendButtons;
  if (!firstRoundAttendButton || !secondRoundAttendButton) {
    throw new Error('두 차수의 참석 선택지가 필요합니다.');
  }
  await user.click(firstRoundAttendButton);
  await user.click(secondRoundAttendButton);
  await user.click(screen.getByRole('button', { name: '제출하기' }));

  expect(await screen.findByText('참석 여부를 제출했어요.')).toBeVisible();
  expect(screen.getByRole('button', { name: '수정하기' })).toBeVisible();
});
