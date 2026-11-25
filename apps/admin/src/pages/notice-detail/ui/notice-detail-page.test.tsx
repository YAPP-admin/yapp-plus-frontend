import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import type { AdminPostRecipientResponse } from '@yapp-plus/api/generated';
import { NoticeReaders } from './notice-readers';

const recipients: AdminPostRecipientResponse[] = [
  {
    userId: 2,
    name: '김회원',
    generationNumber: 32,
    position: 'WEB',
    read: true,
    readAt: '2026-11-24T09:00:00Z',
  },
  {
    userId: 1,
    name: '이회원',
    generationNumber: 32,
    position: 'DESIGN',
    read: false,
    readAt: null,
  },
];

it('생성 SDK 수신자 응답을 읽음 현황 표에 표시한다', () => {
  render(<NoticeReaders readers={recipients} />);

  const table = within(screen.getByRole('region', { name: '읽음 현황 표' })).getByRole('table');
  expect(within(table).getByText('김회원')).toBeVisible();
  expect(within(table).getByText('32기 · WEB')).toBeVisible();
  expect(within(table).getByLabelText('읽음')).toBeVisible();
  expect(within(table).getByLabelText('안 읽음')).toBeVisible();
});
