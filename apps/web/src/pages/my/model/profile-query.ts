/** 생성한 프로필 조회에 화면 전용 입력 검증을 더합니다. */
import { find2Options, zUserProfileResponse } from '@yapp-plus/api/generated';

const profileSchema = zUserProfileResponse.extend({
  userId: zUserProfileResponse.shape.userId.refine(
    (id) => Number.isSafeInteger(Number(id)),
    '정밀도를 보장할 수 없는 회원 ID입니다.',
  ),
  generationId: zUserProfileResponse.shape.generationId.refine(
    (id) => id === null || Number.isSafeInteger(Number(id)),
    '정밀도를 보장할 수 없는 기수 ID입니다.',
  ),
});

/** 생성 요청·key·AbortSignal을 유지하며, 성공 캐시에 저장하기 전에 응답을 검증합니다. */
export function profileQueryOptions(options?: Parameters<typeof find2Options>[0]) {
  return find2Options({
    ...options,
    responseValidator: (value) => profileSchema.parseAsync(value),
  });
}
