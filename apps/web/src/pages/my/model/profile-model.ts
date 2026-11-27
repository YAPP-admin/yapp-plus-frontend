/** 마이페이지가 생성 프로필 응답을 화면 문구와 직군별 캐릭터 경로로 변환합니다. */
import type { UserProfileResponse } from '@yapp-plus/api/generated';

const membershipStatusLabel = {
  PLAYER: '활동회원',
  OB: 'OB',
  COMPLETED_MEMBER: '수료회원',
  DEFERRED: '유예 회원',
  STAFF: '운영진',
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

const positionProfileImage = {
  PM: '/images/my/profile-pm.svg',
  DESIGN: '/images/my/profile-design.svg',
  WEB: '/images/my/profile-web.svg',
  MOBILE: '/images/my/profile-mobile.svg',
  ANDROID: '/images/my/profile-mobile.svg',
  IOS: '/images/my/profile-mobile.svg',
  SERVER: '/images/my/profile-server.svg',
  AI_NATIVE: '/images/my/profile-ai-native.svg',
} satisfies Record<NonNullable<UserProfileResponse['position']>, string>;

/** 서버가 선택한 소속을 표시하며, 직군이 없으면 기본 캐릭터를 사용합니다. */
export function toProfileDisplay(profile: UserProfileResponse) {
  return {
    name: profile.name,
    membershipStatus:
      profile.membershipStatus === null ? '—' : membershipStatusLabel[profile.membershipStatus],
    generation: profile.generationNumber === null ? '—' : `${profile.generationNumber}기`,
    position: profile.position === null ? '—' : positionLabel[profile.position],
    profileImageSrc:
      profile.position === null
        ? '/images/my/user-profile.svg'
        : positionProfileImage[profile.position],
  };
}
