/** 공지 마감 Picker의 선택·확정·취소와 필수 접근성 상태를 검증한다. */
import { OverlayProvider } from 'overlay-kit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { NoticeScheduleField } from './notice-schedule-field';

function setup(type: 'date' | 'time', initial: string) {
  const onChange = vi.fn<(value: string) => void>();
  render(
    <OverlayProvider>
      <NoticeScheduleField
        type={type}
        label={type === 'date' ? '마감 날짜' : '마감 시각'}
        value={initial}
        required
        disabled={false}
        errors={[]}
        onChange={onChange}
        onBlur={() => undefined}
      />
    </OverlayProvider>,
  );
  return { user: userEvent.setup(), onChange };
}

it('날짜를 DatePicker에서 선택하고 확인할 때만 반영한다', async () => {
  const { user, onChange } = setup('date', '2020-01-01');
  const field = screen.getByRole('button', { name: '마감 날짜, 2020-01-01' });

  expect(field).toHaveAttribute('aria-required', 'true');
  await user.click(field);
  await user.click(screen.getByRole('button', { name: '2020년 1월 2일 목요일' }));
  expect(onChange).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: '확인' }));

  expect(onChange).toHaveBeenCalledWith('2020-01-02');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it('날짜 선택을 취소하면 기존 값을 유지한다', async () => {
  const { user, onChange } = setup('date', '2020-01-01');
  await user.click(screen.getByRole('button', { name: '마감 날짜, 2020-01-01' }));
  await user.click(screen.getByRole('button', { name: '2020년 1월 2일 목요일' }));
  await user.click(screen.getByRole('button', { name: '취소' }));

  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: '마감 날짜, 2020-01-01' })).toBeInTheDocument();
});

it('시간을 TimePicker에서 키보드로 선택한다', async () => {
  const { user, onChange } = setup('time', '23:58');
  await user.click(screen.getByRole('button', { name: '마감 시각, 23:58' }));
  const minute = screen.getByRole('spinbutton', { name: '분' });

  minute.focus();
  await user.keyboard('{ArrowDown}');
  await waitFor(() => expect(minute).toHaveAttribute('aria-valuenow', '59'));
  await user.click(screen.getByRole('button', { name: '확인' }));

  expect(onChange).toHaveBeenCalledWith('23:59');
});
