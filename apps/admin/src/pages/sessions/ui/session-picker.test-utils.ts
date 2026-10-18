/** 세션 폼 테스트에서 실제 달력과 시간 휠을 사용자 조작으로 선택합니다. */
import { screen, waitFor } from '@testing-library/react';
import { expect } from 'vitest';
import type userEvent from '@testing-library/user-event';

type User = ReturnType<typeof userEvent.setup>;

export async function selectDate(user: User) {
  await user.click(screen.getByRole('button', { name: /^날짜 선택/ }));
  await screen.findByRole('dialog', { name: '날짜 선택' });
  const today = new Date();
  const monthDifference = (2026 - today.getFullYear()) * 12 + 10 - today.getMonth();
  for (let month = 0; month < Math.abs(monthDifference); month += 1) {
    await user.click(
      screen.getByRole('button', { name: monthDifference > 0 ? '다음 달' : '이전 달' }),
    );
  }
  await user.click(screen.getByRole('button', { name: /2026년 11월 1일 / }));
  await user.click(screen.getByRole('button', { name: '확인' }));
  await screen.findByRole('dialog', { name: '세션 만들기' });
}

export async function selectTime(user: User, label: string, hour: number, minute = 0) {
  await user.click(screen.getByRole('button', { name: new RegExp(`^${label} 선택`) }));
  await screen.findByRole('dialog', { name: `${label} 선택` });
  const periodText = screen
    .getByRole('spinbutton', { name: '오전/오후' })
    .getAttribute('aria-valuetext');
  const displayHour = Number(
    screen.getByRole('spinbutton', { name: '시' }).getAttribute('aria-valuetext'),
  );
  let currentHour = (displayHour % 12) + (periodText === '오후' ? 12 : 0);
  let currentMinute = Number(
    screen.getByRole('spinbutton', { name: '분' }).getAttribute('aria-valuetext'),
  );
  const change = async (column: string, key: string, nextHour: number, nextMinute: number) => {
    screen.getByRole('spinbutton', { name: column }).focus();
    await user.keyboard(key);
    await waitFor(() => {
      expect(
        screen.getByRole('spinbutton', {
          name: '오전/오후',
          value: { text: nextHour >= 12 ? '오후' : '오전' },
        }),
      ).toBeVisible();
      expect(
        screen.getByRole('spinbutton', {
          name: '시',
          value: { text: String(nextHour % 12 || 12) },
        }),
      ).toBeVisible();
      expect(
        screen.getByRole('spinbutton', {
          name: '분',
          value: { text: String(nextMinute).padStart(2, '0') },
        }),
      ).toBeVisible();
    });
    currentHour = nextHour;
    currentMinute = nextMinute;
  };
  const period = hour >= 12 ? 12 : 0;
  await change(
    '오전/오후',
    hour >= 12 ? '{End}' : '{Home}',
    (currentHour % 12) + period,
    currentMinute,
  );
  if (hour % 12 === 0) {
    await change('시', '{End}', (currentHour + 12 - (currentHour % 12 || 12)) % 24, currentMinute);
    await change('오전/오후', hour >= 12 ? '{End}' : '{Home}', hour, currentMinute);
  } else {
    await change('시', '{Home}', period + 1, currentMinute);
    for (let next = 2; next <= hour % 12; next += 1) {
      await change('시', '{ArrowDown}', period + next, currentMinute);
    }
  }
  await change('분', '{Home}', currentHour, 0);
  for (let next = 1; next <= minute; next += 1) {
    await change('분', '{ArrowDown}', currentHour, next);
  }
  await user.click(screen.getByRole('button', { name: '확인' }));
  await screen.findByRole('dialog', { name: '세션 만들기' });
}
