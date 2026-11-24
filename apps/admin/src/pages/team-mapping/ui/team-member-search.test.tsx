/** 회원 검색·선택·키보드 이동과 마지막 팀원 보호를 검증한다. */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { teamMappingBeforeFixture, teamMappingDraftFixture } from '~/features/team-management';
import { TeamMemberSearch } from './team-member-search';

function renderSearch(
  snapshot = teamMappingBeforeFixture,
  selectedActivityIds: readonly string[] = [],
) {
  const onSelect = vi.fn<(activityId: string) => void>();
  const onRemove = vi.fn<(activityId: string) => void>();
  render(
    <TeamMemberSearch
      snapshot={snapshot}
      selectedActivityIds={selectedActivityIds}
      onSelect={onSelect}
      onRemove={onRemove}
    />,
  );
  return { onSelect, onRemove };
}

it('검색 인풋을 클릭하면 아래에 후보 리스트를 연다', async () => {
  const user = userEvent.setup();
  renderSearch();

  const input = screen.getByRole('searchbox', { name: '회원 검색' });
  expect(screen.queryByRole('button', { name: /김민서/ })).not.toBeInTheDocument();

  await user.click(input);

  expect(screen.getByRole('button', { name: /김민서/ })).toBeVisible();
});

it('후보를 클릭하면 이미 선택한 회원이 있어도 계속 추가한다', async () => {
  const user = userEvent.setup();
  const { onSelect } = renderSearch(teamMappingBeforeFixture, ['member-01', 'member-02']);

  const input = screen.getByRole('searchbox', { name: '회원 검색' });
  await user.click(input);
  await user.click(screen.getByRole('button', { name: /박지훈/ }));

  expect(onSelect).toHaveBeenCalledWith('member-03');
  expect(input).toHaveValue('');
});

it('이름·직군으로 검색하고 동명이인을 ID별 후보로 표시한다', async () => {
  const user = userEvent.setup();
  renderSearch();

  const input = screen.getByRole('searchbox', { name: '회원 검색' });
  await user.type(input, '김태윤');

  await waitFor(() => {
    expect(screen.getAllByRole('button', { name: /김태윤/ })).toHaveLength(2);
  });
  expect(screen.getAllByText('김태윤')).toHaveLength(2);
});

it('Enter로 후보를 선택하고 검색어를 비운 뒤 입력 포커스를 유지한다', async () => {
  const user = userEvent.setup();
  const { onSelect } = renderSearch();
  const input = screen.getByRole('searchbox', { name: '회원 검색' });

  await user.type(input, '디자인');
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /이서윤/ })).toBeVisible();
    expect(screen.queryByRole('button', { name: /김민서/ })).not.toBeInTheDocument();
  });
  await user.keyboard('{Enter}');

  expect(onSelect).toHaveBeenCalledWith('member-02');
  expect(input).toHaveValue('');
  expect(input).toHaveFocus();
});

it('선택된 회원은 후보에서 제외하고 제거 callback을 제공한다', async () => {
  const user = userEvent.setup();
  const { onRemove } = renderSearch(teamMappingBeforeFixture, ['member-01']);

  expect(screen.queryByRole('button', { name: /김민서 ·/ })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '김민서 선택 취소' }));

  expect(onRemove).toHaveBeenCalledWith('member-01');
});

it('검색 결과가 없으면 안내하고 Escape로 검색을 초기화한다', async () => {
  const user = userEvent.setup();
  renderSearch();
  const input = screen.getByRole('searchbox', { name: '회원 검색' });

  await user.type(input, '없는회원');
  await waitFor(() => expect(screen.getByText('검색 결과가 없습니다.')).toBeVisible());
  await user.keyboard('{Escape}');

  expect(input).toHaveValue('');
  expect(screen.getAllByRole('button', { name: /미배정/ }).length).toBeGreaterThan(0);
});

it('현재 팀의 마지막 회원은 선택할 수 없다', async () => {
  const user = userEvent.setup();
  const { onSelect } = renderSearch(teamMappingDraftFixture);
  const input = screen.getByRole('searchbox', { name: '회원 검색' });

  await user.type(input, '김하늘아주긴이름');
  const option = await screen.findByRole('button', { name: /김하늘아주긴이름/ });

  expect(option).toBeDisabled();
  expect(option).toHaveAttribute(
    'title',
    '혼자서 준비하는 아주 긴 이름의 팀은 최소 1명의 팀원을 유지해야 합니다.',
  );
  expect(onSelect).not.toHaveBeenCalled();
});
