import { queryOptions } from '@tanstack/react-query';
import { getStaticNotices, staticContentEnabled } from '@/features/static-content';
/** 생성 API 공지 응답을 목록 UI 계약으로 검증·변환하는 query 모델이다. */
import {
  list1InfiniteOptions,
  list1Options,
  zUserPostListItemResponse,
  zUserPostListResponse,
  type UserPostListResponse,
} from '@yapp-plus/api/generated';

/** OpenAPI 공지 유형에 전체 목록을 위한 클라이언트 선택값을 더한 필터 계약이다. */
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

/** API의 bigint ID·집계와 cursor를 UI가 안전하게 소비할 수 있는 값으로 검증·변환한다. */
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

/** 단일 첫 페이지 조회에 인증 옵션과 OpenAPI type 필터를 결합한다. */
export function memberNoticeListQueryOptions(
  category: NoticeCategory = 'ALL',
  options?: Parameters<typeof list1Options>[0],
) {
  const generated = list1Options(listOptions(category, options));
  return staticContentEnabled()
    ? queryOptions({
        ...generated,
        queryFn: () => getStaticNotices(category).then((data) => noticeListSchema.parseAsync(data)),
      })
    : generated;
}

/** cursor가 null일 때만 종료하는 무한 목록 query 옵션을 생성한다. */
export function memberNoticeListInfiniteQueryOptions(
  category: NoticeCategory = 'ALL',
  options?: Parameters<typeof list1InfiniteOptions>[0],
) {
  const generated = list1InfiniteOptions(listOptions(category, options));
  const queryFn = typeof generated.queryFn === 'function' ? generated.queryFn : undefined;
  return {
    ...generated,
    queryFn: staticContentEnabled()
      ? () => getStaticNotices(category).then((data) => noticeListSchema.parseAsync(data))
      : queryFn,
    initialPageParam: {},
    getNextPageParam: (lastPage: UserPostListResponse) => lastPage.nextCursor ?? undefined,
  };
}

export type MemberNoticeList = Awaited<ReturnType<typeof noticeListSchema.parseAsync>>;
