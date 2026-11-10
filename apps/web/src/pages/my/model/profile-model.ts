/** 마이페이지가 생성 프로필 응답을 화면 문구로만 변환합니다. */
import type { UserProfileResponse } from '@yapp-plus/api/generated';

const membershipStatusLabel = {
  PLAYER: '활동회원',
  OB: 'OB',
  COMPLETED_MEMBER: '수료회원',
  DEFERRED: '유예 회원',
} satisfies Record<NonNullable<UserProfileResponse['membershipStatus']>, string>;

const positionLabel = {
  PM: 'PM',
  DESIGN: 'Design',
  WEB: 'Web',
  MOBILE: 'Mobile',
  ANDROID: 'Android',
  IOS: 'iOS',
  SERVER: 'Server',
  AI_NATIVE: 'AI Native',
} satisfies Record<NonNullable<UserProfileResponse['position']>, string>;

/** 서버가 선택한 소속을 화면에 표시하며, 누락한 소속을 추정하지 않습니다. */
export function toProfileDisplay(profile: UserProfileResponse) {
  return {
    name: profile.name,
    membershipStatus:
      profile.membershipStatus === null ? '—' : membershipStatusLabel[profile.membershipStatus],
    generation: profile.generationNumber === null ? '—' : `${profile.generationNumber}기`,
    position: profile.position === null ? '—' : positionLabel[profile.position],
  };
}
