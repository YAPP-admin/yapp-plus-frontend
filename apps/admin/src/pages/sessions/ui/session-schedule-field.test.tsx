/** 실제 SEED Picker로 선택·확정·취소와 공통 폼의 저장 연결을 검증합니다. */
import { useState } from 'react';
import { OverlayProvider, overlay } from 'overlay-kit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import { createAdminQueryClient } from '../../../query-client';
import { SessionScheduleField } from './session-schedule-field';
import { SessionForm } from './session-form';
import type { CreateSessionInput } from '~/features/session-management';

function setup(type: 'date' | 'time', initial: string, disabled = false) {
  const change = vi.fn<(value: string) => void>();
  function Harness() {
    const [value, setValue] = useState(initial);
    return (
      <SessionScheduleField
        type={type}
        label="일정"
        value={value}
        disabled={disabled}
        onBlur={() => undefined}
        onChange={(next) => {
          change(next);
          setValue(next);
        }}
      />
    );
  }
  render(
    <OverlayProvider>
      <Harness />
    </OverlayProvider>,
  );
  return { user: userEvent.setup(), change };
}

it('저장된 날짜를 복원하고 날짜 선택 후 확인해야 값을 반영한다', async () => {
  const { user, change } = setup('date', '2020-01-01');
  await user.click(screen.getByRole('button', { name: '일정, 2020-01-01' }));
  await user.click(screen.getByRole('button', { name: '2020년 1월 2일 목요일' }));
  expect(change).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(change).toHaveBeenCalledWith('2020-01-02');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('button', { name: '일정, 2020-01-02' })).toHaveFocus();
});

it.each(['취소', 'Escape'])('%s로 닫으면 날짜 초안을 버리고 기존 값을 복원한다', async (action) => {
  const { user, change } = setup('date', '2020-01-01');
  await user.click(screen.getByRole('button', { name: '일정, 2020-01-01' }));
  await user.click(screen.getByRole('button', { name: '2020년 1월 2일 목요일' }));
  if (action === 'Escape') {
    await user.keyboard('{Escape}');
  } else {
    await user.click(screen.getByRole('button', { name: action }));
  }
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(change).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: '일정, 2020-01-01' }));
  expect(screen.getByRole('gridcell', { selected: true })).toHaveTextContent(/^1$/);
});

it('시간을 1분 단위로 복원하고 키보드로 선택한 24시간 값을 확정한다', async () => {
  const { user, change } = setup('time', '23:58');
  await user.click(screen.getByRole('button', { name: '일정, 23:58' }));
  const minute = screen.getByRole('spinbutton', { name: '분' });
  expect(minute).toHaveAttribute('aria-valuenow', '58');
  minute.focus();
  await user.keyboard('{ArrowDown}');
  await waitFor(() => expect(minute).toHaveAttribute('aria-valuenow', '59'));
  expect(change).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(change).toHaveBeenCalledWith('23:59');
});

it('disabled이면 비어 있는 날짜 선택창을 열 수 없다', async () => {
  const { user, change } = setup('date', '', true);
  const button = screen.getByRole('button', { name: '일정, 선택' });
  expect(button).toBeDisabled();
  await user.click(button);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(change).not.toHaveBeenCalled();
});

it.each(['date', 'time'] as const)(
  '빈 %s 필드는 취소하면 비워 두고 확인 시 기본 선택값을 반영한다',
  async (type) => {
    const { user, change } = setup(type, '');
    await user.click(screen.getByRole('button', { name: '일정, 선택' }));
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(change).not.toHaveBeenCalled();
    await user.click(await screen.findByRole('button', { name: '일정, 선택' }));
    await user.click(screen.getByRole('button', { name: '확인' }));
    expect(change).toHaveBeenCalledWith(
      expect.stringMatching(type === 'date' ? /^\d{4}-\d{2}-\d{2}$/ : /^00:00$/),
    );
  },
);

it('수정 폼에서 날짜·시간을 바꿔도 부모 폼을 유지하고 새 일정으로 저장한다', async () => {
  const save = vi.fn<(value: CreateSessionInput) => void>();
  const close = vi.fn<() => void>();
  render(
    <QueryClientProvider client={createAdminQueryClient()}>
      <OverlayProvider>
        <button
          type="button"
          onClick={() => {
            overlay.open(({ unmount }) => (
              <SessionForm
                initialValues={{
                  name: '수정 세션',
                  type: 'team',
                  date: '2020-01-01',
                  startTime: '14:07',
                  endTime: '17:00',
                  location: { guide: '' },
                }}
                onSubmit={save}
                onClose={() => {
                  close();
                  unmount();
                }}
              />
            ));
          }}
        >
          수정 열기
        </button>
      </OverlayProvider>
    </QueryClientProvider>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: '수정 열기' }));
  await user.click(screen.getByRole('button', { name: '날짜 (한국 시간), 2020-01-01' }));
  await user.click(screen.getByRole('button', { name: '2020년 1월 2일 목요일' }));
  await user.keyboard('{Escape}');
  expect(await screen.findByRole('dialog', { name: '세션 수정' })).toBeVisible();
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByLabelText('세션명')).toHaveValue('수정 세션');

  await user.click(screen.getByRole('button', { name: '날짜 (한국 시간), 2020-01-01' }));
  await user.click(screen.getByRole('button', { name: '2020년 1월 2일 목요일' }));
  await user.click(screen.getByRole('button', { name: '확인' }));
  await user.click(await screen.findByRole('button', { name: '시작 시간, 14:07' }));
  const minute = screen.getByRole('spinbutton', { name: '분' });
  minute.focus();
  await user.keyboard('{ArrowDown}');
  await waitFor(() => expect(minute).toHaveAttribute('aria-valuenow', '8'));
  await user.click(screen.getByRole('button', { name: '확인' }));
  expect(close).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
  await user.click(await screen.findByRole('button', { name: '저장' }));
  expect(save).toHaveBeenCalledWith({
    name: '수정 세션',
    type: 'team',
    date: '2020-01-02',
    startTime: '14:08',
    endTime: '17:00',
    location: { guide: '' },
  });
});
