import { z } from 'zod';
import {
  memberPartSchema,
  memberRoleSchema,
  type Member,
  type MemberPart,
  type MemberRole,
} from '~/features/member-management';

export type MemberFormValues = {
  name: string;
  generation: number;
  part: MemberPart;
  role: MemberRole;
};

export type MemberFormContext = {
  member: Member;
  activityId: string;
};

export const memberFormSchema = z
  .object({
    name: z.string().trim().min(1, '이름을 입력하세요.'),
    generation: z.number().int().positive('기수는 1 이상의 정수로 입력하세요.'),
    part: memberPartSchema,
    role: memberRoleSchema,
  })
  .readonly();

export function getMemberFormValues(member: Member, activityId: string): MemberFormValues {
  const activity = member.activities.find((item) => item.id === activityId);
  if (activity === undefined) {
    throw new Error(`회원 활동을 찾을 수 없습니다: ${activityId}`);
  }

  return {
    name: member.name,
    generation: activity.generation,
    part: activity.part,
    role: activity.role,
  };
}

export function getGenerationCorrectionIssues(
  member: Member,
  activityId: string,
  generation: number,
): readonly string[] {
  const activity = member.activities.find((item) => item.id === activityId);
  if (activity === undefined || generation === activity.generation) {
    return [];
  }

  return [
    activity.team ? '팀이 연결된 회원은 기수를 정정할 수 없어요.' : undefined,
    activity.attendance.hasRecords ? '출석 기록이 있는 회원은 기수를 정정할 수 없어요.' : undefined,
    member.activities.some((other) => other.id !== activity.id && other.generation === generation)
      ? '이미 같은 기수 활동이 있어요.'
      : undefined,
  ].filter((issue): issue is string => issue !== undefined);
}

/** 저장 기능이 연결되기 전에도 입력 규칙과 기수 정정 제한을 같은 계약으로 검증한다. */
export function memberFormErrors(value: MemberFormValues, context: MemberFormContext) {
  const result = memberFormSchema.safeParse(value);
  const fields: Record<string, string> = {};

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === 'string' && fields[field] === undefined) {
        fields[field] = issue.message;
      }
    });
  }

  if (result.success && Number.isInteger(value.generation)) {
    const issues = getGenerationCorrectionIssues(
      context.member,
      context.activityId,
      value.generation,
    );
    if (issues.length > 0) {
      fields.generation = issues.join(' ');
    }
  }

  return Object.keys(fields).length > 0 ? { fields } : undefined;
}
