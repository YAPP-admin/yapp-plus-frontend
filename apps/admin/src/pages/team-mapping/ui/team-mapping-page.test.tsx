/** 팀 빌딩 전 화면의 빈 상태와 생성 진입 callback을 검증한다. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { teamMappingBeforeFixture, teamMappingDraftFixture } from '~/features/team-management';
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

it('preview 상태를 URL 입력으로 받아 배정 중 화면을 표시한다', () => {
  render(
    <TeamMappingPage
      snapshot={teamMappingDraftFixture}
      search={{ ...teamMappingSearchDefaults, preview: 'draft' }}
      onPreviewChange={() => undefined}
    />,
  );

  expect(screen.getByRole('heading', { name: '배정 중 화면', level: 2 })).toBeVisible();
});
