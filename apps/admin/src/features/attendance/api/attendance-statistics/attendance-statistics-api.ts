/** 기수·회원 단위 출석 통계 API와 화면 사이의 경계입니다. */

import {
  detail3,
  list7,
  type AdminAttendanceStatisticsDetailResponse,
  type AdminAttendanceStatisticsListResponse,
  type Detail3Data,
  type List7Data,
  type Options,
} from '@yapp-plus/api/generated';

export type AttendanceStatisticsInput = Readonly<{
  generationId: List7Data['path']['generationId'];
  position?: NonNullable<List7Data['query']>['position'];
}>;

export type MembershipAttendanceStatisticsInput = Readonly<{
  generationId: Detail3Data['path']['generationId'];
  membershipId: Detail3Data['path']['membershipId'];
}>;

/** 기수 전체 또는 직군으로 필터링한 회원별 출석 통계를 조회합니다. */
export async function getAttendanceStatistics(
  input: AttendanceStatisticsInput,
): Promise<AdminAttendanceStatisticsListResponse> {
  const query = input.position === undefined ? undefined : { position: input.position };
  const { data } = await list7({
    path: { generationId: input.generationId },
    ...(query ? { query } : {}),
    throwOnError: true,
  } satisfies Options<List7Data, true>);
  return data;
}

/** 한 회원의 확정 감점 사건과 현재 기수 점수를 조회합니다. */
export async function getMembershipAttendanceStatistics(
  input: MembershipAttendanceStatisticsInput,
): Promise<AdminAttendanceStatisticsDetailResponse> {
  const { data } = await detail3({
    path: { generationId: input.generationId, membershipId: input.membershipId },
    throwOnError: true,
  } satisfies Options<Detail3Data, true>);
  return data;
}

export const getMemberAttendanceStatistics = getMembershipAttendanceStatistics;
