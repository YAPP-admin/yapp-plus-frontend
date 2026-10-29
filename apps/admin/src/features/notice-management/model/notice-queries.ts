/** Suspense 조회와 저장 성공 이후 캐시 갱신을 연결한다. */
import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
  useSuspenseQueries,
  useQueryClient,
} from '@tanstack/react-query';
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
  networkMode: 'always',
  retry: false,
});

export const noticeMembersQueryOptions = queryOptions({
  queryKey: ['admin', 'notice-members'],
  queryFn: listNoticeMembers,
  networkMode: 'always',
  retry: false,
});

/** 상세 캐시 키는 목록 키 뒤에 ID를 붙인다. */
export const noticeQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...noticesKey, id],
    queryFn: () => getNotice(id),
    networkMode: 'always',
    retry: false,
  });

/** 목록과 읽음 집계용 회원을 동시에 조회한다. */
export function useNoticesQuery() {
  const [notices, members] = useSuspenseQueries({
    queries: [noticesQueryOptions, noticeMembersQueryOptions],
  });

  return { notices: notices.data, members: members.data };
}

/** 수정 화면에서 공지 한 건을 조회한다. 없는 ID는 null이다. */
export function useNoticeQuery(id: string) {
  return useSuspenseQuery(noticeQueryOptions(id));
}

/** 상세 공지와 읽음 대상 명단을 동시에 조회한다. */
export function useNoticeDetailQuery(id: string) {
  const [notice, members] = useSuspenseQueries({
    queries: [noticeQueryOptions(id), noticeMembersQueryOptions],
  });

  return { notice: notice.data, members: members.data };
}

/** 성공 시에만 관련 조회를 무효화한다. 실패 시 캐시를 먼저 바꾸지 않는다. */
export function useNoticeMutations() {
  const client = useQueryClient();

  const create = useMutation({
    mutationFn: createNotice,
    networkMode: 'always',
    retry: false,
    onSuccess: () => client.invalidateQueries({ queryKey: noticesKey }),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: NoticeContent }) => updateNotice(id, input),
    networkMode: 'always',
    retry: false,
    onSuccess: () => client.invalidateQueries({ queryKey: noticesKey }),
  });

  const remove = useMutation({
    mutationFn: deleteNotice,
    networkMode: 'always',
    retry: false,
    onSuccess: async (_, id) => {
      client.removeQueries({ queryKey: noticeQueryOptions(id).queryKey, exact: true });
      await client.invalidateQueries({ queryKey: noticesKey });
    },
  });

  return { create, update, remove };
}
