/** 과제의 전체·개별 직군과 일반 공지의 회원 구분을 SDK 요청으로 변환하는지 검증한다. */
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

it('활동회원 전체는 실제 포지션 8개를 명시한다', () => {
  expect(getAudience(submissionContent)).toEqual({
    type: 'POSITION',
    positions: ['PM', 'DESIGN', 'ANDROID', 'IOS', 'WEB', 'MOBILE', 'SERVER', 'AI_NATIVE'],
  });
});

it.each<{
  audience: Exclude<Extract<NoticeFormContent, { category: 'submission' }>['audience'], 'all'>;
  positions: string[];
}>([
  { audience: ['Web'], positions: ['WEB'] },
  { audience: ['Web', 'Design'], positions: ['WEB', 'DESIGN'] },
  { audience: ['Mobile'], positions: ['MOBILE'] },
  {
    audience: ['PM', 'Design', 'Mobile', 'Web', 'Server', 'AI Native'],
    positions: ['PM', 'DESIGN', 'MOBILE', 'WEB', 'SERVER', 'AI_NATIVE'],
  },
])('개별 선택 $audience → 선택한 포지션만 전송한다', ({ audience, positions }) => {
  expect(getAudience({ ...submissionContent, audience })).toEqual({
    type: 'POSITION',
    positions,
  });
});

it.each(['session', 'operation'] as const)('일반 공지 %s는 회원 구분을 유지한다', (category) => {
  for (const [audience, target] of [
    ['all', 'ALL_USERS'],
    ['active', 'PLAYER'],
    ['regular', 'OB'],
    ['completed', 'COMPLETED_MEMBER'],
  ] as const) {
    expect(getAudience({ title: '일반 공지', category, audience })).toEqual({
      type: 'GROUP',
      target,
    });
  }
});
