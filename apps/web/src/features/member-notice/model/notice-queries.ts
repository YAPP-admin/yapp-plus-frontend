import {
  list1InfiniteOptions,
  list1Options,
  zUserPostListItemResponse,
  zUserPostListResponse,
  type UserPostListResponse,
} from '@yapp-plus/api/generated';

export type NoticeCategory = 'ALL' | 'SESSION' | 'ASSIGNMENT' | 'OPERATION';

const safeInteger = (value: bigint) => Number.isSafeInteger(Number(value));

const noticeItemSchema = zUserPostListItemResponse.extend({
  postId: zUserPostListItemResponse.shape.postId
    .refine(safeInteger, '정밀도를 보장할 수 없는 공지 ID입니다.')
    .refine((id) => id > 0, '공지 ID는 양수여야 합니다.')
    .transform(Number),
  daysUntilDeadline: zUserPostListItemResponse.shape.daysUntilDeadline
    .nullable()
    .transform((value) => (value === null ? null : Number(value))),
});

export const noticeListSchema = zUserPostListResponse
  .extend({
    totalPostCount: zUserPostListResponse.shape.totalPostCount
      .refine(safeInteger, '정밀도를 보장할 수 없는 공지 수입니다.')
      .refine((count) => count >= 0, '공지 수는 음수가 될 수 없습니다.')
      .transform(Number),
    items: noticeItemSchema.array(),
  })
  .refine(({ nextCursor }) => nextCursor === null || nextCursor.length > 0, '빈 커서입니다.');

function listOptions(category: NoticeCategory, options?: Parameters<typeof list1Options>[0]) {
  return {
    ...options,
    query: { ...options?.query, type: category },
    responseTransformer: (data: unknown) => noticeListSchema.parseAsync(data),
  };
}

export function memberNoticeListQueryOptions(
  category: NoticeCategory = 'ALL',
  options?: Parameters<typeof list1Options>[0],
) {
  return list1Options(listOptions(category, options));
}

export function memberNoticeListInfiniteQueryOptions(
  category: NoticeCategory = 'ALL',
  options?: Parameters<typeof list1InfiniteOptions>[0],
) {
  const generated = list1InfiniteOptions(listOptions(category, options));
  return {
    ...generated,
    queryFn: typeof generated.queryFn === 'function' ? generated.queryFn : undefined,
    initialPageParam: {},
    getNextPageParam: (lastPage: UserPostListResponse) => lastPage.nextCursor ?? undefined,
  };
}

export type MemberNoticeList = Awaited<ReturnType<typeof noticeListSchema.parseAsync>>;
