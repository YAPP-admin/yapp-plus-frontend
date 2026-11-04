/** 팀 빌딩 전 화면의 빈 상태와 생성 진입 callback을 검증한다. */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from 'overlay-kit';
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
import { TeamMappingDraftProvider } from './team-mapping-draft-context';

async function findVisibleOption(name: string) {
  const options = await screen.findAllByRole('option', { name });
  const option = options.find((candidate) => candidate.closest('[data-hidden]') === null);
  if (option === undefined) {
    throw new Error(`${name} 옵션을 찾을 수 없습니다.`);
  }
  return option;
}

it('팀 빌딩 전 빈 화면과 생성 진입점을 표시한다', async () => {
  const user = userEvent.setup();
  const onCreateTeam = vi.fn<() => void>();

  render(
    <OverlayProvider>
      <TeamMappingPage
        snapshot={teamMappingBeforeFixture}
        search={teamMappingSearchDefaults}
        onPreviewChange={() => undefined}
        onCreateTeam={onCreateTeam}
      />
    </OverlayProvider>,
  );

  expect(screen.getByRole('heading', { name: '팀 매핑', level: 1 })).toBeVisible();
  expect(
    screen.getByRole('heading', { name: '아직 만들어진 팀이 없어요', level: 2 }),
  ).toBeVisible();
  expect(screen.queryByRole('combobox', { name: '팀 목록 필터' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /^첫 팀 만들기$/ }));
  expect(await screen.findByRole('dialog')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '취소' }));

  expect(onCreateTeam).toHaveBeenCalledTimes(1);
});

it('생성 callback이 없어도 두 진입점에서 생성 모달을 연다', async () => {
  const user = userEvent.setup();
  render(
    <OverlayProvider>
      <TeamMappingPage
        snapshot={teamMappingBeforeFixture}
        search={teamMappingSearchDefaults}
        onPreviewChange={() => undefined}
      />
    </OverlayProvider>,
  );

  await user.click(screen.getByRole('button', { name: /^첫 팀 만들기$/ }));
  expect(await screen.findByRole('dialog')).toBeVisible();
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
  expect(
    within(screen.getByRole('region', { name: '팀 목록' })).getByRole('button', {
      name: '팀 만들기',
    }),
  ).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Orbit', level: 2 })).toBeVisible();
  expect(screen.getByRole('combobox', { name: '팀 목록 필터' })).toHaveTextContent('전체 팀 · 8');
  expect(screen.getByText('총 8팀 · 42명 배정 · 10명 미배정')).toBeVisible();
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

it('상세 callback이 없으면 카드에서 상세 패널을 연다', async () => {
  const user = userEvent.setup();

  render(
    <OverlayProvider>
      <TeamMappingPage
        snapshot={teamMappingDraftFixture}
        search={{ ...teamMappingSearchDefaults, preview: 'draft' }}
        onPreviewChange={() => undefined}
      />
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
      snapshot={teamMappingConfirmedFixture}
      search={{ ...teamMappingSearchDefaults, preview: 'confirmed', filter: 'all' }}
      onPreviewChange={() => undefined}
      onFilterChange={onFilterChange}
    />,
  );

  await user.click(screen.getByRole('combobox', { name: '팀 목록 필터' }));
  await user.click(screen.getByRole('option', { name: '미배정 회원 · 9' }));
  expect(onFilterChange).toHaveBeenCalledWith('unassigned');
});

it('미배정 필터에서 회원 작업 영역을 표시한다', () => {
  render(
    <TeamMappingPage
      snapshot={teamMappingDraftFixture}
      search={{ ...teamMappingSearchDefaults, preview: 'draft', filter: 'unassigned' }}
      onPreviewChange={() => undefined}
    />,
  );

  expect(screen.getByRole('heading', { name: '미배정 회원 10명' })).toBeVisible();
  expect(screen.getByRole('checkbox', { name: '이도윤 선택' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Orbit', level: 2 })).not.toBeInTheDocument();
});

it('배정 중 화면에서 원본 팀 확정 요약을 연다', async () => {
  const user = userEvent.setup();

  render(
    <OverlayProvider>
      <TeamMappingPage
        snapshot={teamMappingDraftFixture}
        search={{ ...teamMappingSearchDefaults, preview: 'draft' }}
        onPreviewChange={() => undefined}
      />
    </OverlayProvider>,
  );

  await user.click(screen.getByRole('button', { name: '팀 확정' }));
  expect(await screen.findByRole('dialog')).toHaveTextContent('팀을 확정할까요?');
  expect(screen.getByRole('button', { name: '팀 확정 (준비 중)' })).toBeDisabled();
});

it('확정됨 조회는 이력을 표시하고 새 팀 만들기를 숨긴다', async () => {
  const user = userEvent.setup();

  render(
    <OverlayProvider>
      <TeamMappingPage
        snapshot={teamMappingConfirmedFixture}
        search={{ ...teamMappingSearchDefaults, preview: 'confirmed' }}
        onPreviewChange={() => undefined}
      />
    </OverlayProvider>,
  );

  expect(screen.getByRole('region', { name: '확정 이력' })).toHaveTextContent('운영자 김관리');
  expect(screen.getByRole('button', { name: '수정하기' })).toBeVisible();
  expect(screen.queryByRole('button', { name: '팀 만들기' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: '수정하기' }));
  expect(screen.getByRole('button', { name: '편집 종료' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Orbit' }));
  expect(await screen.findByRole('button', { name: '회원 추가' })).toBeVisible();
});

it('확정됨 조회 모드의 팀 상세는 배정 입력을 열지 않는다', async () => {
  const user = userEvent.setup();

  render(
    <OverlayProvider>
      <TeamMappingPage
        snapshot={teamMappingConfirmedFixture}
        search={{ ...teamMappingSearchDefaults, preview: 'confirmed' }}
        onPreviewChange={() => undefined}
      />
    </OverlayProvider>,
  );

  await user.click(screen.getByRole('button', { name: 'Orbit' }));
  expect(await screen.findByRole('button', { name: '회원 추가 (조회 전용)' })).toBeDisabled();
  expect(screen.getByRole('combobox', { name: '김민서 변경' })).toBeDisabled();
});

it('확정됨 편집 모드에서 변경 후 종료하면 초안 폐기를 확인한다', async () => {
  const user = userEvent.setup();

  render(
    <OverlayProvider>
      <TeamMappingDraftProvider>
        <TeamMappingPage
          snapshot={teamMappingConfirmedFixture}
          search={{ ...teamMappingSearchDefaults, preview: 'confirmed', filter: 'unassigned' }}
          onPreviewChange={() => undefined}
        />
      </TeamMappingDraftProvider>
    </OverlayProvider>,
  );

  await user.click(screen.getByRole('button', { name: '수정하기' }));
  await user.click(screen.getByRole('checkbox', { name: '이도윤 선택' }));
  await user.click(screen.getByRole('combobox', { name: '이도윤 대상 팀' }));
  await user.click(await findVisibleOption('Orbit으로 배정'));
  expect(screen.getByText('1명 선택 · 1명 배정 예정')).toBeVisible();

  await user.click(screen.getByRole('button', { name: '편집 종료' }));
  expect(await screen.findByRole('alertdialog')).toHaveTextContent('변경을 버리고 나갈까요?');
  await user.click(screen.getByRole('button', { name: '계속 편집' }));
  expect(screen.getByRole('button', { name: '편집 종료' })).toBeVisible();

  await user.click(screen.getByRole('button', { name: '편집 종료' }));
  await user.click(await screen.findByRole('button', { name: '변경 버리기' }));
  expect(screen.getByRole('button', { name: '수정하기' })).toBeVisible();
});
