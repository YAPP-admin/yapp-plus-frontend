/** 선택 주소의 좌표를 조회하며 승인키를 UI와 Query key에 노출하지 않습니다. */
import { queryOptions } from '@tanstack/react-query';
import { lookupCoordinates } from './coordinates';
import { getCoordinatesKey } from './location-config';
import type { AddressLookupReference } from './location-view-model';

/** 환경 설정 누락은 사용자의 재시도로 해결할 수 없습니다. */
export class CoordinatesConfigurationError extends Error {
  constructor() {
    super('좌표 조회 설정이 준비되지 않았습니다. 관리자에게 문의해 주세요.');
    this.name = 'CoordinatesConfigurationError';
  }
}

export function coordinatesQueryOptions(reference: AddressLookupReference | null) {
  return queryOptions({
    staleTime: Infinity,
    gcTime: 0,
    queryKey: ['admin', 'location-coordinates', reference],
    enabled: reference !== null && !import.meta.env.SSR,
    queryFn: async () => {
      const key = getCoordinatesKey();
      if (!reference || !key) {
        throw new CoordinatesConfigurationError();
      }
      const result = await lookupCoordinates(reference, key);
      if (result.status !== 'success') {
        throw new Error('좌표를 조회하지 못했습니다.');
      }
      return result.data;
    },
  });
}
