/** 관리자 기수 목록의 Query key와 조회 방법을 정의합니다. */
import { queryOptions } from '@tanstack/react-query';
import { listGenerations } from './generation-api';

/** 관리자 기수 목록 조회를 재사용하는 TanStack Query 옵션입니다. */
export const generationsQueryOptions = queryOptions({
  /** 관리자 기수 목록 캐시를 식별합니다. */
  queryKey: ['admin', 'generations'] as const,
  /** TanStack Query가 조회할 때 관리자 기수 API adapter를 실행합니다. */
  queryFn: ({ signal }) => listGenerations(signal),
});
