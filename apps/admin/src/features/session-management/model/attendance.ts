import { z } from 'zod';

const penaltyCategorySchema = z.enum(['regular', 'unauthorized', 'unknown']);
const durationBandSchema = z.enum(['withinOneHour', 'withinThreeHours']);
const timestampSchema = z.iso.datetime({ offset: true }).nullable();
const resultFields = {
  checkedInAt: timestampSchema,
  earlyLeaveAt: timestampSchema,
  reason: z.string().nullable(),
  explicitlyOverridden: z.boolean(),
};

// 보고·명찰과 독립된 실제 출결입니다. 시간 구간으로 실제 시각을 만들어내지 않습니다.
export const attendanceResultSchema = z.discriminatedUnion('status', [
  z.object({
    ...resultFields,
    status: z.enum(['undecided', 'present']),
    penaltyCategory: z.null(),
    durationBand: z.null(),
  }),
  z.object({
    ...resultFields,
    status: z.enum(['late', 'earlyLeave']),
    penaltyCategory: penaltyCategorySchema,
    durationBand: durationBandSchema.nullable(),
  }),
  z.object({
    ...resultFields,
    status: z.literal('absent'),
    penaltyCategory: penaltyCategorySchema,
    durationBand: z.null(),
  }),
  z.object({
    ...resultFields,
    status: z.literal('unsupported'),
    penaltyCategory: z.literal('unknown'),
    durationBand: z.null(),
  }),
]);

export const priorReportSchema = z.object({
  id: z.string().min(1),
  membershipId: z.string().min(1),
  type: z.enum(['late', 'earlyLeave', 'absence']),
  reason: z.string(),
  submittedAt: timestampSchema,
  eligibility: z.enum(['eligible', 'ineligible', 'unknown']),
});

export const badgeSchema = z.object({
  verified: z.boolean(),
  verifiedAt: timestampSchema,
});

export type AttendanceResult = z.infer<typeof attendanceResultSchema>;
export type PriorReportViewModel = z.infer<typeof priorReportSchema>;
export type BadgeViewModel = z.infer<typeof badgeSchema>;
