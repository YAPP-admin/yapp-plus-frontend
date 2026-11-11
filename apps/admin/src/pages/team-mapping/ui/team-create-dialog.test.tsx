/** 팀 생성 입력의 필수 조건·초안 상태와 제출 경계를 검증한다. */
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from 'overlay-kit';
import { expect, it, vi } from 'vitest';
import { teamMappingBeforeFixture, type TeamDraftValues } from '~/features/team-management';
import { TeamCreateDialog } from './team-create-dialog';

function renderDialog() {
  const onClose = vi.fn<() => void>();
  const onCreate = vi.fn<(values: TeamDraftValues) => void>();

  render(
    <OverlayProvider>
      <TeamCreateDialog snapshot={teamMappingBeforeFixture} onClose={onClose} onCreate={onCreate} />
    </OverlayProvider>,
  );

  return { onCreate, onClose };
}

it('열리면 팀명 입력과 팀원 선택 영역을 표시한다', async () => {
  renderDialog();

  const nameInput = await screen.findByRole('textbox', { name: '팀명' });

  expect(nameInput).toBeVisible();
  expect(screen.getByRole('heading', { name: '팀 만들기' })).toBeVisible();
  expect(screen.getByRole('searchbox', { name: '회원 검색' })).toBeVisible();
});

it('팀명과 팀원 필수 조건을 검증하고 만들기를 비활성화한다', async () => {
  const user = userEvent.setup();
  renderDialog();

  const nameInput = await screen.findByRole('textbox', { name: '팀명' });
  const createButton = screen.getByRole('button', { name: '팀 만들기 (준비 중)' });

  expect(createButton).toBeDisabled();
  await user.click(nameInput);
  await user.tab();
  expect(await screen.findByText('팀명을 입력하세요.')).toBeVisible();

  await user.type(nameInput, '새 팀');
  expect(createButton).toBeDisabled();
  expect(screen.getAllByText('팀원을 1명 이상 추가하세요.')).not.toHaveLength(0);
});

it('초안 입력을 원래 값으로 되돌릴 수 있다', async () => {
  const user = userEvent.setup();
  renderDialog();

  const nameInput = await screen.findByRole('textbox', { name: '팀명' });
  await user.type(nameInput, '임시 팀');
  expect(nameInput).toHaveValue('임시 팀');

  await user.clear(nameInput);
  expect(nameInput).toHaveValue('');
});

it('입력을 원래 값으로 되돌리면 이탈 확인 없이 닫힌다', async () => {
  const user = userEvent.setup();
  const { onClose } = renderDialog();
  const nameInput = await screen.findByRole('textbox', { name: '팀명' });

  await user.type(nameInput, '임시 팀');
  await user.clear(nameInput);
  await user.click(screen.getByRole('button', { name: '취소' }));

  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('유효한 이름을 입력해도 Enter 제출과 실제 생성을 실행하지 않는다', async () => {
  const user = userEvent.setup();
  const { onCreate } = renderDialog();

  const nameInput = await screen.findByRole('textbox', { name: '팀명' });
  await user.type(nameInput, '새 팀');
  await user.keyboard('{Enter}');

  expect(onCreate).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog')).toBeVisible();
});

it('한글 조합 중 Enter는 입력을 방해하지 않는다', async () => {
  renderDialog();

  const nameInput = await screen.findByRole('textbox', { name: '팀명' });
  const event = createEvent.keyDown(nameInput, { key: 'Enter', isComposing: true });

  fireEvent(nameInput, event);

  expect(event.defaultPrevented).toBe(false);
});

it('변경 후 닫으면 계속 편집과 변경 버리기를 선택할 수 있다', async () => {
  const user = userEvent.setup();
  const { onClose } = renderDialog();
  const nameInput = await screen.findByRole('textbox', { name: '팀명' });

  await user.type(nameInput, '임시 팀');
  await user.click(screen.getByRole('button', { name: '취소' }));

  const leaveDialog = await screen.findByRole('alertdialog');
  expect(leaveDialog).toHaveTextContent('변경을 버리고 나갈까요?');
  await user.click(screen.getByRole('button', { name: '계속 편집' }));
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(nameInput).toHaveValue('임시 팀');

  await user.click(screen.getByRole('button', { name: '취소' }));
  await user.click(await screen.findByRole('button', { name: '변경 버리기' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});
