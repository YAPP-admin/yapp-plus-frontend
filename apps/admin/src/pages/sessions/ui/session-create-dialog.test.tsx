/** 생성 모달의 입력 전달과 취소·Esc·재진입 동작을 실제 SEED 컴포넌트로 검증합니다. */
import { selectDate, selectTime } from './session-picker.test-utils';
import { ActionButton } from '@seed-design/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ComponentProps } from 'react';
import { expect, it, vi } from 'vitest';
import type { CreateSessionInput } from '../model/session';
import { SessionCreateDialog as ControlledDialog } from './session-create-dialog';

function SessionCreateDialog(
  props: Omit<ComponentProps<typeof ControlledDialog>, 'open' | 'onOpenChange'>,
) {
  const [open, setOpen] = useState(false);
  return <ControlledDialog {...props} open={open} onOpenChange={setOpen} />;
}

function renderDialog() {
  const onSubmit = vi.fn<(input: CreateSessionInput, onSuccess: () => void) => void>();
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
  await selectDate(user);
  await selectTime(user, '시작 시간', 14, 0);
  await selectTime(user, '종료 시간', 17, 0);
  screen.getByRole('combobox', { name: '유형' }).focus();
  await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
  await user.click(screen.getByRole('button', { name: '저장' }));

  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith(
      {
        name: '팀 발표',
        location: '교육장',
        date: '2026-11-01',
        startTime: '14:00',
        endTime: '17:00',
        type: 'team',
      },
      expect.any(Function),
    ),
  );
});

it('취소하면 제출하지 않고 다음에 열 때 입력을 유지한다', async () => {
  const { user, onSubmit } = renderDialog();

  await user.click(screen.getByRole('button', { name: '새 세션' }));
  await user.type(await screen.findByLabelText('세션명'), '작성 중');
  await user.click(screen.getByRole('button', { name: '취소' }));

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(onSubmit).not.toHaveBeenCalled();

  await user.click(screen.getByRole('button', { name: '새 세션' }));

  expect(await screen.findByLabelText('세션명')).toHaveValue('작성 중');
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

it('첫 제출 후 오류를 안내하고 첫 오류 입력으로 이동한다', async () => {
  const { user, onSubmit } = renderDialog();

  await user.click(screen.getByRole('button', { name: '새 세션' }));
  await user.click(screen.getByLabelText('세션명'));
  await user.tab();
  expect(screen.queryByText('세션명을 입력하세요.')).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: '저장' }));

  expect(await screen.findByText('세션명을 입력하세요.')).toBeVisible();
  expect(screen.getByLabelText('세션명')).toHaveFocus();
  expect(screen.getByLabelText('세션명')).toHaveAccessibleDescription('세션명을 입력하세요.');
  expect(onSubmit).not.toHaveBeenCalled();

  await user.type(screen.getByLabelText('세션명'), '정규 세션');

  expect(screen.queryByText('세션명을 입력하세요.')).not.toBeInTheDocument();
});

it('종료 시간이 시작 시간보다 늦지 않으면 제출하지 않는다', async () => {
  const { user, onSubmit } = renderDialog();

  await user.click(screen.getByRole('button', { name: '새 세션' }));
  await user.type(screen.getByLabelText('세션명'), '발표');
  await user.type(screen.getByLabelText('장소'), '교육장');
  await selectDate(user);
  await selectTime(user, '시작 시간', 14, 0);
  await selectTime(user, '종료 시간', 13, 0);
  await user.click(screen.getByRole('button', { name: '저장' }));

  expect(await screen.findByText('종료 시간은 시작 시간보다 늦어야 합니다.')).toBeVisible();
  expect(screen.getByRole('button', { name: /^종료 시간 선택/ })).toHaveFocus();
  expect(onSubmit).not.toHaveBeenCalled();

  await selectTime(user, '시작 시간', 12, 0);

  expect(screen.queryByText('종료 시간은 시작 시간보다 늦어야 합니다.')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '저장' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
});

it('저장 중에는 입력과 닫기를 잠그고 실패 후 입력을 보존하여 재시도한다', async () => {
  const onSubmit = vi.fn<(input: CreateSessionInput, onSuccess: () => void) => void>();
  const user = userEvent.setup();
  const trigger = <ActionButton>새 세션</ActionButton>;
  const { rerender } = render(<SessionCreateDialog trigger={trigger} onSubmit={onSubmit} />);

  await user.click(screen.getByRole('button', { name: '새 세션' }));
  await user.type(screen.getByLabelText('세션명'), '발표');
  await user.type(screen.getByLabelText('장소'), '교육장');
  await selectDate(user);
  await selectTime(user, '시작 시간', 14, 0);
  await selectTime(user, '종료 시간', 17, 0);
  await user.click(screen.getByRole('button', { name: '저장' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());

  rerender(<SessionCreateDialog trigger={trigger} onSubmit={onSubmit} pending />);

  expect(screen.getByLabelText('세션명')).toBeDisabled();
  expect(screen.getByRole('combobox', { name: '유형' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: '저장 중' }));
  await user.click(screen.getByRole('button', { name: '취소' }));
  await user.click(screen.getByRole('button', { name: '세션 만들기 닫기' }));
  await user.keyboard('{Escape}');

  expect(screen.getByRole('dialog', { name: '세션 만들기' })).toBeVisible();
  expect(onSubmit).toHaveBeenCalledOnce();

  rerender(
    <SessionCreateDialog
      trigger={trigger}
      onSubmit={onSubmit}
      error="저장하지 못했어요. 다시 시도해 주세요."
    />,
  );

  expect(screen.getByRole('alert')).toHaveTextContent('저장하지 못했어요.');
  expect(screen.getByLabelText('세션명')).toHaveValue('발표');
  expect(screen.getByRole('button', { name: /^종료 시간 선택/ })).toHaveAccessibleName(
    '종료 시간 선택, 오후 5:00',
  );

  await user.clear(screen.getByLabelText('세션명'));
  await user.type(screen.getByLabelText('세션명'), '수정한 발표');
  await user.click(screen.getByRole('button', { name: '저장' }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
  expect(onSubmit).toHaveBeenLastCalledWith(
    expect.objectContaining({ name: '수정한 발표' }),
    expect.any(Function),
  );
});

it('달력에서 선택한 날짜를 입력에 반영한다', async () => {
  const { user } = renderDialog();
  await user.click(screen.getByRole('button', { name: '새 세션' }));
  await selectDate(user);
  await user.click(screen.getByRole('button', { name: /^날짜 선택/ }));
  await user.click(screen.getByRole('button', { name: /2026년 11월 15일/ }));
  await user.click(screen.getByRole('button', { name: '확인' }));

  expect(screen.getByRole('button', { name: /^날짜 선택/ })).toHaveAccessibleName(
    '날짜 선택, 2026-11-15',
  );
});

it('시간 휠의 키보드 선택을 24시간 형식으로 반영한다', async () => {
  const { user } = renderDialog();
  await user.click(screen.getByRole('button', { name: '새 세션' }));
  await selectTime(user, '시작 시간', 14, 13);
  await user.click(screen.getByRole('button', { name: /^시작 시간 선택/ }));
  screen.getByRole('spinbutton', { name: '분' }).focus();
  await user.keyboard('{ArrowDown}');

  await waitFor(() =>
    expect(screen.getByRole('spinbutton', { name: '분', value: { text: '14' } })).toBeVisible(),
  );
});

it('시간 선택을 Esc로 취소하면 기존 값을 유지하고 입력 버튼으로 돌아온다', async () => {
  const { user } = renderDialog();
  await user.click(screen.getByRole('button', { name: '새 세션' }));
  await selectTime(user, '시작 시간', 14);
  await user.click(screen.getByRole('button', { name: '시작 시간 선택, 오후 2:00' }));
  await screen.findByRole('dialog', { name: '시작 시간 선택' });
  screen.getByRole('spinbutton', { name: '분' }).focus();
  await user.keyboard('{ArrowDown}');
  await waitFor(() =>
    expect(screen.getByRole('spinbutton', { name: '분', value: { text: '01' } })).toBeVisible(),
  );
  await user.keyboard('{Escape}');

  const button = await screen.findByRole('button', { name: '시작 시간 선택, 오후 2:00' });
  await waitFor(() => expect(button).toHaveFocus());
  expect(screen.getByRole('dialog', { name: '세션 만들기' })).toBeVisible();
});

it('날짜 선택을 취소하면 이전 날짜를 유지한다', async () => {
  const { user } = renderDialog();
  await user.click(screen.getByRole('button', { name: '새 세션' }));
  await selectDate(user);
  await user.click(screen.getByRole('button', { name: /^날짜 선택/ }));
  await screen.findByRole('dialog', { name: '날짜 선택' });
  await user.click(screen.getByRole('button', { name: /2026년 11월 15일/ }));
  await user.click(screen.getByRole('button', { name: '취소' }));

  expect(await screen.findByRole('button', { name: '날짜 선택, 2026-11-01' })).toBeVisible();
});

it('연도 휠에서 변경한 연도의 날짜를 선택하여 반영한다', async () => {
  const { user } = renderDialog();
  await user.click(screen.getByRole('button', { name: '새 세션' }));
  await selectDate(user);
  await user.click(screen.getByRole('button', { name: /^날짜 선택/ }));
  await screen.findByRole('dialog', { name: '날짜 선택' });
  await user.click(screen.getByRole('button', { name: '2026년 11월' }));
  screen.getByRole('spinbutton', { name: '연도' }).focus();
  await user.keyboard('{ArrowDown}');
  await waitFor(() =>
    expect(
      screen.getByRole('spinbutton', { name: '연도', value: { text: '2027년' } }),
    ).toBeVisible(),
  );
  await user.click(screen.getByRole('button', { name: '2026년 11월' }));
  await user.click(screen.getByRole('button', { name: /2027년 11월 15일/ }));
  await user.click(screen.getByRole('button', { name: '확인' }));

  expect(await screen.findByRole('button', { name: '날짜 선택, 2027-11-15' })).toBeVisible();
});
