/** 회원관리 API 오류를 화면에서 사용할 수 있는 공개 메시지로 변환합니다. */
import { ApiError } from '@yapp-plus/api';
import { zErrorResponse } from '@yapp-plus/api/generated';

export type MemberApiOperation = 'list' | 'team' | 'detail' | 'save';

type MemberApiFailure = {
  code?: string;
  status?: number;
};

export function toMemberApiFailure(error: unknown): MemberApiFailure {
  if (error instanceof ApiError) {
    const body = zErrorResponse.safeParse(error.body);
    return {
      code: body.success ? body.data.code : undefined,
      status: error.status,
    };
  }
  return {};
}

export function getMemberApiErrorMessage(error: unknown, operation: MemberApiOperation) {
  const failure = toMemberApiFailure(error);

  if (failure.status === 401) {
    return '로그인이 만료되었어요. 다시 로그인해 주세요.';
  }
  if (operation === 'detail' && failure.status === 404) {
    return '해당 회원을 찾을 수 없어요. 목록을 새로고침해 주세요.';
  }
  if (
    operation === 'save' &&
    (failure.status === 409 || failure.code === 'MEMBER_UPDATE_CONFLICT')
  ) {
    return '다른 운영진이 먼저 수정했어요. 최신 정보를 확인한 뒤 다시 시도해 주세요.';
  }
  if (operation === 'save' && failure.code === 'MEMBER_UPDATE_INELIGIBLE') {
    return '현재 상태의 회원은 수정할 수 없어요.';
  }
  if (failure.status === 400) {
    return '입력값을 확인해 주세요.';
  }
  if (operation === 'team') {
    return '팀 목록을 불러오지 못했어요. 다시 시도해 주세요.';
  }
  if (operation === 'detail') {
    return '회원 상세를 불러오지 못했어요. 다시 시도해 주세요.';
  }
  if (operation === 'save') {
    return '회원 정보를 저장하지 못했어요. 다시 시도해 주세요.';
  }
  return '회원 목록을 불러오지 못했어요. 다시 시도해 주세요.';
}

export const memberPositionLabels = {
  PM: 'PM',
  DESIGN: '디자인',
  ANDROID: 'Android',
  IOS: 'iOS',
  WEB: 'Web',
  MOBILE: 'Mobile',
  SERVER: 'Server',
  AI_NATIVE: 'AI Native',
} as const;

export const memberStatusLabels = {
  PLAYER: '활동회원',
  OB: 'OB',
  COMPLETED_MEMBER: '수료회원',
  DEFERRED: '유예회원',
  WITHDRAWN: '탈퇴회원',
} as const;

export const memberStatusOptions = [
  'PLAYER',
  'OB',
  'COMPLETED_MEMBER',
  'DEFERRED',
  'WITHDRAWN',
] as const;

export const memberPositionOptions = [
  'PM',
  'DESIGN',
  'ANDROID',
  'IOS',
  'WEB',
  'MOBILE',
  'SERVER',
  'AI_NATIVE',
] as const;

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatMemberDate(value: string) {
  return dateFormatter.format(new Date(value)).replaceAll(' ', '').replace(/\.$/, '');
}
