/** 미배정 회원의 개별·일괄 예정과 체크 상태 분리를 검증한다. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { teamMappingBeforeFixture, teamMappingDraftFixture } from '~/features/team-management';
import { UnassignedMembers } from './unassigned-members';

async function findOpenOption(name: string) {
  const options = await screen.findAllByRole('option', { name });
  const option = options.find((candidate) => candidate.closest('[data-hidden]') === null);
  if (option === undefined) {
    throw new Error(`${name} 옵션을 찾을 수 없습니다.`);
  }
  return option;
}

it('미배정 회원을 표시하고 개별 배정 예정과 취소를 제공한다', async () => {
  const user = userEvent.setup();
  render(<UnassignedMembers snapshot={teamMappingDraftFixture} />);

  expect(screen.getByText('이도윤')).toBeVisible();
  expect(screen.getByText('0명 선택 · 0명 배정 예정')).toBeVisible();

  await user.click(screen.getByRole('combobox', { name: '이도윤 대상 팀' }));
  const orbitOption = await findOpenOption('Orbit으로 배정');
  await user.click(orbitOption);

  expect(screen.getByText('0명 선택 · 1명 배정 예정')).toBeVisible();
  expect(screen.getByRole('button', { name: '이도윤 배정 예정 취소' })).toBeVisible();

  await user.click(screen.getByRole('button', { name: '이도윤 배정 예정 취소' }));
  expect(screen.getByText('0명 선택 · 0명 배정 예정')).toBeVisible();
});

it('체크된 회원의 기존 예정 대상을 일괄 대상 팀으로 덮어쓴다', async () => {
  const user = userEvent.setup();
  render(<UnassignedMembers snapshot={teamMappingDraftFixture} />);

  await user.click(screen.getByRole('checkbox', { name: '이도윤 선택' }));
  await user.click(screen.getByRole('checkbox', { name: '차유림 선택' }));
  expect(screen.getByText('2명 선택 · 0명 배정 예정')).toBeVisible();

  await user.click(screen.getByRole('combobox', { name: '일괄 대상 팀' }));
  const pocketOption = await findOpenOption('Pocket으로 배정');
  await user.click(pocketOption);

  expect(screen.getByText('2명 선택 · 2명 배정 예정')).toBeVisible();
  expect(screen.getAllByText('배정 예정')).toHaveLength(2);

  await user.click(screen.getByRole('checkbox', { name: '이도윤 선택' }));
  expect(screen.getByText('1명 선택 · 2명 배정 예정')).toBeVisible();
  expect(screen.getByRole('button', { name: '이도윤 배정 예정 취소' })).toBeVisible();
});

it('배정하기 버튼으로 예정된 회원 배정을 저장하고 변경사항을 비운다', async () => {
  const user = userEvent.setup();
  const onApplyAssignments = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  render(
    <UnassignedMembers
      snapshot={teamMappingDraftFixture}
      onApplyAssignments={onApplyAssignments}
    />,
  );

  await user.click(screen.getByRole('combobox', { name: '이도윤 대상 팀' }));
  await user.click(await findOpenOption('Orbit으로 배정'));
  await user.click(screen.getByRole('button', { name: '배정하기' }));

  expect(onApplyAssignments).toHaveBeenCalledWith([
    { activityId: 'member-43', destinationTeamId: 'team-01' },
  ]);
  expect(screen.getByText('0명 선택 · 0명 배정 예정')).toBeVisible();
});

it('배정할 팀이 없으면 일괄 작업을 안내하지 않는다', () => {
  render(<UnassignedMembers snapshot={teamMappingBeforeFixture} />);

  expect(screen.getByRole('heading', { name: '배정할 팀이 없어요' })).toBeVisible();
  expect(screen.queryByRole('combobox', { name: '일괄 대상 팀' })).not.toBeInTheDocument();
});
