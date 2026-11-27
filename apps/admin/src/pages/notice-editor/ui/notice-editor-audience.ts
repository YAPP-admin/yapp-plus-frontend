/** 제출 공지의 폼 대상을 생성 SDK의 audience 요청으로 변환한다. */
import type { PostAudienceRequest } from '@yapp-plus/api/generated';
import type { NoticeFormContent } from '~/features/notice-management';

const apiPositionByJob = {
  PM: 'PM',
  Design: 'DESIGN',
  Mobile: 'MOBILE',
  Web: 'WEB',
  Server: 'SERVER',
  'AI Native': 'AI_NATIVE',
} as const;

const ALL_SUBMISSION_JOBS = ['PM', 'Design', 'Mobile', 'Web', 'Server', 'AI Native'] as const;

/** 활동회원 전체와 모든 직군 선택을 같은 SDK 대상 계약으로 정규화한다. */
export function getAudience(content: NoticeFormContent): PostAudienceRequest {
  if (content.category === 'submission') {
    const allJobsSelected =
      Array.isArray(content.audience) &&
      content.audience.length === ALL_SUBMISSION_JOBS.length &&
      ALL_SUBMISSION_JOBS.every((job) => content.audience.includes(job));

    if (content.audience === 'all' || allJobsSelected) {
      return { type: 'GROUP', target: 'PLAYER' };
    }
    return {
      type: 'POSITION',
      positions: content.audience.map((job) => apiPositionByJob[job]),
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
