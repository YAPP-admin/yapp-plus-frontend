/** 관리자 팀 출석 사진 조회·판정 API와 화면 사이의 경계입니다. */

import {
  decide,
  list2,
  type DecideData,
  type DecideResponse,
  type List2Data,
  type List2Response,
  type Options,
} from '@yapp-plus/api/generated';

export type TeamAttendancePhotoListInput = Readonly<{
  generationId: List2Data['path']['generationId'];
  sessionId: List2Data['path']['sessionId'];
}>;

export type TeamAttendancePhotoDecisionInput = Readonly<{
  generationId: DecideData['path']['generationId'];
  sessionId: DecideData['path']['sessionId'];
  photoId: DecideData['path']['photoId'];
  body: DecideData['body'];
}>;

/** 제출된 팀 사진과 사진에 포함된 전체 팀원 보고를 조회합니다. */
export async function getTeamAttendancePhotos(
  input: TeamAttendancePhotoListInput,
): Promise<List2Response> {
  const { data } = await list2({
    path: { generationId: input.generationId, sessionId: input.sessionId },
    throwOnError: true,
  } satisfies Options<List2Data, true>);
  return data;
}

/** 팀 사진을 승인하거나 반려합니다. 판정 값과 사유는 generated DTO 계약을 따릅니다. */
export async function decideTeamAttendancePhoto(
  input: TeamAttendancePhotoDecisionInput,
): Promise<DecideResponse> {
  const { data } = await decide({
    path: {
      generationId: input.generationId,
      sessionId: input.sessionId,
      photoId: input.photoId,
    },
    body: input.body,
    throwOnError: true,
  } satisfies Options<DecideData, true>);
  return data;
}

export const updateTeamAttendancePhotoDecision = decideTeamAttendancePhoto;
