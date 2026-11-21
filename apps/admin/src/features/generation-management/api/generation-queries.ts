/** 관리자 기수 목록의 Query key와 조회 수명을 정의합니다. */
import { queryOptions } from '@tanstack/react-query';
import { listGenerations } from './generation-api';

const generationsKey = ['admin', 'generations'] as const;

/** 관리자 기수 목록을 식별하는 Query key입니다. */
export function generationsQueryKey() {
  return generationsKey;
}

/** 관리자 기수 목록 조회를 재사용하는 TanStack Query 옵션입니다. */
export function generationsQueryOptions() {
  return queryOptions({
    queryKey: generationsQueryKey(),
    queryFn: ({ signal }) => listGenerations(signal),
  });
}
