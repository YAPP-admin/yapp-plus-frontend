/** 관리자 세션 출석 조회·정정·마감 API와 화면 사이의 얇은 경계입니다. */

import {
  badge,
  cancel1,
  close,
  list4,
  override,
  type AdminAttendanceListResponse,
  type BadgeData,
  type CloseData,
  type List4Data,
  type Options,
  type OverrideData,
} from '@yapp-plus/api/generated';

export type AttendanceListInput = Readonly<{
  generationId: List4Data['path']['generationId'];
  sessionId: List4Data['path']['sessionId'];
  cursor?: NonNullable<List4Data['query']>['cursor'];
  size?: NonNullable<List4Data['query']>['size'];
}>;

export type AttendanceOverrideInput = Readonly<{
  generationId: OverrideData['path']['generationId'];
  sessionId: OverrideData['path']['sessionId'];
  membershipId: OverrideData['path']['membershipId'];
  body: OverrideData['body'];
}>;

export type AttendanceBadgeInput = Readonly<{
  generationId: BadgeData['path']['generationId'];
  sessionId: BadgeData['path']['sessionId'];
  membershipId: BadgeData['path']['membershipId'];
  body: BadgeData['body'];
}>;

export type AttendanceSessionInput = Readonly<{
  generationId: CloseData['path']['generationId'];
  sessionId: CloseData['path']['sessionId'];
}>;

/** 현재 세션의 출석 명단을 페이지 단위로 조회합니다. */
export async function getAttendance(
  input: AttendanceListInput,
): Promise<AdminAttendanceListResponse> {
  const query =
    input.cursor === undefined && input.size === undefined
      ? undefined
      : { cursor: input.cursor, size: input.size };
  const { data } = await list4({
    path: { generationId: input.generationId, sessionId: input.sessionId },
    ...(query ? { query } : {}),
    throwOnError: true,
  } satisfies Options<List4Data, true>);
  return data;
}

/** 운영진이 회원 한 명의 출석 상태를 정정합니다. 서버의 원본 시각과 사유를 그대로 전달합니다. */
export async function overrideAttendance(input: AttendanceOverrideInput): Promise<unknown> {
  const { data } = await override({
    path: {
      generationId: input.generationId,
      sessionId: input.sessionId,
      membershipId: input.membershipId,
    },
    body: input.body,
    throwOnError: true,
  } satisfies Options<OverrideData, true>);
  return data;
}

/** 출석 정정의 호출 이름을 화면 도메인에 맞춰 제공합니다. */
export const updateAttendance = overrideAttendance;

/** 회원의 명찰 확인 여부만 변경합니다. 출석 상태와 점수는 요청에 포함하지 않습니다. */
export async function updateAttendanceBadge(input: AttendanceBadgeInput): Promise<unknown> {
  const { data } = await badge({
    path: {
      generationId: input.generationId,
      sessionId: input.sessionId,
      membershipId: input.membershipId,
    },
    body: input.body,
    throwOnError: true,
  } satisfies Options<BadgeData, true>);
  return data;
}

/** 세션 전체의 출석을 마감합니다. 서버 오류는 호출자에게 그대로 전달합니다. */
export async function closeAttendance(input: AttendanceSessionInput): Promise<unknown> {
  const { data } = await close({
    path: { generationId: input.generationId, sessionId: input.sessionId },
    throwOnError: true,
  } satisfies Options<CloseData, true>);
  return data;
}

/** 출석 마감을 취소합니다. 마감 후 상태의 해석은 서버 응답과 화면 정책이 담당합니다. */
export async function cancelAttendanceClose(input: AttendanceSessionInput): Promise<unknown> {
  const { data } = await cancel1({
    path: { generationId: input.generationId, sessionId: input.sessionId },
    throwOnError: true,
  });
  return data;
}

export const updateBadge = updateAttendanceBadge;
export const cancelAttendance = cancelAttendanceClose;
