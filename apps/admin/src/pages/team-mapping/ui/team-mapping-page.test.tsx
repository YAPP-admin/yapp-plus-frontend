/** 팀 빌딩 전 화면의 빈 상태와 생성 진입 callback을 검증한다. */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from 'overlay-kit';
import { expect, it, vi } from 'vitest';
import {
  teamMappingBeforeFixture,
  teamMappingDraftFixture,
  type TeamMappingFilter,
  type TeamMappingTeam,
} from '~/features/team-management';
import { teamMappingSearchDefaults } from '../model/team-search';
import { TeamMappingPage } from './team-mapping-page';

it('팀 빌딩 전 빈 화면과 생성 진입점을 표시한다', async () => {
  const user = userEvent.setup();
  const onCreateTeam = vi.fn<() => void>();

  render(
    <OverlayProvider>
      <TeamMappingPage
        snapshot={teamMappingBeforeFixture}
        search={teamMappingSearchDefaults}
        onCreateTeam={onCreateTeam}
      />
    </OverlayProvider>,
  );

  expect(screen.getByRole('heading', { name: '팀 매핑', level: 1 })).toBeVisible();
  expect(
    screen.getByRole('heading', { name: '아직 만들어진 팀이 없어요', level: 2 }),
  ).toBeVisible();
  expect(screen.queryByRole('group', { name: '팀 목록 필터' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /^첫 팀 만들기$/ }));
  expect(await screen.findByRole('dialog')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '취소' }));

  expect(onCreateTeam).toHaveBeenCalledTimes(1);
});

it('생성 callback이 없어도 두 진입점에서 생성 모달을 연다', async () => {
  const user = userEvent.setup();
  render(
    <OverlayProvider>
      <TeamMappingPage snapshot={teamMappingBeforeFixture} search={teamMappingSearchDefaults} />
    </OverlayProvider>,
  );

  await user.click(screen.getByRole('button', { name: /^첫 팀 만들기$/ }));
  expect(await screen.findByRole('dialog')).toBeVisible();
});

it('팀 목록과 필터 개수를 표시한다', () => {
  render(<TeamMappingPage snapshot={teamMappingDraftFixture} search={teamMappingSearchDefaults} />);

  expect(screen.getByRole('heading', { name: '팀 목록', level: 2 })).toBeVisible();
  expect(
    within(screen.getByRole('region', { name: '팀 목록' })).getByRole('button', {
      name: '팀 만들기',
    }),
  ).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Orbit', level: 2 })).toBeVisible();
  expect(screen.getByRole('radio', { name: '전체 팀 · 8' })).toBeChecked();
  expect(screen.getByText('총 8팀 · 42명 배정 · 10명 미배정')).toBeVisible();
  expect(screen.getAllByText('김민서')).not.toHaveLength(0);
});

it('팀 상세 진입과 더보기 버튼을 별도 조작 대상으로 구분한다', async () => {
  const user = userEvent.setup();
  const onTeamSelect = vi.fn<(team: TeamMappingTeam) => void>();

  render(
    <TeamMappingPage
      snapshot={teamMappingDraftFixture}
      search={teamMappingSearchDefaults}
      onTeamSelect={onTeamSelect}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'Orbit' }));
  expect(onTeamSelect).toHaveBeenCalledWith(teamMappingDraftFixture.teams[0]);
  await user.click(screen.getByRole('button', { name: 'Orbit 더보기' }));
  const menu = await screen.findByRole('menu', { name: 'Orbit 더보기' });
  expect(within(menu).getByRole('menuitem', { name: '수정하기' })).toBeVisible();
  expect(within(menu).getByRole('menuitem', { name: '삭제하기' })).toBeVisible();
});

it('더보기의 수정하기를 누르면 기존 팀 정보가 채워진 수정 모달을 연다', async () => {
  const user = userEvent.setup();

  render(
    <OverlayProvider>
      <TeamMappingPage snapshot={teamMappingDraftFixture} search={teamMappingSearchDefaults} />
    </OverlayProvider>,
  );

  await user.click(screen.getByRole('button', { name: 'Orbit 더보기' }));
  await user.click(
    within(await screen.findByRole('menu', { name: 'Orbit 더보기' })).getByRole('menuitem', {
      name: '수정하기',
    }),
  );

  expect(await screen.findByRole('heading', { name: '팀 수정하기' })).toBeVisible();
  const nameInput = screen.getByRole('textbox', { name: '팀명' });
  expect(nameInput).toHaveValue('Orbit');
  await user.clear(nameInput);
  await user.type(nameInput, 'Orbit 수정');
  await user.click(screen.getByRole('button', { name: '수정하기' }));

  expect(await screen.findByRole('heading', { name: 'Orbit 수정', level: 2 })).toBeVisible();
});

it('상세 callback이 없으면 카드에서 상세 패널을 연다', async () => {
  const user = userEvent.setup();

  render(
    <OverlayProvider>
      <TeamMappingPage snapshot={teamMappingDraftFixture} search={teamMappingSearchDefaults} />
    </OverlayProvider>,
  );

  await user.click(screen.getByRole('button', { name: 'Orbit' }));

  expect(await screen.findByRole('heading', { name: 'Orbit' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: '변경 예정' })).not.toBeInTheDocument();
});

it('미배정 필터 변경 callback을 호출한다', async () => {
  const user = userEvent.setup();
  const onFilterChange = vi.fn<(filter: TeamMappingFilter) => void>();

  render(
    <TeamMappingPage
      snapshot={teamMappingDraftFixture}
      search={{ ...teamMappingSearchDefaults, filter: 'all' }}
      onFilterChange={onFilterChange}
    />,
  );

  await user.click(screen.getByRole('radio', { name: '미배정 회원 · 10' }));
  expect(onFilterChange).toHaveBeenCalledWith('unassigned');
});

it('미배정 필터에서 회원 작업 영역을 표시한다', () => {
  render(
    <TeamMappingPage
      snapshot={teamMappingDraftFixture}
      search={{ ...teamMappingSearchDefaults, filter: 'unassigned' }}
    />,
  );

  expect(screen.getByRole('heading', { name: '미배정 회원 10명' })).toBeVisible();
  expect(screen.getByRole('checkbox', { name: '이도윤 선택' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Orbit', level: 2 })).not.toBeInTheDocument();
});
