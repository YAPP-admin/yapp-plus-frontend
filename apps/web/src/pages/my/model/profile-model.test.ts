import { describe, expect, it } from 'vitest';
import type { UserProfileResponse } from '@yapp-plus/api/generated';
import { toProfileDisplay } from './profile-model';

const profile = {
  userId: 1,
  name: '테스트 회원',
  membershipStatus: 'PLAYER',
  generationId: 28,
  generationNumber: 28,
  position: 'WEB',
} satisfies UserProfileResponse;

describe('toProfileDisplay', () => {
  it.each([
    ['PLAYER', '활동회원'],
    ['OB', 'OB'],
    ['COMPLETED_MEMBER', '수료회원'],
    ['DEFERRED', '유예 회원'],
  ] as const)('회원 상태 %s를 %s로 표시한다', (membershipStatus, expected) => {
    expect(toProfileDisplay({ ...profile, membershipStatus }).membershipStatus).toBe(expected);
  });

  it.each([
    ['PM', 'PM'],
    ['DESIGN', 'Design'],
    ['WEB', 'Web'],
    ['MOBILE', 'Mobile'],
    ['ANDROID', 'Android'],
    ['IOS', 'iOS'],
    ['SERVER', 'Server'],
    ['AI_NATIVE', 'AI Native'],
  ] as const)('직군 %s를 %s로 표시한다', (position, expected) => {
    expect(toProfileDisplay({ ...profile, position }).position).toBe(expected);
  });

  it('소속이 없으면 이름 외 항목만 —로 표시한다', () => {
    expect(
      toProfileDisplay({
        ...profile,
        membershipStatus: null,
        generationId: null,
        generationNumber: null,
        position: null,
      }),
    ).toEqual({ name: '테스트 회원', membershipStatus: '—', generation: '—', position: '—' });
  });
});
