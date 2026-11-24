/** 가입 심사 API의 상태·입력값을 화면에서 안전하게 다루는 모델 경계입니다. */
import { ApiError } from '@yapp-plus/api';
import { zErrorResponse } from '@yapp-plus/api/generated';
import type { ApproveMemberRequest } from '@yapp-plus/api/generated';

export const approvalTypeOptions = ['ROSTER', 'MANUAL'] as const;
export type ApprovalType = (typeof approvalTypeOptions)[number];

export const approvalRoleOptions = [
  'PLAYER',
  'OB',
  'COMPLETED_MEMBER',
  'DEFERRED',
] as const satisfies readonly ApproveMemberRequest['role'][];
export type ApprovalRole = (typeof approvalRoleOptions)[number];

export const approvalPositionOptions = [
  'PM',
  'DESIGN',
  'ANDROID',
  'IOS',
  'WEB',
  'MOBILE',
  'SERVER',
  'AI_NATIVE',
] as const satisfies readonly NonNullable<ApproveMemberRequest['position']>[];
export type ApprovalPosition = (typeof approvalPositionOptions)[number];

export const approvalRoleLabels: Record<ApprovalRole, string> = {
  PLAYER: 'PLAYER',
  OB: 'OB',
  COMPLETED_MEMBER: 'COMPLETED_MEMBER',
  DEFERRED: 'DEFERRED',
};

export const approvalPositionLabels: Record<ApprovalPosition, string> = {
  PM: 'PM',
  DESIGN: 'DESIGN',
  ANDROID: 'ANDROID',
  IOS: 'IOS',
  WEB: 'WEB',
  MOBILE: 'MOBILE',
  SERVER: 'SERVER',
  AI_NATIVE: 'AI_NATIVE',
};

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatMembershipReviewDate(value: string) {
  return dateFormatter.format(new Date(value)).replaceAll(' ', '').replace(/\.$/, '');
}

export function parseGenerationId(value: string): number | undefined {
  const generationId = Number(value);
  return Number.isInteger(generationId) && generationId > 0 ? generationId : undefined;
}

export type MembershipReviewFailure = {
  code: string;
  status?: number;
};

/** 원본 오류 본문을 노출하지 않고 가입 심사 화면이 사용할 코드만 추출합니다. */
export function toMembershipReviewFailure(error: unknown): MembershipReviewFailure {
  if (error instanceof ApiError) {
    const body = zErrorResponse.safeParse(error.body);
    return {
      code: body.success ? body.data.code : `HTTP_${error.status}`,
      status: error.status,
    };
  }

  return { code: 'UNKNOWN' };
}

export function getMembershipReviewErrorMessage(
  error: unknown,
  operation: 'list' | 'detail' | 'save',
) {
  const failure = toMembershipReviewFailure(error);

  if (failure.status === 401) {
    return '로그인이 만료되었어요. 다시 로그인해 주세요.';
  }

  if (operation === 'list' && failure.status === 500) {
    return '가입 심사 목록을 불러오지 못했어요. 다시 시도해 주세요.';
  }

  if (operation === 'detail' && failure.status === 404) {
    return '해당 가입 신청을 찾을 수 없어요. 목록을 새로고침해 주세요.';
  }

  if (failure.status === 409 || failure.code === 'MEMBER_CONFLICT') {
    return '다른 운영진이 먼저 처리한 가입 신청이에요. 목록을 새로고침해 주세요.';
  }

  if (failure.status === 400 || failure.code === 'INVALID_MEMBER_REQUEST') {
    return '입력값을 확인해 주세요.';
  }

  if (operation === 'detail') {
    return '가입 신청 상세를 불러오지 못했어요. 다시 시도해 주세요.';
  }

  if (operation === 'save') {
    return '가입 심사를 처리하지 못했어요. 다시 시도해 주세요.';
  }

  return '가입 심사 목록을 불러오지 못했어요. 다시 시도해 주세요.';
}
