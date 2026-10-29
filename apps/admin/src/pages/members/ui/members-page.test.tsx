import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { memberSchema } from '~/features/member-management';
import { memberPreviewBeforeMapping } from '~/features/member-management/fixtures';
import { MemberList } from './member-list';

const fixture = memberPreviewBeforeMapping;

it('현재 기수의 회원만 표에 표시하고 행 제목·열 제목을 연결한다', () => {
  render(<MemberList members={fixture.members} currentGeneration={33} />);
  const table = within(screen.getByRole('table', { name: '33기 회원 목록' }));
  expect(table.getAllByRole('row')).toHaveLength(7);
  expect(table.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
    '이름 / 직군',
    '권한',
    '출석 점수',
    '가입일',
    '회원 작업',
  ]);
  expect(table.getAllByRole('rowheader')).toHaveLength(6);
  const first = within(table.getByRole('row', { name: /예시 회원 1 PM/ }));
  expect(first.getByText('32기 이력')).toBeVisible();
  expect(first.getByText('운영진')).toBeVisible();
  expect(first.getByText('0점')).toBeVisible();
  expect(first.getByText('2026.09.01', { selector: 'time' })).toHaveAttribute(
    'datetime',
    '2026-09-01T00:00:00Z',
  );
  expect(first.getByRole('button', { name: '예시 회원 1 더보기 (준비 중)' })).toBeDisabled();
  const last = within(table.getByRole('row', { name: /예시 회원 6 Server/ }));
  expect(last.getByText('비활동')).toBeVisible();
  expect(last.getByText('정회원')).toBeVisible();
  expect(last.getByText('미제공')).toBeVisible();
  expect(last.queryByText('0점')).not.toBeInTheDocument();
});

it('긴 이름을 생략하지 않고 과거 활동과 현재 기수 점수를 섞지 않는다', () => {
  const name = '아주 긴 이름을 가진 예시 회원입니다';
  const member = memberSchema.parse({ ...fixture.members[0], name });
  render(<MemberList members={[member]} currentGeneration={32} />);
  expect(screen.getByRole('rowheader')).toHaveTextContent(name);
  expect(screen.getByText('80점')).toBeVisible();
  expect(screen.queryByText('0점')).not.toBeInTheDocument();
  expect(screen.queryByText('33기 이력')).not.toBeInTheDocument();
});

it('현재 기수에 회원이 없으면 빈 명단 안내와 0명을 표시한다', () => {
  render(<MemberList members={fixture.members} currentGeneration={34} />);
  expect(screen.getByRole('heading', { name: '등록된 회원이 없어요', level: 2 })).toBeVisible();
  expect(screen.getByText('0', { selector: 'strong' }).parentElement).toHaveTextContent('총 0명');
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});
