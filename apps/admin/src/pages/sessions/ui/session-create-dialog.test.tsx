/** 생성 모달의 입력 전달과 취소·Esc·재진입 동작을 실제 SEED 컴포넌트로 검증합니다. */
import { ActionButton } from '@seed-design/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import type { CreateSessionInput } from '../model/session';
import { SessionCreateDialog } from './session-create-dialog';

function renderDialog() {
  const onSubmit = vi.fn<(input: CreateSessionInput) => void>();
  render(
    <SessionCreateDialog trigger={<ActionButton>새 세션</ActionButton>} onSubmit={onSubmit} />,
  );
  return { onSubmit, user: userEvent.setup() };
}

it('입력한 여섯 항목을 저장 콜백에 전달한다', async () => {
  const { user, onSubmit } = renderDialog();

  await user.click(screen.getByRole('button', { name: '새 세션' }));
  expect(await screen.findByRole('dialog', { name: '세션 만들기' })).toBeVisible();

  await user.type(screen.getByLabelText('세션명'), '팀 발표');
  await user.type(screen.getByLabelText('장소'), '교육장');
  await user.type(screen.getByLabelText('날짜'), '2026-11-01');
  await user.type(screen.getByLabelText('시작 시간'), '14:00');
  await user.type(screen.getByLabelText('종료 시간'), '17:00');
  screen.getByRole('combobox', { name: '유형' }).focus();
  await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
  await user.click(screen.getByRole('button', { name: '저장' }));

  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith({
      name: '팀 발표',
      location: '교육장',
      date: '2026-11-01',
      startTime: '14:00',
      endTime: '17:00',
      type: 'team',
    }),
  );
});

it('취소하면 제출하지 않고 다음에 열 때 입력을 초기화한다', async () => {
  const { user, onSubmit } = renderDialog();

  await user.click(screen.getByRole('button', { name: '새 세션' }));
  await user.type(await screen.findByLabelText('세션명'), '작성 중');
  await user.click(screen.getByRole('button', { name: '취소' }));

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(onSubmit).not.toHaveBeenCalled();

  await user.click(screen.getByRole('button', { name: '새 세션' }));

  expect(await screen.findByLabelText('세션명')).toHaveValue('');
  expect(screen.getByRole('combobox', { name: '유형' })).toHaveTextContent('정규 세션');
});

it('Esc로 닫으면 열기 버튼으로 포커스가 돌아온다', async () => {
  const { user } = renderDialog();
  const trigger = screen.getByRole('button', { name: '새 세션' });

  await user.click(trigger);
  await screen.findByRole('dialog', { name: '세션 만들기' });
  await user.keyboard('{Escape}');

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await waitFor(() => expect(trigger).toHaveFocus());
});
