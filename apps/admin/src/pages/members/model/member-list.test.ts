import { expect, it } from 'vitest';
import {
  memberPreviewAfterMapping,
  memberPreviewBeforeMapping,
} from '~/features/member-management/fixtures';
import { memberSchema } from '~/features/member-management';
import { filterMembers, getMemberTeamOptions, unassignedTeamId } from './member-list';

const members = memberPreviewBeforeMapping.members;

it('현재 기수의 이름 부분 검색과 직군 교집합을 구하고 입력을 변경하지 않는다', () => {
  expect(
    filterMembers(members, 33, { q: ' 회원 3 ', part: 'android' }).map(({ id }) => id),
  ).toEqual(['preview-member-3']);
  expect(filterMembers(members, 33, { q: '회원 3', part: 'web' })).toHaveLength(0);
  expect(filterMembers(members, 32, { q: '', part: 'all' })).toHaveLength(1);
  expect(filterMembers(members, 34, { q: '', part: 'all' })).toHaveLength(0);
  expect(filterMembers(members, 33, { q: '   ', part: 'all' })).toHaveLength(6);
  expect(members.map(({ id }) => id)).toEqual(
    Array.from({ length: 6 }, (_, i) => `preview-member-${i + 1}`),
  );
});

it('이름 오름차순으로 정렬하고 동명이인은 식별자로 순서를 고정한다', () => {
  const input = [
    memberSchema.parse({ ...members[0], id: 'b', name: '가나' }),
    memberSchema.parse({ ...members[0], id: 'c', name: '다라' }),
    memberSchema.parse({ ...members[0], id: 'a', name: '가나' }),
  ];
  expect(filterMembers(input, 33, { q: '', part: 'all' }).map(({ id }) => id)).toEqual([
    'a',
    'b',
    'c',
  ]);
  expect(input.map(({ id }) => id)).toEqual(['b', 'c', 'a']);
});

it('현재 기수 전체 회원을 기준으로 팀별 인원을 계산하고 팀 교집합을 적용한다', () => {
  expect(getMemberTeamOptions(memberPreviewAfterMapping.members, 33)).toEqual([
    { id: 'preview-team-1', name: '예시 1팀', count: 3 },
    { id: 'preview-team-2', name: '예시 2팀', count: 2 },
    { id: unassignedTeamId, name: '팀 미배정', count: 1 },
  ]);
  expect(
    filterMembers(memberPreviewAfterMapping.members, 33, {
      q: '',
      part: 'all',
      team: 'preview-team-1',
    }).map(({ id }) => id),
  ).toEqual(['preview-member-1', 'preview-member-2', 'preview-member-3']);
  expect(
    filterMembers(memberPreviewAfterMapping.members, 33, {
      q: '회원 3',
      part: 'android',
      team: 'preview-team-1',
    }).map(({ id }) => id),
  ).toEqual(['preview-member-3']);
  expect(
    filterMembers(memberPreviewAfterMapping.members, 33, {
      q: '',
      part: 'all',
      team: unassignedTeamId,
    }).map(({ id }) => id),
  ).toEqual(['preview-member-6']);
  expect(
    filterMembers(memberPreviewAfterMapping.members, 33, { q: '', part: 'all', team: 'missing' }),
  ).toHaveLength(6);
});
