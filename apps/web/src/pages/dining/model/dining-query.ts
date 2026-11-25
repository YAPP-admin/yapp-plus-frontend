/** 생성 API의 조회·인증 경계를 연결하고 화면에 필요한 응답 필드를 검증합니다. */
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  detail4Options,
  zAppAfterpartyDetailResponse,
  zAppAfterpartyListItemResponse,
  zAppAfterpartyPageResponse,
} from '@yapp-plus/api/generated';
import { useNativeAuthSession } from '@/features/auth';
import { useRefetchOnScreenReturn } from '@/shared/lib/screen-activity';

const DINING_ID = zAppAfterpartyDetailResponse.shape.afterpartyId
  .unwrap()
  .refine((id) => id > 0 && Number.isSafeInteger(Number(id)), '유효한 회식 ID가 필요합니다.')
  .transform(Number);
/** 목록의 필수 표시값만 보강하며 응답 수와 상태는 서버 값을 사용합니다. */
export const diningListSchema = zAppAfterpartyPageResponse.extend({
  items: zAppAfterpartyListItemResponse
    .required({ title: true, startsAt: true, deadline: true, respondedCount: true, state: true })
    .extend({ afterpartyId: DINING_ID })
    .array(),
});
const DINING_DETAIL_SCHEMA = zAppAfterpartyDetailResponse
  .required({
    title: true,
    content: true,
    startsAt: true,
    deadline: true,
    state: true,
    response: true,
  })
  .extend({ afterpartyId: DINING_ID });

/** 기존 회원 웹과 동일하게 로그인 세션 또는 명시적인 개발 API 모킹에서만 조회합니다. */
export function useDiningAccess() {
  const { phase, apiOptions } = useNativeAuthSession();
  return {
    apiOptions,
    canQuery:
      phase === 'SIGNED_IN' ||
      (phase === 'BROWSER' && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true'),
  };
}

/** 접근 조건을 통과한 상세·신청 화면이 같은 서버 원본을 Suspense로 조회합니다. */
export function useDiningDetail(diningId: string) {
  const { apiOptions } = useDiningAccess();
  const query = useSuspenseQuery({
    ...detail4Options({ ...apiOptions, path: { afterpartyId: Number(diningId) } }),
    select: (data) => DINING_DETAIL_SCHEMA.parse(data),
  });
  useRefetchOnScreenReturn(query);
  if (query.error && !query.isFetching) {
    throw query.error instanceof Error
      ? query.error
      : new Error('회식 정보를 불러오지 못했어요.', { cause: query.error });
  }
  return query;
}
