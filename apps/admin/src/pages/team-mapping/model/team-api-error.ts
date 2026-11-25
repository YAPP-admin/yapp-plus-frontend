/** 팀 매핑 API 오류를 상태 코드·SDK 오류 코드 기준의 화면 문구로 변환한다. */
import { ApiError } from '@yapp-plus/api';
import { zErrorResponse } from '@yapp-plus/api/generated';

export type TeamApiOperation = 'list' | 'detail' | 'save' | 'delete';

type TeamApiFailure = {
  code?: string;
  message?: string;
  status?: number;
};

export function toTeamApiFailure(error: unknown): TeamApiFailure {
  if (!(error instanceof ApiError)) {
    return {};
  }

  const parsed = zErrorResponse.safeParse(error.body);
  return {
    code: parsed.success ? parsed.data.code : undefined,
    message: parsed.success ? (parsed.data.message ?? undefined) : undefined,
    status: error.status,
  };
}

export function getTeamApiErrorMessage(error: unknown, operation: TeamApiOperation): string {
  const failure = toTeamApiFailure(error);

  if (failure.status === 401) {
    return '로그인이 만료되었어요. 다시 로그인해 주세요.';
  }
  if (failure.status === 403) {
    return '팀 매핑을 관리할 권한이 없어요.';
  }
  if (failure.status === 404) {
    return '대상이 변경되었어요. 최신 데이터를 다시 확인해 주세요.';
  }
  if (failure.code === 'TEAM_NAME_CONFLICT') {
    return '같은 이름의 팀이 이미 있어요.';
  }
  if (failure.code === 'TEAM_VERSION_CONFLICT') {
    return '다른 운영진이 먼저 수정했어요. 최신 데이터를 확인한 뒤 다시 시도해 주세요.';
  }
  if (failure.code === 'TEAM_ASSIGNMENT_STALE') {
    return '회원의 소속이 변경되었어요. 최신 회원 목록을 확인한 뒤 다시 시도해 주세요.';
  }
  if (failure.code === 'TEAM_MEMBER_INELIGIBLE') {
    return '선택한 회원을 현재 팀에 배정할 수 없어요.';
  }
  if (failure.status === 400) {
    return failure.message ?? '입력값을 확인해 주세요.';
  }
  if (operation === 'delete') {
    return '팀을 삭제하지 못했어요. 다시 시도해 주세요.';
  }
  if (operation === 'detail') {
    return '팀 상세를 불러오지 못했어요. 다시 시도해 주세요.';
  }
  if (operation === 'save') {
    return '팀 정보를 저장하지 못했어요. 다시 시도해 주세요.';
  }
  return '팀 목록을 불러오지 못했어요. 다시 시도해 주세요.';
}
