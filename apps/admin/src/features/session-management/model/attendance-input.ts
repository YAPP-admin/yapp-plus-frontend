import { z } from 'zod';

const idSchema = z.string().trim().min(1);
const editFields = { membershipId: idSchema, reason: z.string().trim().nullable().default(null) };
const categorySchema = z.enum(['regular', 'unauthorized']);

export const attendanceEditInputSchema = z.discriminatedUnion('status', [
  z.object({
    ...editFields,
    status: z.enum(['present', 'undecided']),
    penaltyCategory: z.null(),
    durationBand: z.null(),
  }),
  z.object({
    ...editFields,
    status: z.enum(['late', 'earlyLeave']),
    penaltyCategory: categorySchema,
    durationBand: z.enum(['withinOneHour', 'withinThreeHours']),
  }),
  z.object({
    ...editFields,
    status: z.literal('absent'),
    penaltyCategory: categorySchema,
    durationBand: z.null(),
  }),
]);

export const badgeEditInputSchema = z.object({ membershipId: idSchema, verified: z.boolean() });
export const teamDecisionInputSchema = z.object({
  photoId: idSchema,
  decision: z.enum(['approve', 'reject']),
  reason: z.string().trim().max(500).nullable().default(null),
});

export const attendanceDraftSchema = z
  .object({
    sessionId: idSchema,
    memberEdits: z.record(idSchema, attendanceEditInputSchema),
    badgeEdits: z.record(idSchema, badgeEditInputSchema),
    teamDecisions: z.record(idSchema, teamDecisionInputSchema),
  })
  .superRefine((draft, context) => {
    (['memberEdits', 'badgeEdits'] as const).forEach((field) => {
      const edits: Record<string, { membershipId: string }> = draft[field];
      Object.entries(edits).forEach(([id, edit]) => {
        if (id !== edit.membershipId) {
          context.addIssue({
            code: 'custom',
            path: [field, id],
            message: '회원 식별자가 일치하지 않습니다.',
          });
        }
      });
    });
    Object.entries(draft.teamDecisions).forEach(([id, decision]) => {
      if (id !== decision.photoId) {
        context.addIssue({
          code: 'custom',
          path: ['teamDecisions', id],
          message: '사진 식별자가 일치하지 않습니다.',
        });
      }
    });
  });

export const closeAttendanceInputSchema = z
  .object({ sessionId: idSchema, draft: attendanceDraftSchema })
  .refine(({ sessionId, draft }) => sessionId === draft.sessionId, {
    path: ['draft', 'sessionId'],
    message: '다른 세션의 변경을 마감에 포함할 수 없습니다.',
  });

export type AttendanceEditInput = z.infer<typeof attendanceEditInputSchema>;
export type BadgeEditInput = z.infer<typeof badgeEditInputSchema>;
export type TeamDecisionInput = z.infer<typeof teamDecisionInputSchema>;
export type AttendanceDraft = z.infer<typeof attendanceDraftSchema>;
export type CloseAttendanceInput = z.infer<typeof closeAttendanceInputSchema>;
