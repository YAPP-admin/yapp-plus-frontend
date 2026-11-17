/** 주소 선택 이벤트에서 실행하는 좌표 조회 작업의 Mutation 계약입니다. */
import { mutationOptions } from '@tanstack/react-query';
import { lookupCoordinates } from './coordinates';
import { getCoordinatesKey } from './location-config';
import type { AddressLookupReference } from './location-view-model';

/** 승인키를 요청 경계에서 읽고 선택한 주소의 성공 좌표만 반환합니다. */
export async function lookupAddressCoordinates(reference: AddressLookupReference) {
  const key = getCoordinatesKey();
  if (!key) {
    throw new Error('좌표 조회 설정이 준비되지 않았습니다.');
  }
  const result = await lookupCoordinates(reference, key);
  if (result.status !== 'success') {
    throw new Error('좌표를 조회하지 못했습니다.');
  }
  return result.data;
}

export const coordinatesMutationOptions = mutationOptions({
  mutationKey: ['admin', 'location-coordinates'],
  mutationFn: lookupAddressCoordinates,
});
