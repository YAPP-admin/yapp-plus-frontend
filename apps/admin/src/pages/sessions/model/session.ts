import { z } from 'zod';

export const sessionTypeSchema = z.enum(['offline', 'team']);

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, '시간을 HH:mm 형식으로 입력하세요.');

const commonFields = {
  name: z.string().trim().min(1, '세션명을 입력하세요.'),
  date: z.iso.date('올바른 날짜를 입력하세요.'),
  startTime: timeSchema,
  endTime: timeSchema,
};

const offlineInputSchema = z.object({
  ...commonFields,
  type: z.literal('offline'),
  location: z.object({
    roadAddress: z.string().trim().min(1, '주소를 선택하세요.'),
    detailAddress: z.string().trim(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});
const teamInputSchema = z.object({
  ...commonFields,
  type: z.literal('team'),
  location: z.object({ guide: z.string().trim() }),
});

const validSchedule = ({ startTime, endTime }: { startTime: string; endTime: string }) =>
  endTime > startTime;
const scheduleError = {
  message: '종료 시간은 시작 시간보다 늦어야 합니다.',
  path: ['endTime'],
};

export const createSessionInputSchema = z
  .discriminatedUnion('type', [offlineInputSchema, teamInputSchema])
  .refine(validSchedule, scheduleError);

export const sessionAttendanceSummarySchema = z.object({
  present: z.number().int().nonnegative(),
  late: z.number().int().nonnegative(),
  absent: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  reported: z.number().int().nonnegative(),
});

const storedFields = {
  id: z.string().trim().min(1),
  attendance: sessionAttendanceSummarySchema,
};
export const sessionSchema = z
  .discriminatedUnion('type', [
    offlineInputSchema.extend(storedFields),
    teamInputSchema.extend(storedFields),
  ])
  .refine(validSchedule, scheduleError);

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
