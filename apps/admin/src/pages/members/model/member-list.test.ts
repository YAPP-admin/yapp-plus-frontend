import { expect, it } from 'vitest';
import { memberPreviewBeforeMapping } from '~/features/member-management/fixtures';
import { memberSchema } from '~/features/member-management';
import { filterMembers } from './member-list';

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
