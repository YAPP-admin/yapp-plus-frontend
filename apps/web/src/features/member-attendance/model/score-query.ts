import { queryOptions } from '@tanstack/react-query';
import {
  mineOptions,
  zErrorResponse,
  zMyAttendanceScoreResponse,
  type MyAttendanceScoreResponse,
} from '@yapp-plus/api/generated';

const scoreSchema = zMyAttendanceScoreResponse.extend({
  generationId: zMyAttendanceScoreResponse.shape.generationId
    .refine((id) => Number.isSafeInteger(Number(id)), '정밀도를 보장할 수 없는 기수 ID입니다.')
    .transform(Number),
});

type MemberScoreResult =
  | { status: 'available'; score: MyAttendanceScoreResponse }
  | {
      status: 'unavailable';
      reason: 'ATTENDANCE_SCORE_NOT_ELIGIBLE' | 'CURRENT_GENERATION_NOT_FOUND';
    };

/** 생성 옵션의 요청을 재사용하고 두 화면이 같은 검증 결과·미대상 캐시를 사용합니다. */
export const memberScoreQueryOptions = (options?: Parameters<typeof mineOptions>[0]) => {
  const { queryKey, queryFn } = mineOptions({
    ...options,
    // HTTP 오류 본문은 생성 SDK가 파싱한 뒤 전달하도록 합니다.
    kyOptions: { ...options?.kyOptions, throwHttpErrors: false },
  });
  return queryOptions({
    queryKey,
    queryFn: async (context): Promise<MemberScoreResult> => {
      try {
        return { status: 'available', score: scoreSchema.parse(await queryFn?.(context)) };
      } catch (cause) {
        const error = zErrorResponse.safeParse(cause);
        if (
          error.success &&
          (error.data.code === 'ATTENDANCE_SCORE_NOT_ELIGIBLE' ||
            error.data.code === 'CURRENT_GENERATION_NOT_FOUND')
        ) {
          return { status: 'unavailable', reason: error.data.code };
        }
        throw cause;
      }
    },
  });
};
