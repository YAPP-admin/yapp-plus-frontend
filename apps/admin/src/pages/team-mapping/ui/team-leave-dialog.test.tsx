/** 팀 매핑 공통 이탈 확인의 계속 편집·변경 버리기 동작을 검증한다. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from 'overlay-kit';
import { expect, it, vi } from 'vitest';
import { TeamLeaveDialog } from './team-leave-dialog';
import { useTeamLeaveGuard } from './use-team-leave-guard';

function GuardHarness({ dirty, onLeave }: { dirty: boolean; onLeave: () => void }) {
  const { requestLeave } = useTeamLeaveGuard({ dirty, onLeave });

  return (
    <>
      <button type="button" onClick={requestLeave}>
        닫기
      </button>
    </>
  );
}

it('변경이 없으면 닫기 요청을 바로 실행한다', async () => {
  const user = userEvent.setup();
  const onLeave = vi.fn<() => void>();
  render(
    <OverlayProvider>
      <GuardHarness dirty={false} onLeave={onLeave} />
    </OverlayProvider>,
  );

  await user.click(screen.getByRole('button', { name: '닫기' }));
  expect(onLeave).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
});

it('변경이 있으면 계속 편집과 변경 버리기를 선택한다', async () => {
  const user = userEvent.setup();
  const onLeave = vi.fn<() => void>();
  render(
    <OverlayProvider>
      <GuardHarness dirty onLeave={onLeave} />
    </OverlayProvider>,
  );

  await user.click(screen.getByRole('button', { name: '닫기' }));
  expect(await screen.findByRole('alertdialog')).toBeVisible();

  await user.click(screen.getByRole('button', { name: '계속 편집' }));
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(onLeave).not.toHaveBeenCalled();

  await user.click(screen.getByRole('button', { name: '닫기' }));
  await user.click(await screen.findByRole('button', { name: '변경 버리기' }));
  expect(onLeave).toHaveBeenCalledTimes(1);
});

it('공통 이탈 문구의 닫기 동작은 계속 편집으로 처리한다', async () => {
  const user = userEvent.setup();
  const onKeepEditing = vi.fn<() => void>();
  const onDiscard = vi.fn<() => void>();
  render(
    <OverlayProvider>
      <TeamLeaveDialog open onKeepEditing={onKeepEditing} onDiscard={onDiscard} />
    </OverlayProvider>,
  );

  await user.keyboard('{Escape}');
  expect(onKeepEditing).toHaveBeenCalledTimes(1);
  expect(onDiscard).not.toHaveBeenCalled();
});
