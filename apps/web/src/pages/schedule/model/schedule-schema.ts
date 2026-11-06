import {
  zCurrentGenerationSessionItemResponse,
  zCurrentGenerationSessionsResponse,
} from '@yapp-plus/api/generated';

const sessionSchema = zCurrentGenerationSessionItemResponse
  .extend({
    sessionId: zCurrentGenerationSessionItemResponse.shape.sessionId.refine(
      (id) => Number.isSafeInteger(Number(id)),
      '정밀도를 보장할 수 없는 세션 ID입니다.',
    ),
    startTime: zCurrentGenerationSessionItemResponse.shape.startTime.regex(
      /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
    ),
    endTime: zCurrentGenerationSessionItemResponse.shape.endTime.regex(
      /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
    ),
  })
  .refine(
    (data) =>
      Date.parse(`${data.date}T${data.endTime}+09:00`) >=
      Date.parse(`${data.date}T${data.startTime}+09:00`),
    '세션 종료 시간이 시작 시간보다 빠릅니다.',
  );

export const scheduleSchema = zCurrentGenerationSessionsResponse.extend({
  generationId: zCurrentGenerationSessionsResponse.shape.generationId.refine(
    (id) => Number.isSafeInteger(Number(id)),
    '정밀도를 보장할 수 없는 기수 ID입니다.',
  ),
  sessions: sessionSchema.array(),
});
