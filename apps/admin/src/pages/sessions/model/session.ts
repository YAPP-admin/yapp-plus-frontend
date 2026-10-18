/** 세션 입력·조회·출석 집계의 스키마와 타입, 최신 일정순 정렬 규칙을 정의합니다. */
import { z } from 'zod';

export const sessionTypeSchema = z.enum(['regular', 'team']);

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, '시간을 HH:mm 형식으로 입력하세요.');

export const createSessionInputSchema = z
  .object({
    name: z.string().trim().min(1, '세션명을 입력하세요.'),
    location: z.string().trim().min(1, '장소를 입력하세요.'),
    date: z.iso.date('올바른 날짜를 입력하세요.'),
    startTime: timeSchema,
    endTime: timeSchema,
    type: sessionTypeSchema,
  })
  .refine(({ startTime, endTime }) => endTime > startTime, {
    message: '종료 시간은 시작 시간보다 늦어야 합니다.',
    path: ['endTime'],
  });

export const sessionAttendanceSummarySchema = z.object({
  present: z.number().int().nonnegative(),
  late: z.number().int().nonnegative(),
  absent: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  reported: z.number().int().nonnegative(),
});

export const sessionSchema = createSessionInputSchema.safeExtend({
  id: z.string().trim().min(1),
  attendance: sessionAttendanceSummarySchema,
});

export type SessionType = z.infer<typeof sessionTypeSchema>;
export type CreateSessionInput = z.infer<typeof createSessionInputSchema>;
export type SessionAttendanceSummary = z.infer<typeof sessionAttendanceSummarySchema>;
export type Session = z.infer<typeof sessionSchema>;

export function sortSessions(sessions: readonly Session[]): Session[] {
  // ES2022 대상에는 toSorted가 없어 복사본만 정렬합니다.
  // oxlint-disable-next-line unicorn/no-array-sort
  return [...sessions].sort((left, right) =>
    `${right.date}T${right.startTime}`.localeCompare(`${left.date}T${left.startTime}`),
  );
}
