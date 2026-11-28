/** 제출 공지의 폼 대상을 생성 SDK의 audience 요청으로 변환한다. */
import type { PostAudienceRequest } from '@yapp-plus/api/generated';
import type { NoticeFormContent } from '~/features/notice-management';

const API_POSITION_BY_JOB = {
  PM: 'PM',
  Design: 'DESIGN',
  Mobile: 'MOBILE',
  Web: 'WEB',
  Server: 'SERVER',
  'AI Native': 'AI_NATIVE',
} as const;

// 전체 선택은 화면의 6개 직군과 달리 ANDROID·IOS도 포함한다.
const ALL_SUBMISSION_POSITIONS = [
  'PM',
  'DESIGN',
  'ANDROID',
  'IOS',
  'WEB',
  'MOBILE',
  'SERVER',
  'AI_NATIVE',
] as const satisfies readonly NonNullable<PostAudienceRequest['positions']>[number][];

/** 과제는 전체 또는 선택 직군을 명시하고, 일반 공지는 회원 구분으로 대상을 지정한다. */
export function getAudience(content: NoticeFormContent): PostAudienceRequest {
  if (content.category === 'submission') {
    return {
      type: 'POSITION',
      positions:
        content.audience === 'all'
          ? [...ALL_SUBMISSION_POSITIONS]
          : content.audience.map((job) => API_POSITION_BY_JOB[job]),
    };
  }

  const targetByAudience = {
    all: 'ALL_USERS',
    active: 'PLAYER',
    regular: 'OB',
    completed: 'COMPLETED_MEMBER',
  } as const;

  return { type: 'GROUP', target: targetByAudience[content.audience] };
}
