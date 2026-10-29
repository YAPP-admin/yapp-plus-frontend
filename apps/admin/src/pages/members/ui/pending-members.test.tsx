import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { PendingMembers } from './pending-members';

it('페이지·가입 대기 영역·빈 상태를 제목 계층으로 구분하고 실행 버튼은 제공하지 않는다', () => {
  render(<PendingMembers />);
  const main = within(screen.getByRole('main'));
  expect(main.getByRole('heading', { level: 1, name: '회원 관리' })).toBeVisible();
  const section = within(main.getByRole('region', { name: '가입 대기' }));
  expect(section.getByRole('heading', { level: 2, name: '가입 대기' })).toBeVisible();
  expect(
    section.getByRole('heading', { level: 3, name: '가입 대기 중인 회원이 없어요' }),
  ).toBeVisible();
  expect(section.getByText('0', { selector: 'strong' }).parentElement).toHaveTextContent('총 0건');
  expect(section.queryByRole('button')).not.toBeInTheDocument();
  expect(section.queryByRole('img')).not.toBeInTheDocument();
});
