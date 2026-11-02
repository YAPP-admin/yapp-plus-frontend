/** 팀 빌딩 전 화면의 빈 상태와 생성 진입 callback을 검증한다. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import {
  teamMappingBeforeFixture,
  teamMappingConfirmedFixture,
  teamMappingDraftFixture,
  type TeamMappingFilter,
  type TeamMappingTeam,
} from '~/features/team-management';
import { teamMappingSearchDefaults } from '../model/team-search';
import { TeamMappingPage } from './team-mapping-page';

it('팀 빌딩 전 빈 화면과 두 생성 진입점을 표시한다', async () => {
  const user = userEvent.setup();
  const onCreateTeam = vi.fn<() => void>();

  render(
    <TeamMappingPage
      snapshot={teamMappingBeforeFixture}
      search={teamMappingSearchDefaults}
      onPreviewChange={() => undefined}
      onCreateTeam={onCreateTeam}
    />,
  );

  expect(screen.getByRole('heading', { name: '팀 매핑', level: 1 })).toBeVisible();
  expect(
    screen.getByRole('heading', { name: '아직 만들어진 팀이 없어요', level: 2 }),
  ).toBeVisible();
  expect(screen.queryByRole('combobox', { name: '팀 목록 필터' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: '첫 팀 만들기' }));
  await user.click(screen.getByRole('button', { name: '팀 만들기' }));

  expect(onCreateTeam).toHaveBeenCalledTimes(2);
});

it('생성 callback이 연결되지 않으면 진입 버튼을 비활성화한다', () => {
  render(
    <TeamMappingPage
      snapshot={teamMappingBeforeFixture}
      search={teamMappingSearchDefaults}
      onPreviewChange={() => undefined}
    />,
  );

  expect(screen.getAllByRole('button', { name: /팀 만들기/ })).toHaveLength(2);
  screen.getAllByRole('button', { name: /팀 만들기/ }).forEach((button) => {
    expect(button).toBeDisabled();
  });
});

it('preview 상태를 URL 입력으로 받아 팀 목록과 필터 개수를 표시한다', () => {
  render(
    <TeamMappingPage
      snapshot={teamMappingDraftFixture}
      search={{ ...teamMappingSearchDefaults, preview: 'draft' }}
      onPreviewChange={() => undefined}
    />,
  );

  expect(screen.getByRole('heading', { name: '팀 목록', level: 2 })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Orbit', level: 2 })).toBeVisible();
  expect(screen.getByRole('combobox', { name: '팀 목록 필터' })).toHaveTextContent('전체 팀 · 8');
  expect(screen.getByText('총 8팀 · 42명 배정 · 10명 미배정')).toBeVisible();
  expect(screen.getByText('Design 직군이 없어요.')).toBeVisible();
  expect(screen.getAllByText('김민서')).not.toHaveLength(0);
});

it('팀 상세 진입과 더보기 버튼을 별도 조작 대상으로 구분한다', async () => {
  const user = userEvent.setup();
  const onTeamSelect = vi.fn<(team: TeamMappingTeam) => void>();

  render(
    <TeamMappingPage
      snapshot={teamMappingDraftFixture}
      search={{ ...teamMappingSearchDefaults, preview: 'draft' }}
      onPreviewChange={() => undefined}
      onTeamSelect={onTeamSelect}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'Orbit' }));
  expect(onTeamSelect).toHaveBeenCalledWith(teamMappingDraftFixture.teams[0]);
  expect(screen.getByRole('button', { name: 'Orbit 더보기' })).toBeDisabled();
});

it('필터 변경 callback과 결과 없음 화면을 표시한다', async () => {
  const user = userEvent.setup();
  const onFilterChange = vi.fn<(filter: TeamMappingFilter) => void>();

  const { rerender } = render(
    <TeamMappingPage
      snapshot={teamMappingConfirmedFixture}
      search={{ ...teamMappingSearchDefaults, preview: 'confirmed', filter: 'all' }}
      onPreviewChange={() => undefined}
      onFilterChange={onFilterChange}
    />,
  );

  await user.click(screen.getByRole('combobox', { name: '팀 목록 필터' }));
  await user.click(screen.getByRole('option', { name: '확인 필요 · 0' }));
  expect(onFilterChange).toHaveBeenCalledWith('needs-check');

  rerender(
    <TeamMappingPage
      snapshot={teamMappingConfirmedFixture}
      search={{ ...teamMappingSearchDefaults, preview: 'confirmed', filter: 'needs-check' }}
      onPreviewChange={() => undefined}
    />,
  );

  expect(screen.getByRole('heading', { name: '확인 필요 팀이 없어요', level: 3 })).toBeVisible();
});
