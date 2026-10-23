/** hydration 이후의 개발용 조회와 저장 성공 이후 캐시 갱신을 연결한다. */
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHydrated } from '@tanstack/react-router';
import type { NoticeContent } from './notice';
import {
  createNotice,
  deleteNotice,
  getNotice,
  listNoticeMembers,
  listNotices,
  updateNotice,
} from './notices';

const noticesKey = ['admin', 'notices'] as const;
export const noticesQueryOptions = queryOptions({
  queryKey: noticesKey,
  queryFn: listNotices,
  retry: false,
});
export const noticeMembersQueryOptions = queryOptions({
  queryKey: ['admin', 'notice-members'],
  queryFn: listNoticeMembers,
  retry: false,
});

/** 상세 캐시 키는 목록 키 뒤에 ID를 붙인다. */
export const noticeQueryOptions = (id: string) =>
  queryOptions({ queryKey: [...noticesKey, id], queryFn: () => getNotice(id), retry: false });

/** SSR·프로덕션·hydration 이전에는 조회를 시작하지 않는다. */
function useNoticesEnabled() {
  const hydrated = useHydrated();
  return import.meta.env.DEV && !import.meta.env.SSR && typeof window !== 'undefined' && hydrated;
}

/** 전체 공지 조회 상태를 제공한다. */
export function useNoticesQuery() {
  return useQuery({ ...noticesQueryOptions, enabled: useNoticesEnabled() });
}

/** 상세 공지 조회 상태를 제공한다. */
export function useNoticeQuery(id: string) {
  return useQuery({ ...noticeQueryOptions(id), enabled: useNoticesEnabled() });
}

/** 읽음 대상 계산용 명단 조회 상태를 제공한다. */
export function useNoticeMembersQuery() {
  return useQuery({ ...noticeMembersQueryOptions, enabled: useNoticesEnabled() });
}

/** 성공 시에만 관련 조회를 무효화한다. 실패 시 캐시를 먼저 바꾸지 않는다. */
export function useNoticeMutations() {
  const client = useQueryClient();
  const create = useMutation({
    mutationFn: createNotice,
    retry: false,
    onSuccess: () => client.invalidateQueries({ queryKey: noticesKey }),
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: NoticeContent }) => updateNotice(id, input),
    retry: false,
    onSuccess: () => client.invalidateQueries({ queryKey: noticesKey }),
  });
  const remove = useMutation({
    mutationFn: deleteNotice,
    retry: false,
    onSuccess: async (_, id) => {
      client.removeQueries({ queryKey: noticeQueryOptions(id).queryKey, exact: true });
      await client.invalidateQueries({ queryKey: noticesKey });
    },
  });
  return { create, update, remove };
}
