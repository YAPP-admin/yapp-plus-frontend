/** 팀 상세 패널의 원본 보존·회원 변경 예정·최소 인원 차단을 검증한다. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayProvider } from 'overlay-kit';
import { expect, it, vi } from 'vitest';
import { teamMappingDraftFixture } from '~/features/team-management';
import { TeamDetailPanel } from './team-detail-panel';

function renderPanel(teamId = 'team-01') {
  const team = teamMappingDraftFixture.teams.find((candidate) => candidate.id === teamId);
  if (team === undefined) {
    throw new Error(`테스트 팀을 찾을 수 없습니다: ${teamId}`);
  }

  render(
    <OverlayProvider>
      <TeamDetailPanel snapshot={teamMappingDraftFixture} team={team} onClose={() => undefined} />
    </OverlayProvider>,
  );
}

function renderPanelWithClose() {
  const onClose = vi.fn<() => void>();
  const team = teamMappingDraftFixture.teams[0];
  if (team === undefined) {
    throw new Error('테스트 팀을 찾을 수 없습니다.');
  }

  render(
    <OverlayProvider>
      <TeamDetailPanel snapshot={teamMappingDraftFixture} team={team} onClose={onClose} />
    </OverlayProvider>,
  );
  return onClose;
}

it('원본 팀 정보와 직군별 구성·팀원을 표시한다', () => {
  renderPanel();

  expect(screen.getByRole('heading', { name: 'Orbit' })).toBeVisible();
  expect(screen.getByText('YAPP Orbit')).toBeVisible();
  expect(screen.getByText('PM 1')).toBeVisible();
  expect(screen.getByText('김민서 · PM')).toBeVisible();
  expect(screen.getByRole('button', { name: '변경 반영 (준비 중)' })).toBeDisabled();
});

it('패널 내부 검색으로 회원을 추가하고 예정 취소로 원복한다', async () => {
  const user = userEvent.setup();
  renderPanel();

  await user.click(screen.getByRole('button', { name: '회원 추가' }));
  const search = screen.getByRole('searchbox', { name: '회원 검색' });
  await user.type(search, '김도현');
  await user.click(screen.getByRole('button', { name: /김도현/ }));

  expect(screen.getByText('김도현')).toBeVisible();
  expect(screen.getByText('추가 예정 · Orbit')).toBeVisible();
  expect(screen.getByRole('button', { name: '김도현 변경 예정 취소' })).toBeVisible();
  expect(screen.getAllByText('김민서 · PM')).toHaveLength(1);

  await user.click(screen.getByRole('button', { name: '김도현 변경 예정 취소' }));
  expect(screen.queryByText('추가 예정 · Orbit')).not.toBeInTheDocument();
});

it('기존 팀원을 다른 팀으로 이동 예정으로 지정하고 전체 취소할 수 있다', async () => {
  const user = userEvent.setup();
  renderPanel();

  await user.click(screen.getByRole('combobox', { name: '김민서 변경' }));
  const pocketOptions = await screen.findAllByRole('option', {
    name: 'Pocket으로 이동',
    hidden: true,
  });
  const pocketOption = pocketOptions.at(-1);
  if (pocketOption === undefined) {
    throw new Error('이동 대상 팀 옵션을 찾을 수 없습니다.');
  }
  await user.click(pocketOption);

  expect(screen.getByText('이동 예정 · Pocket')).toBeVisible();
  await user.click(screen.getByRole('button', { name: '전체 취소' }));
  expect(screen.queryByText('이동 예정 · Pocket')).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: '김민서 변경' })).toHaveTextContent('변경 없음');
});

it('마지막 팀원 이동·제외는 차단하고 사유를 표시한다', async () => {
  const user = userEvent.setup();
  renderPanel('team-08');

  const select = screen.getByRole('combobox', {
    name: '김하늘아주긴이름을가진회원입니다 변경',
  });
  await user.click(select);
  const excludeOptions = await screen.findAllByRole('option', {
    name: '팀에서 제외',
    hidden: true,
  });
  const excludeOption = excludeOptions.at(-1);
  if (excludeOption === undefined) {
    throw new Error('팀 제외 옵션을 찾을 수 없습니다.');
  }
  await user.click(excludeOption);

  expect(screen.getByRole('alert')).toHaveTextContent(
    '혼자서 준비하는 아주 긴 이름의 팀은 최소 1명의 팀원을 유지해야 합니다.',
  );
  expect(select).toHaveTextContent('변경 없음');
  expect(screen.queryByRole('heading', { name: '변경 예정' })).not.toBeInTheDocument();
});

it('변경 후 닫으면 계속 편집과 변경 버리기를 선택할 수 있다', async () => {
  const user = userEvent.setup();
  const onClose = renderPanelWithClose();

  await user.click(screen.getByRole('button', { name: '회원 추가' }));
  await user.type(screen.getByRole('searchbox', { name: '회원 검색' }), '김도현');
  await user.click(screen.getByRole('button', { name: /김도현/ }));
  await user.click(screen.getByRole('button', { name: '닫기' }));

  await user.click(await screen.findByRole('button', { name: '계속 편집' }));
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(screen.getByText('추가 예정 · Orbit')).toBeVisible();

  await user.click(screen.getByRole('button', { name: '닫기' }));
  await user.click(await screen.findByRole('button', { name: '변경 버리기' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});
