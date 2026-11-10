/** 회원 웹의 마이페이지가 개발·테스트에서 같은 프로필 응답을 사용하게 합니다. */
import type { UserProfileResponse } from '@yapp-plus/api/generated';
import { createMswHandlers } from '@yapp-plus/api/generated/msw';
import { HttpResponse } from 'msw';

export const profileFixture = {
  userId: 1,
  name: '테스트 회원',
  membershipStatus: 'PLAYER',
  generationId: 28,
  generationNumber: 28,
  position: 'WEB',
} satisfies UserProfileResponse;

/** 생성 handler를 이용해 본인 프로필 경로를 명세와 같은 base URL에 연결합니다. */
export function createMemberProfileHandlers(baseUrl: string) {
  const { pick } = createMswHandlers({ baseUrl });
  return [pick.find2(() => HttpResponse.json(profileFixture))];
}
