/** 팀 확정 요약의 원본 집계·미배정 경고·최종 실행 비활성 상태를 검증한다. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from 'overlay-kit';
import { expect, it, vi } from 'vitest';
import { teamMappingConfirmedFixture, teamMappingDraftFixture } from '~/features/team-management';
import { TeamConfirmDialog } from './team-confirm-dialog';

it('배정 중 원본 집계와 미배정 경고를 표시하고 확정을 비활성화한다', async () => {
  const user = userEvent.setup();
  render(
    <OverlayProvider>
      <TeamConfirmDialog snapshot={teamMappingDraftFixture} onClose={() => undefined} />
    </OverlayProvider>,
  );

  expect(screen.getByRole('dialog')).toHaveTextContent('8팀');
  expect(screen.getByRole('dialog')).toHaveTextContent('42명');
  expect(screen.getByRole('dialog')).toHaveTextContent('10명');
  expect(screen.getByRole('alert')).toHaveTextContent('미배정 회원이 있어요');

  const confirmButton = screen.getByRole('button', { name: '팀 확정 (준비 중)' });
  expect(confirmButton).toBeDisabled();
  await user.click(confirmButton);
  expect(screen.getByRole('dialog')).toBeVisible();
});

it('확정 상태의 요약도 미배정 수를 기준으로 경고하고 닫을 수 있다', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn<() => void>();
  render(
    <OverlayProvider>
      <TeamConfirmDialog snapshot={teamMappingConfirmedFixture} onClose={onClose} />
    </OverlayProvider>,
  );

  expect(screen.getByRole('alert')).toHaveTextContent('미배정 회원이 있어요');
  await user.click(screen.getByRole('button', { name: '닫기' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});
