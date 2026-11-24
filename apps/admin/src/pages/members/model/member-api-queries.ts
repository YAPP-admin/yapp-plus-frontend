/** 회원관리 화면이 사용하는 생성 SDK Query 옵션을 조합합니다. */
import {
  detailOptions,
  list6InfiniteOptions,
  teamOptionsOptions,
  type AdminMemberListResponse,
} from '@yapp-plus/api/generated';
import type { MemberSearch } from './member-search';

const positionByPart = {
  pm: 'PM',
  design: 'DESIGN',
  android: 'ANDROID',
  ios: 'IOS',
  web: 'WEB',
  mobile: 'MOBILE',
  server: 'SERVER',
  'ai-native': 'AI_NATIVE',
} as const;

function parseTeamId(value: string | number | undefined) {
  if (value === undefined) {
    return undefined;
  }
  const teamId = Number(value);
  return Number.isInteger(teamId) && teamId > 0 ? teamId : undefined;
}

export function memberListQueryOptions(generationId: number, search: MemberSearch) {
  const query = {
    name: search.q.trim() || undefined,
    position: search.part === 'all' ? undefined : positionByPart[search.part],
    teamId: parseTeamId(search.team),
  };
  const generated = list6InfiniteOptions({ path: { generationId }, query });

  return {
    ...generated,
    initialPageParam: { path: { generationId }, query: {} },
    getNextPageParam: (lastPage: AdminMemberListResponse) => lastPage.nextCursor ?? undefined,
  };
}

export function memberTeamOptionsQueryOptions(generationId: number) {
  return teamOptionsOptions({ path: { generationId } });
}

export function memberDetailQueryOptions(generationId: number, memberId: number) {
  return detailOptions({ path: { generationId, memberId } });
}
