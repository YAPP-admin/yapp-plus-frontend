import {
  find5InfiniteOptions,
  zAttendanceHistoryResponse,
  zAttendanceHistoryItemResponse,
  type AttendanceHistoryResponse,
} from '@yapp-plus/api/generated';

const historySchema = zAttendanceHistoryResponse
  .extend({
    items: zAttendanceHistoryItemResponse
      .extend({
        sessionId: zAttendanceHistoryItemResponse.shape.sessionId
          .refine(
            (id) => Number.isSafeInteger(Number(id)),
            '정밀도를 보장할 수 없는 세션 ID입니다.',
          )
          .transform(Number),
      })
      .array(),
  })
  .refine(
    ({ summary }) =>
      summary.totalSessionCount >= 0 &&
      summary.startedSessionCount >= 0 &&
      summary.startedSessionCount <= summary.totalSessionCount,
    '잘못된 세션 집계입니다.',
  )
  .refine(({ nextCursor }) => nextCursor === null || nextCursor.length > 0, '빈 커서입니다.');

export function historyQueryOptions(options?: Parameters<typeof find5InfiniteOptions>[0]) {
  const generated = find5InfiniteOptions({
    ...options,
    responseTransformer: (data) => historySchema.parseAsync(data),
  });
  return {
    ...generated,
    // 생성 타입에는 skipToken도 포함되지만 Suspense는 함수만 허용한다.
    queryFn: typeof generated.queryFn === 'function' ? generated.queryFn : undefined,
    initialPageParam: {},
    getNextPageParam: (lastPage: AttendanceHistoryResponse) => lastPage.nextCursor ?? undefined,
  };
}
