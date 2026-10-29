import { z } from 'zod';
import { memberPhoneNumberSchema } from './phone-number';

// 화면 전용 값이며 OpenAPI의 PLAYER/OB나 공지용 합성 회원과 매핑하지 않는다.
export const memberPartSchema = z.enum(['pm', 'design', 'android', 'ios', 'web', 'server']);
export const memberRoleSchema = z.enum(['admin', 'active-member', 'regular-member']);
export const memberStatusSchema = z.enum(['active', 'inactive']);

const identifier = z.string().trim().min(1);
const changeSchema = z
  .object({
    occurredAt: z.iso.datetime(),
    actorName: z.string().trim().min(1),
    field: z.enum(['name', 'generation', 'part', 'role', 'status']),
    previousValue: z.string(),
    nextValue: z.string(),
  })
  .readonly();

export const memberActivitySchema = z
  .object({
    id: identifier,
    generation: z.number().int().positive(),
    part: memberPartSchema,
    role: memberRoleSchema,
    status: memberStatusSchema,
    joinedAt: z.iso.datetime(),
    team: z
      .object({ id: identifier, name: z.string().trim().min(1), isLeader: z.boolean() })
      .readonly()
      .nullable(),
    // 0점과 기록 없음을 구분하고 기수 정정 제한에는 기록 존재 여부를 사용한다.
    attendance: z.object({ score: z.number().nullable(), hasRecords: z.boolean() }).readonly(),
    changes: changeSchema.array().readonly(),
  })
  .readonly();

/** 목록·수정·명단 검토에 전달하는 읽기 전용 입력이다. 저장 동작은 제공하지 않는다. */
export const memberSchema = z
  .object({
    id: identifier,
    name: z.string().trim().min(1),
    phoneNumber: memberPhoneNumberSchema,
    activities: memberActivitySchema.array().readonly(),
  })
  .superRefine((member, context) => {
    const generations = new Set<number>();
    member.activities.forEach((activity, index) => {
      if (generations.has(activity.generation)) {
        context.addIssue({
          code: 'custom',
          path: ['activities', index, 'generation'],
          message: '같은 회원의 기수별 활동은 하나만 허용합니다.',
        });
      }
      generations.add(activity.generation);
    });
  })
  .readonly();

export type Member = z.infer<typeof memberSchema>;
export type MemberActivity = z.infer<typeof memberActivitySchema>;
export type MemberPart = z.infer<typeof memberPartSchema>;
export type MemberRole = z.infer<typeof memberRoleSchema>;
export type MemberStatus = z.infer<typeof memberStatusSchema>;
