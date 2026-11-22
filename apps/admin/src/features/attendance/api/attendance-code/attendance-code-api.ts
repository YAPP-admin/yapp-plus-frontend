/** 관리자 세션 출석 코드 조회·발급·재발급 API와 화면 사이의 경계입니다. */

import {
  get,
  reissue,
  start,
  type AttendanceCodeResponse,
  type GetData,
  type Options,
  type ReissueData,
  type StartData,
} from '@yapp-plus/api/generated';

export type AttendanceCodeInput = Readonly<{
  generationId: GetData['path']['generationId'];
  sessionId: GetData['path']['sessionId'];
}>;

/** 발급 여부와 현재 코드의 서버 표현을 조회합니다. 조회만으로 코드를 발급하지 않습니다. */
export async function getAttendanceCode(
  input: AttendanceCodeInput,
): Promise<AttendanceCodeResponse> {
  const { data } = await get({
    path: { generationId: input.generationId, sessionId: input.sessionId },
    throwOnError: true,
  } satisfies Options<GetData, true>);
  return data;
}

/** 아직 발급되지 않은 세션의 출석 코드를 발급합니다. */
export async function issueAttendanceCode(
  input: AttendanceCodeInput,
): Promise<AttendanceCodeResponse> {
  const { data } = await start({
    path: { generationId: input.generationId, sessionId: input.sessionId },
    throwOnError: true,
  } satisfies Options<StartData, true>);
  return data;
}

/** 현재 세션의 출석 코드를 재발급합니다. */
export async function reissueAttendanceCode(
  input: AttendanceCodeInput,
): Promise<AttendanceCodeResponse> {
  const { data } = await reissue({
    path: { generationId: input.generationId, sessionId: input.sessionId },
    throwOnError: true,
  } satisfies Options<ReissueData, true>);
  return data;
}

export const createAttendanceCode = issueAttendanceCode;
