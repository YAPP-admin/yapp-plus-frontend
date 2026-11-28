/** 사전 명단의 생성 SDK 옵션에 응답 검증과 커서 탐색 정책을 연결합니다. */
import {
  list8InfiniteOptions,
  zGenerationRosterListResponse,
  type GenerationRosterListResponse,
} from '@yapp-plus/api/generated';

/** 기수별 캐시를 사용하며 마지막 페이지의 null 커서에서 조회를 종료합니다. */
export function rosterQueryOptions(generationId: number) {
  const generated = list8InfiniteOptions({
    path: { generationId },
    responseValidator: (value) => {
      if (!zGenerationRosterListResponse.safeParse(value).success) {
        return Promise.reject(new Error('업로드 명단 응답이 올바르지 않습니다.'));
      }
      return Promise.resolve();
    },
  });
  return {
    ...generated,
    // 생성 타입의 skipToken을 제외해 Suspense의 함수 queryFn 계약을 충족합니다.
    queryFn: typeof generated.queryFn === 'function' ? generated.queryFn : undefined,
    initialPageParam: { path: { generationId } },
    getNextPageParam: (lastPage: GenerationRosterListResponse) => lastPage.nextCursor ?? undefined,
  };
}
