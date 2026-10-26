/** 주소 검색 조건을 Query 옵션으로 변환하고 승인키 접근을 화면에서 숨깁니다. */
import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getAddressSearchKey } from './location-config';
import { searchAddresses } from './juso-search';

export type AddressSearchConditions = { keyword: string; page: number };

export function isAddressSearchAvailable(): boolean {
  return getAddressSearchKey() !== null;
}

export function addressSearchQueryOptions(conditions: AddressSearchConditions) {
  return queryOptions({
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 0,
    queryKey: ['admin', 'address-search', conditions.keyword, conditions.page],
    enabled: conditions.keyword.length > 0 && isAddressSearchAvailable(),
    queryFn: () => {
      const approvalKey = getAddressSearchKey();
      if (!conditions.keyword || !approvalKey) {
        throw new Error('주소 검색 조건이 준비되지 않았습니다.');
      }
      return searchAddresses({ ...conditions, approvalKey });
    },
  });
}
