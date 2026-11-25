/** 제출 공지의 전체 직군 대상을 생성 SDK의 그룹 대상과 동일하게 변환하는지 검증한다. */
import { expect, it } from 'vitest';
import type { NoticeFormContent } from '~/features/notice-management';
import { getAudience } from './notice-editor-audience';

const submissionContent = {
  title: '제출 공지',
  category: 'submission',
  audience: 'all',
  submission: {
    deadlineAt: '2026-11-01T00:00:00.000Z',
    method: { name: '제출 폼', url: 'https://example.com/submit' },
  },
} satisfies NoticeFormContent;

it('활동회원 전체와 모든 직군 선택을 같은 PLAYER 그룹으로 전송한다', () => {
  const allMembers = getAudience(submissionContent);
  const allJobs = getAudience({
    ...submissionContent,
    audience: ['PM', 'Design', 'Mobile', 'Web', 'Server', 'AI Native'],
  });

  expect(allMembers).toEqual({ type: 'GROUP', target: 'PLAYER' });
  expect(allJobs).toEqual(allMembers);
});
