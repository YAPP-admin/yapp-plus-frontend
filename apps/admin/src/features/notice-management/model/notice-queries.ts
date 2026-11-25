/** Suspense 조회와 저장 성공 이후 캐시 갱신을 연결한다. */
import {
  create3Mutation,
  delete2Mutation,
  detail1Options,
  listInfiniteOptions,
  presign1Mutation,
  recipientsInfiniteOptions,
  update2Mutation,
} from '@yapp-plus/api/generated';
import {
  queryOptions,
  useInfiniteQuery,
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

export type NoticeListCategory = 'all' | 'session' | 'submission' | 'operation';

const apiTypeByCategory = {
  session: 'SESSION',
  submission: 'ASSIGNMENT',
  operation: 'OPERATION',
} as const;

/** 생성 SDK의 cursor 응답을 TanStack Query infinite query로 바로 연결한다. */
export function adminNoticeListQueryOptions(generationId: number, category: NoticeListCategory) {
  const query = category === 'all' ? {} : { type: apiTypeByCategory[category] };
  const generated = listInfiniteOptions({ path: { generationId }, query });

  return {
    ...generated,
    retry: false,
    initialPageParam: { path: { generationId }, query: {} },
    getNextPageParam: (lastPage: { nextCursor: string | null }) => lastPage.nextCursor ?? undefined,
  };
}

/** 목록 페이지를 평탄화하되, API 응답의 SDK 타입을 그대로 화면에 전달한다. */
export function useAdminNoticeListQuery(generationId: number, category: NoticeListCategory) {
  const query = useInfiniteQuery(adminNoticeListQueryOptions(generationId, category));
  const pages = query.data?.pages ?? [];

  return {
    ...query,
    notices: pages.flatMap((page) => page.items),
    totalPostCount: pages[0]?.totalPostCount ?? 0,
  };
}

/** 상세 공지는 생성 SDK의 응답을 가공하지 않고 사용한다. */
export function useAdminNoticeQuery(generationId: number, noticeId: string) {
  return useSuspenseQuery(detail1Options({ path: { generationId, postId: Number(noticeId) } }));
}

export function adminNoticeRecipientsQueryOptions(generationId: number, noticeId: string) {
  const generated = recipientsInfiniteOptions({
    path: { generationId, postId: Number(noticeId) },
  });

  return {
    ...generated,
    retry: false,
    initialPageParam: {
      path: { generationId, postId: Number(noticeId) },
      query: {},
    },
    getNextPageParam: (lastPage: { nextCursor: string | null }) => lastPage.nextCursor ?? undefined,
  };
}

/** 수신자 조회는 상세 본문과 독립적으로 실패·재시도할 수 있게 non-suspense로 둔다. */
export function useAdminNoticeRecipientsQuery(generationId: number, noticeId: string) {
  const query = useInfiniteQuery(adminNoticeRecipientsQueryOptions(generationId, noticeId));
  const pages = query.data?.pages ?? [];

  return {
    ...query,
    recipients: pages.flatMap((page) => page.items),
    recipientCount: pages[0]?.recipientCount ?? 0,
    readCount: pages[0]?.readCount ?? 0,
  };
}

function invalidateGeneratedNoticeQueries(client: ReturnType<typeof useQueryClient>) {
  void client.invalidateQueries({
    predicate: ({ queryKey }) => {
      const key = queryKey[0];
      const operationId =
        typeof key === 'object' && key !== null ? Reflect.get(key, '_id') : undefined;
      return operationId === 'list' || operationId === 'detail1' || operationId === 'recipients';
    },
  });
}

/** 생성 SDK mutation 옵션을 그대로 사용한다. 별도 API 어댑터나 응답 변환을 두지 않는다. */
export function useAdminNoticeMutations(generationId: number) {
  const client = useQueryClient();

  const create = useMutation({
    ...create3Mutation(),
    retry: false,
    onSuccess: () => invalidateGeneratedNoticeQueries(client),
  });
  const update = useMutation({
    ...update2Mutation(),
    retry: false,
    onSuccess: () => invalidateGeneratedNoticeQueries(client),
  });
  const remove = useMutation({
    ...delete2Mutation(),
    retry: false,
    onSuccess: () => invalidateGeneratedNoticeQueries(client),
  });
  const presign = useMutation({ ...presign1Mutation(), retry: false });

  return { create, update, remove, presign, generationId };
}

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
