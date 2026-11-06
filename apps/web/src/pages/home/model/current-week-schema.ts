import {
  zCurrentWeekSessionDetailResponse,
  zCurrentWeekSessionResponse,
} from '@yapp-plus/api/generated';

const sessionSchema = zCurrentWeekSessionDetailResponse.extend({
  sessionId: zCurrentWeekSessionDetailResponse.shape.sessionId.refine(
    (id) => Number.isSafeInteger(Number(id)),
    '정밀도를 보장할 수 없는 세션 ID입니다.',
  ),
  startTime: zCurrentWeekSessionDetailResponse.shape.startTime.regex(
    /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
  ),
});

export const currentWeekSchema = zCurrentWeekSessionResponse
  .extend({ session: sessionSchema.nullable() })
  .refine(
    (data) => Date.parse(data.weekEndDate) - Date.parse(data.weekStartDate) === 6 * 86_400_000,
    '주간 날짜 범위가 올바르지 않습니다.',
  )
  .refine(
    (data) =>
      !data.session ||
      (data.session.date >= data.weekStartDate && data.session.date <= data.weekEndDate),
    '세션 날짜가 주간 범위를 벗어났습니다.',
  );
