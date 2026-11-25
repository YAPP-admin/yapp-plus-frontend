import { expect, it } from 'vitest';
import { memberListQueryOptions } from './member-api-queries';

it('검색 조건을 회원 목록 API 계약의 query로 변환한다', () => {
  const options = memberListQueryOptions(33, {
    tab: 'all',
    q: ' 김민수 ',
    part: 'ai-native',
    team: '7',
  });

  expect(options.queryKey[0]).toMatchObject({
    _id: 'list9',
    path: { generationId: 33 },
    query: { name: '김민수', position: 'AI_NATIVE', teamId: 7 },
  });
});

it('지원하지 않는 팀 필터 값은 teamId로 전송하지 않는다', () => {
  const options = memberListQueryOptions(33, {
    tab: 'all',
    q: '',
    part: 'all',
    team: 'unassigned',
  });

  expect(options.queryKey[0]).toMatchObject({
    path: { generationId: 33 },
    query: { name: undefined, position: undefined, teamId: undefined },
  });
});
