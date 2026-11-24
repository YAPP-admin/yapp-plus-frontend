/** 공급부의 제출 대상과 폼 입력을 검증한다. API 요청 형식과 별도로 화면 입력 정책만 정의한다. */
import { z } from 'zod';
import { zSubmitTeamPhotoRequest, type SubmitTeamPhotoRequest } from '@yapp-plus/api/generated';

const membershipId = z.int().positive();
const memberSchema = z.object({
  membershipId,
  name: z.string().trim().min(1),
  positionLabel: z.string().trim().min(1),
});

/** API 응답·개발 fixture 공급부에서 파싱한다. 폼이나 제출 요청에서 다시 검증하지 않는다. */
export const teamAttendanceTargetSchema = z
  .object({
    sessionId: z.int().positive(),
    teamId: z.int().positive(),
    teamName: z.string().trim().min(1),
    selfMembershipId: membershipId,
    members: z.array(memberSchema),
  })
  .refine(
    ({ members }) => new Set(members.map((member) => member.membershipId)).size === members.length,
    '팀원 명단에 중복이 없어야 해요.',
  )
  .refine(
    ({ members, selfMembershipId }) =>
      members.some((member) => member.membershipId === selfMembershipId),
    '팀원 명단에는 본인이 포함되어야 해요.',
  )
  .brand<'TeamAttendanceTarget'>();

/** 공급 경계에서 검증한 제출 대상. 사용자 ID를 membershipId로 대신하지 않는다. */
export type TeamAttendanceTarget = z.infer<typeof teamAttendanceTargetSchema>;
/** 접수 결과에 표시할 제출 당시 팀원 정보다. */
export type TeamMember = z.infer<typeof memberSchema>;
/** 화면에서 바꿀 수 있는 참석자 선택 값이다. 사진은 상위 흐름에서 별도로 소유한다. */
export type TeamAttendanceFormValues = { selectedMembershipIds: number[] };
/** 폼의 제출 검증을 통과한 값. 사진 바이트는 상위 흐름이 소유한 File을 그대로 사용한다. */
export type SubmissionInput = {
  target: TeamAttendanceTarget;
  photo: File;
  selectedMembershipIds: number[];
};

/** 업로드 완료 화면 상태에서 생성된 팀 사진 제출 요청 본문만 만든다. */
export function toSubmitTeamPhotoRequest(
  imageKey: string,
  selectedMembershipIds: number[],
): SubmitTeamPhotoRequest {
  const body = { imageKey, selectedMembershipIds } satisfies SubmitTeamPhotoRequest;
  zSubmitTeamPhotoRequest.parse(body);
  return body;
}

/** 검증된 대상 명단에 맞춰 사용자가 바꿀 수 있는 참석자 입력만 검증하는 TanStack Form용 스키마다. */
export function createTeamAttendanceFormSchema(target: TeamAttendanceTarget) {
  const memberIds = new Set(target.members.map((member) => member.membershipId));

  return z.object({
    selectedMembershipIds: z
      .array(membershipId)
      .refine(
        (ids) => ids.includes(target.selfMembershipId),
        '참석 명단에는 본인이 포함되어야 해요.',
      )
      .refine((ids) => new Set(ids).size === ids.length, '참석자를 중복 선택할 수 없어요.')
      .refine(
        (ids) => ids.every((id) => memberIds.has(id)),
        '팀원 명단에서 참석자를 선택해 주세요.',
      ),
  });
}

/** 서버 원문·서명 URL·사진을 포함하지 않는 화면용 실패다. 결과 불명은 재제출할 수 없다. */
export class SubmissionError extends Error {
  constructor(
    readonly kind: 'offline' | 'failed' | 'unknown',
    message: string,
  ) {
    super(message);
    this.name = 'SubmissionError';
  }
}
