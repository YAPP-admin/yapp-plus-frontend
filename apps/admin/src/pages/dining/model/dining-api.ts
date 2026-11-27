import { ApiError } from '@yapp-plus/api';
import {
  create5Mutation,
  detail6Options,
  groupsOptions,
  list2InfiniteOptions,
  list2InfiniteQueryKey,
  previewOptions,
  recipients2InfiniteOptions,
  type AfterpartyGroupResponse,
  type AfterpartyRecipientResponse,
  type AdminAfterpartyResponse,
} from '@yapp-plus/api/generated';
import {
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { z } from 'zod';
import { type DiningPeriod, type DiningResponseFilter } from './dining-search';

export const diningRoles = ['STAFF', 'PLAYER'] as const;
export type DiningRole = (typeof diningRoles)[number];

const normalizedDiningRoles: readonly DiningRole[] = ['PLAYER', 'STAFF'];
const staleTime = 60_000;

function getNextPageParam(lastPage: { nextCursor: string | null }) {
  return lastPage.nextCursor ?? undefined;
}

export function normalizeDiningRoles(roles: readonly DiningRole[]) {
  return normalizedDiningRoles.filter((role) => roles.includes(role));
}

export function diningListQueryOptions(generationId: number, period: DiningPeriod) {
  const options = { path: { generationId }, query: { period } } as const;
  return {
    ...list2InfiniteOptions(options),
    retry: false,
    staleTime,
    initialPageParam: options,
    getNextPageParam,
  };
}

export function diningDetailQueryOptions(afterpartyId: number) {
  return {
    ...detail6Options({ path: { afterpartyId } }),
    retry: false,
    staleTime,
  };
}

export function diningGroupsQueryOptions(afterpartyId: number) {
  return {
    ...groupsOptions({ path: { afterpartyId } }),
    retry: false,
    staleTime,
  };
}

export function diningRecipientsQueryOptions(afterpartyId: number, response: DiningResponseFilter) {
  const options = { path: { afterpartyId }, query: { response } } as const;
  return {
    ...recipients2InfiniteOptions(options),
    retry: false,
    staleTime,
    initialPageParam: options,
    getNextPageParam,
  };
}

export function diningPreviewQueryOptions(generationId: number, roles: readonly DiningRole[]) {
  const normalizedRoles = normalizeDiningRoles(roles);
  return {
    ...previewOptions({ path: { generationId }, query: { roles: normalizedRoles } }),
    enabled: normalizedRoles.length > 0,
    retry: false,
    staleTime,
  };
}

export function useDiningListQuery(generationId: number, period: DiningPeriod) {
  const query = useInfiniteQuery(diningListQueryOptions(generationId, period));
  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items ?? []) ?? [],
  };
}

export function useDiningDetailQueries(afterpartyId: number, response: DiningResponseFilter) {
  const detail = useQuery(diningDetailQueryOptions(afterpartyId));
  const groups = useQuery(diningGroupsQueryOptions(afterpartyId));
  const recipientsQuery = useInfiniteQuery(diningRecipientsQueryOptions(afterpartyId, response));

  return {
    detail,
    groups,
    recipients: {
      ...recipientsQuery,
      items: recipientsQuery.data?.pages.flatMap((page) => page.items ?? []) ?? [],
    },
  };
}

export function useDiningCreateMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({ ...create5Mutation(), retry: false });

  return {
    ...mutation,
    invalidateList: (generationId: number) =>
      queryClient.invalidateQueries({
        queryKey: list2InfiniteQueryKey({
          path: { generationId },
          query: { period: 'UPCOMING' },
        }),
      }),
  };
}

export function getAfterpartyApiErrorMessage(
  error: unknown,
  operation: 'list' | 'detail' | 'groups' | 'recipients' | 'preview' | 'create',
) {
  const failure = getApiFailure(error);

  if (failure.status === 401) {
    return '로그인이 만료되었어요. 다시 로그인해 주세요.';
  }
  if (failure.message) {
    return failure.message;
  }
  if (failure.status === 404 && operation === 'detail') {
    return '해당 뒤풀이를 찾을 수 없어요. 목록을 확인해 주세요.';
  }
  if (operation === 'create') {
    return '뒤풀이 생성에 실패했어요.';
  }
  if (operation === 'preview') {
    return '초대 대상 수를 불러오지 못했어요.';
  }
  if (operation === 'groups') {
    return '팀별 응답을 불러오지 못했어요.';
  }
  if (operation === 'recipients') {
    return '전체 명단을 불러오지 못했어요.';
  }
  if (operation === 'detail') {
    return '뒤풀이 정보를 불러오지 못했어요.';
  }
  return '뒤풀이 목록을 불러오지 못했어요.';
}

function getApiFailure(error: unknown): { message?: string; status?: number } {
  if (!(error instanceof ApiError)) {
    return {};
  }

  const parsed = z.object({ message: z.string().nullable() }).safeParse(error.body);
  return {
    message: parsed.success && parsed.data.message ? parsed.data.message : undefined,
    status: error.status,
  };
}

export function asDisplayValue(value: string | null | undefined) {
  return value?.trim() ? value : '-';
}

export function asCount(value: number | null | undefined) {
  return value ?? '-';
}

export function asNumber(value: number | null | undefined) {
  return value ?? 0;
}

export function responseRate(
  respondedCount: number | null | undefined,
  totalCount: number | null | undefined,
) {
  if (respondedCount == null || totalCount == null) {
    return '-';
  }
  if (totalCount === 0) {
    return '0%';
  }
  return `${Math.round((respondedCount / totalCount) * 100)}%`;
}

export function afterpartyStatusLabel(state: AdminAfterpartyResponse['state']) {
  if (state === 'OPEN') {
    return '진행 중';
  }
  if (state === 'CLOSED' || state === 'ENDED') {
    return '마감';
  }
  return '기타';
}

export function afterpartyStatusTone(state: AdminAfterpartyResponse['state']) {
  return state === 'OPEN' ? 'positive' : 'neutral';
}

export function positionLabel(position: AfterpartyRecipientResponse['position']) {
  if (position == null) {
    return '직군 미지정';
  }
  return (
    {
      PM: 'PM',
      DESIGN: 'Design',
      ANDROID: 'Android',
      IOS: 'iOS',
      WEB: 'Web',
      MOBILE: 'Mobile',
      SERVER: 'Server',
      AI_NATIVE: 'AI Native',
    }[position] ?? '기타'
  );
}

export function groupLabel(group: AfterpartyGroupResponse) {
  if (group.kind === 'STAFF') {
    return '운영진';
  }
  if (group.kind === 'UNASSIGNED') {
    return '기타';
  }
  return asDisplayValue(group.name);
}

export function getAfterpartyListQueryKey(generationId: number, period: DiningPeriod) {
  return diningListQueryOptions(generationId, period).queryKey;
}

export function invalidateAfterpartyLists(queryClient: QueryClient, generationId: number) {
  return queryClient.invalidateQueries({
    queryKey: ['list2', { path: { generationId } }],
  });
}
