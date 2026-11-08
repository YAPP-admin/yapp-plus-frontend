import { queryOptions } from '@tanstack/react-query';
import { getStaticNotice, staticContentEnabled } from '@/features/static-content';
/** 생성 상세 API 응답을 화면이 안전하게 소비하는 공지 상세 모델로 검증·변환한다. */
import {
  detail2Options,
  zUserPostDetailResponse,
  zUserPostImageResponse,
} from '@yapp-plus/api/generated';
import { koreanDateString, koreanTimestamp } from '@/shared/lib/korean-date-time';

const safeInteger = (value: bigint) => Number.isSafeInteger(Number(value));

/** 상세 화면 진입값을 양의 안전한 정수 ID로 제한한다. */
export function noticeIdFromParam(value: string): number | undefined {
  if (!/^\d+$/.test(value)) {
    return undefined;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}

/** API bigint 식별자·집계를 number로 정규화하고 날짜·첨부 원본을 검증한다. */
export const noticeDetailSchema = zUserPostDetailResponse.extend({
  postId: zUserPostDetailResponse.shape.postId
    .refine(safeInteger, '정밀도를 보장할 수 없는 공지 ID입니다.')
    .refine((id) => id > 0, '공지 ID는 양수여야 합니다.')
    .transform(Number),
  readCount: zUserPostDetailResponse.shape.readCount
    .refine(safeInteger, '정밀도를 보장할 수 없는 읽음 수입니다.')
    .refine((count) => count >= 0, '읽음 수는 음수가 될 수 없습니다.')
    .transform(Number),
  images: zUserPostImageResponse
    .extend({
      sizeBytes: zUserPostImageResponse.shape.sizeBytes
        .refine(safeInteger, '정밀도를 보장할 수 없는 이미지 크기입니다.')
        .refine((size) => size >= 0, '이미지 크기는 음수가 될 수 없습니다.')
        .transform(Number),
    })
    .array(),
});

/** 인증 옵션과 검증기를 생성 detail query에 결합한다. */
export function memberNoticeDetailQueryOptions(
  postId: number,
  options?: Omit<Parameters<typeof detail2Options>[0], 'path'>,
) {
  const generated = detail2Options({
    ...options,
    path: { postId },
    responseTransformer: (data: unknown) => noticeDetailSchema.parseAsync(data),
  });
  return staticContentEnabled()
    ? queryOptions({
        ...generated,
        queryFn: () =>
          getStaticNotice(
            postId,
            typeof options?.auth === 'string' ? options.auth : undefined,
          ).then((data) => noticeDetailSchema.parseAsync(data)),
      })
    : generated;
}

/** 서울 오늘을 기준으로 날짜만 있는 마감일의 D-day 문구를 계산한다. */
export function noticeDeadlineLabel(deadlineDate: string, now = Date.now()) {
  const difference = Math.round(
    (koreanTimestamp(deadlineDate) - koreanTimestamp(koreanDateString(now))) / 86_400_000,
  );
  if (difference === 0) {
    return 'D-day';
  }
  return difference > 0 ? `D-${difference}` : `D+${-difference}`;
}

export type MemberNoticeDetail = Awaited<ReturnType<typeof noticeDetailSchema.parseAsync>>;
