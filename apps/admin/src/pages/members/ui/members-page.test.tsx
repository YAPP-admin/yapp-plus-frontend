import { render, screen, within } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { memberSchema } from '~/features/member-management';
import {
  memberPreviewAfterMapping,
  memberPreviewBeforeMapping,
} from '~/features/member-management/fixtures';
import { MemberList } from './member-list';
import { MemberTeamFilter, TeamMappingNotice } from './member-team-filter';
import userEvent from '@testing-library/user-event';

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

it('회원 행 더보기는 현재 회원의 활동 식별자를 수정 콜백에 전달한다', async () => {
  const user = userEvent.setup();
  const onEdit = vi.fn<(member: (typeof fixture.members)[number], activityId: string) => void>();
  render(<MemberList members={fixture.members} currentGeneration={33} onEdit={onEdit} />);
  await user.click(screen.getByRole('button', { name: '예시 회원 1 더보기' }));
  expect(onEdit).toHaveBeenCalledExactlyOnceWith(fixture.members[0], 'preview-activity-33-1');
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

it('매핑 후 팀 열·팀장·미배정 상태를 표시한다', () => {
  render(
    <MemberList
      members={memberPreviewAfterMapping.members}
      currentGeneration={33}
      teamMapping="after"
    />,
  );
  const table = within(screen.getByRole('table', { name: '33기 회원 목록' }));
  expect(table.getByRole('columnheader', { name: '팀' })).toBeVisible();
  expect(
    within(table.getByRole('row', { name: /예시 회원 1 PM/ })).getByText('예시 1팀'),
  ).toBeVisible();
  expect(
    within(table.getByRole('row', { name: /예시 회원 1 PM/ })).getByText('팀장'),
  ).toBeVisible();
  expect(
    within(table.getByRole('row', { name: /예시 회원 6 Server/ })).getByText('팀 미배정'),
  ).toBeVisible();
});

it('매핑 전 안내에서는 팀 선택과 팀 열을 제공하지 않는다', () => {
  render(
    <>
      <TeamMappingNotice />
      <MemberList members={memberPreviewBeforeMapping.members} currentGeneration={33} />
    </>,
  );
  expect(screen.getByRole('region', { name: '팀 매핑 안내' })).toHaveTextContent('팀 매핑 전');
  expect(screen.queryByRole('combobox', { name: '팀' })).not.toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: '팀' })).not.toBeInTheDocument();
});

it('팀 선택은 전체 회원 기준 인원을 보여주고 선택값을 전달한다', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn<(team: string | undefined) => void>();
  render(
    <MemberTeamFilter
      members={memberPreviewAfterMapping.members}
      currentGeneration={33}
      value={undefined}
      onChange={onChange}
    />,
  );
  expect(screen.getByRole('combobox', { name: '팀' })).toHaveTextContent('전체 팀 · 6명');
  await user.click(screen.getByRole('combobox', { name: '팀' }));
  await user.click(await screen.findByRole('option', { name: '예시 1팀 · 3명' }));
  expect(onChange).toHaveBeenCalledWith('preview-team-1');
});

it('존재하지 않는 팀 URL은 전체 팀으로 정리한다', () => {
  render(
    <MemberTeamFilter
      members={memberPreviewAfterMapping.members}
      currentGeneration={33}
      value="missing-team"
      onChange={() => undefined}
    />,
  );
  expect(screen.getByRole('combobox', { name: '팀' })).toHaveTextContent('전체 팀 · 6명');
});
