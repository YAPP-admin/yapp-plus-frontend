import { expect, it } from 'vitest';
import {
  memberPreviewAfterMapping,
  memberPreviewBeforeMapping,
} from '~/features/member-management/fixtures';
import {
  getGenerationCorrectionIssues,
  getMemberFormValues,
  memberFormErrors,
  type MemberFormValues,
} from './member-form';

const [mappedMember, ...restMembers] = memberPreviewAfterMapping.members;
const unassignedMember = restMembers.at(-1);
if (mappedMember === undefined || unassignedMember === undefined) {
  throw new Error('회원 fixture가 비어 있습니다.');
}

it('활동을 기준으로 수정 폼 기본값을 만든다', () => {
  expect(getMemberFormValues(mappedMember, 'preview-activity-33-1')).toEqual({
    name: '예시 회원 1',
    generation: 33,
    part: 'pm',
    role: 'admin',
  });
});

it('이름과 기수의 기본 입력 오류를 필드별로 반환한다', () => {
  const value: MemberFormValues = { name: ' ', generation: 0, part: 'pm', role: 'admin' };
  expect(
    memberFormErrors(value, { member: unassignedMember, activityId: 'preview-activity-33-6' }),
  ).toEqual({
    fields: {
      name: '이름을 입력하세요.',
      generation: '기수는 1 이상의 정수로 입력하세요.',
    },
  });
});

it('팀과 출석 기록이 연결된 활동은 기수 정정을 막는다', () => {
  expect(getGenerationCorrectionIssues(mappedMember, 'preview-activity-33-1', 34)).toEqual([
    '팀이 연결된 회원은 기수를 정정할 수 없어요.',
    '출석 기록이 있는 회원은 기수를 정정할 수 없어요.',
  ]);
});

it('같은 회원의 기존 기수와 중복되는 정정을 막는다', () => {
  expect(getGenerationCorrectionIssues(mappedMember, 'preview-activity-33-1', 32)).toEqual([
    '팀이 연결된 회원은 기수를 정정할 수 없어요.',
    '출석 기록이 있는 회원은 기수를 정정할 수 없어요.',
    '이미 같은 기수 활동이 있어요.',
  ]);
});

it('팀과 출석 기록이 없는 활동은 다른 기수로 정정할 수 있다', () => {
  expect(getGenerationCorrectionIssues(unassignedMember, 'preview-activity-33-6', 34)).toEqual([]);
  expect(
    memberFormErrors(
      { ...getMemberFormValues(unassignedMember, 'preview-activity-33-6'), generation: 34 },
      { member: unassignedMember, activityId: 'preview-activity-33-6' },
    ),
  ).toBeUndefined();
});

it('검증은 원본 회원 활동을 변경하지 않는다', () => {
  const firstMember = memberPreviewBeforeMapping.members.at(0);
  if (firstMember === undefined) {
    throw new Error('회원 fixture가 비어 있습니다.');
  }
  const original = structuredClone(firstMember);
  const values = getMemberFormValues(firstMember, 'preview-activity-33-1');
  memberFormErrors(
    { ...values, name: '수정 초안', generation: 34 },
    { member: firstMember, activityId: 'preview-activity-33-1' },
  );
  expect(firstMember).toEqual(original);
});
