/** 미배정 회원의 개별·일괄 예정과 체크 상태 분리를 검증한다. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
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

it('확정 상태에서는 체크와 배정 선택을 읽기 전용으로 표시한다', () => {
  render(<UnassignedMembers snapshot={{ ...teamMappingDraftFixture, status: 'confirmed' }} />);

  expect(screen.getByRole('checkbox', { name: '이도윤 선택' })).toBeDisabled();
  expect(screen.getByRole('combobox', { name: '이도윤 대상 팀' })).toBeDisabled();
});

it('배정할 팀이 없으면 일괄 작업을 안내하지 않는다', () => {
  render(<UnassignedMembers snapshot={teamMappingBeforeFixture} />);

  expect(screen.getByRole('heading', { name: '배정할 팀이 없어요' })).toBeVisible();
  expect(screen.queryByRole('combobox', { name: '일괄 대상 팀' })).not.toBeInTheDocument();
});
