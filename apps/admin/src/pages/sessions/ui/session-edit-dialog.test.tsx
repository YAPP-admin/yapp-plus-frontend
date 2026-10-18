/** 수정 폼의 저장값 초기화, 대상 전환 및 검증·실패 상태를 확인합니다. */
import { ActionButton } from '@seed-design/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ComponentProps } from 'react';
import { expect, it, vi } from 'vitest';
import type { CreateSessionInput, Session } from '../model/session';
import { SessionEditDialog as ControlledEditDialog } from './session-edit-dialog';

function SessionEditDialog(props: Omit<ComponentProps<typeof ControlledEditDialog>, 'onClose'>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ActionButton onClick={() => setOpen(true)}>세션 정보</ActionButton>
      {open && <ControlledEditDialog {...props} onClose={() => setOpen(false)} />}
    </>
  );
}

const session: Session = {
  id: 'edit-session',
  name: '정규 세션',
  location: '교육장',
  date: '2026-11-01',
  startTime: '14:00',
  endTime: '17:00',
  type: 'regular',
  attendance: { present: 3, late: 1, absent: 0, pending: 5, reported: 0 },
};

it('저장된 여섯 항목을 표시하고 수정한 입력만 제출한다', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn<(input: CreateSessionInput) => void>();
  render(<SessionEditDialog session={session} onSubmit={onSubmit} />);
  await user.click(screen.getByRole('button', { name: '세션 정보' }));
  expect(await screen.findByRole('dialog', { name: '세션 수정' })).toBeVisible();
  expect(screen.getByLabelText('세션명')).toHaveValue('정규 세션');
  expect(screen.getByLabelText('장소')).toHaveValue('교육장');
  expect(screen.getByRole('button', { name: '날짜 선택, 2026-11-01' })).toBeVisible();
  expect(screen.getByRole('button', { name: '시작 시간 선택, 오후 2:00' })).toBeVisible();
  expect(screen.getByRole('button', { name: '종료 시간 선택, 오후 5:00' })).toBeVisible();
  expect(screen.getByRole('combobox', { name: '유형' })).toHaveTextContent('정규 세션');
  await user.clear(screen.getByLabelText('세션명'));
  await user.type(screen.getByLabelText('세션명'), '수정한 세션');
  await user.click(screen.getByRole('button', { name: '저장' }));
  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith({
      name: '수정한 세션',
      location: '교육장',
      date: '2026-11-01',
      startTime: '14:00',
      endTime: '17:00',
      type: 'regular',
    }),
  );
});

it('취소 후 다시 열면 마지막 저장값으로 초기화한다', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn<(input: CreateSessionInput) => void>();
  render(<SessionEditDialog session={session} onSubmit={onSubmit} />);
  await user.click(screen.getByRole('button', { name: '세션 정보' }));
  await user.type(screen.getByLabelText('세션명'), ' 임시 변경');
  await user.click(screen.getByRole('button', { name: '취소' }));
  await user.click(screen.getByRole('button', { name: '세션 정보' }));
  expect(screen.getByLabelText('세션명')).toHaveValue('정규 세션');
  expect(onSubmit).not.toHaveBeenCalled();
});

it('다른 세션으로 전환하면 이전 편집값을 재사용하지 않는다', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn<(input: CreateSessionInput) => void>();
  const { rerender } = render(<SessionEditDialog session={session} onSubmit={onSubmit} />);
  await user.click(screen.getByRole('button', { name: '세션 정보' }));
  await user.type(screen.getByLabelText('장소'), ' 임시');
  rerender(
    <SessionEditDialog
      session={{ ...session, id: 'other', name: '다른 세션', location: '회의실' }}
      onSubmit={onSubmit}
    />,
  );
  expect(await screen.findByLabelText('세션명')).toHaveValue('다른 세션');
  expect(screen.getByLabelText('장소')).toHaveValue('회의실');
});

it('빈 이름은 저장을 막고 제출 실패 후에는 편집값을 보존한다', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn<(input: CreateSessionInput) => void>();
  const { rerender } = render(<SessionEditDialog session={session} onSubmit={onSubmit} />);
  await user.click(screen.getByRole('button', { name: '세션 정보' }));
  await user.clear(screen.getByLabelText('세션명'));
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(await screen.findByText('세션명을 입력하세요.')).toBeVisible();
  expect(onSubmit).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText('세션명'), '재시도할 세션');
  rerender(<SessionEditDialog session={session} onSubmit={onSubmit} pending />);
  expect(screen.getByLabelText('세션명')).toBeDisabled();
  await user.keyboard('{Escape}');
  expect(screen.getByRole('dialog', { name: '세션 수정' })).toBeVisible();
  rerender(<SessionEditDialog session={session} onSubmit={onSubmit} error="저장에 실패했어요." />);
  expect(screen.getByRole('alert')).toHaveTextContent('저장에 실패했어요.');
  expect(screen.getByLabelText('세션명')).toHaveValue('재시도할 세션');
});
