import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { memberPreviewAfterMapping } from '~/features/member-management/fixtures';
import { MemberEditForm } from './member-edit-form';

const member = memberPreviewAfterMapping.members.at(0);
if (member === undefined) {
  throw new Error('회원 fixture가 비어 있습니다.');
}

it('회원 수정 폼에 기본값과 기존 변경 이력을 표시한다', () => {
  render(<MemberEditForm member={member} activityId="preview-activity-33-1" />);
  expect(screen.getByRole('textbox', { name: '이름' })).toHaveValue('예시 회원 1');
  expect(screen.getByRole('spinbutton', { name: '활동 기수' })).toHaveValue(33);
  expect(screen.getByRole('combobox', { name: '직군' })).toHaveTextContent('PM');
  expect(screen.getByRole('combobox', { name: '권한' })).toHaveTextContent('운영진');
  expect(screen.getByRole('heading', { name: '변경 이력' })).toBeVisible();
  expect(screen.getByText('예시 운영자 · 2026. 9. 2.')).toBeVisible();
});

it('입력 초안은 원본을 바꾸지 않고 검증 오류를 표시한다', async () => {
  const user = userEvent.setup();
  render(<MemberEditForm member={member} activityId="preview-activity-33-1" />);
  const name = screen.getByRole('textbox', { name: '이름' });
  await user.clear(name);
  await user.tab();
  expect(screen.getByRole('alert')).toHaveTextContent('이름을 입력하세요.');
  expect(member.name).toBe('예시 회원 1');
});

it('팀·출석 기록이 있는 회원의 기수 변경을 제한한다', async () => {
  const user = userEvent.setup();
  render(<MemberEditForm member={member} activityId="preview-activity-33-1" />);
  const generation = screen.getByRole('spinbutton', { name: '활동 기수' });
  await user.clear(generation);
  await user.type(generation, '34');
  await user.tab();
  expect(screen.getByRole('alert')).toHaveTextContent(
    '팀이 연결된 회원은 기수를 정정할 수 없어요.',
  );
  expect(screen.getByRole('alert')).toHaveTextContent(
    '출석 기록이 있는 회원은 기수를 정정할 수 없어요.',
  );
});

it('저장과 비활동 처리는 준비 중으로 비활성화하고 Enter 제출을 막는다', async () => {
  const user = userEvent.setup();
  render(<MemberEditForm member={member} activityId="preview-activity-33-1" />);
  expect(screen.getByRole('button', { name: '저장 (준비 중)' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '비활동 처리 (준비 중)' })).toBeDisabled();
  await user.type(screen.getByRole('textbox', { name: '이름' }), '{Enter}');
  expect(screen.getByRole('form', { name: '회원 정보 수정' })).toBeInTheDocument();
});

it('변경 이력이 없는 활동은 빈 상태를 표시한다', () => {
  const emptyHistoryMember = memberPreviewAfterMapping.members.at(1);
  if (emptyHistoryMember === undefined) {
    throw new Error('회원 fixture가 비어 있습니다.');
  }
  render(<MemberEditForm member={emptyHistoryMember} activityId="preview-activity-33-2" />);
  expect(
    within(screen.getByRole('region', { name: '변경 이력' })).getByText('변경 이력이 없어요.'),
  ).toBeVisible();
});
