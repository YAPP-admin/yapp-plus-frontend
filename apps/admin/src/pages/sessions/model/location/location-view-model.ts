/** 화면과 폼에서 사용하는 장소 모델입니다. 공급자의 축약 필드와 좌표 배열 순서를 노출하지 않습니다. */
export type AddressLookupReference = {
  administrativeAreaCode: string;
  roadNameManagementNumber: string;
  isUnderground: boolean;
  buildingMainNumber: string;
  buildingSubNumber: string;
  buildingManagementNumber: string;
};

export type AddressSearchItemViewModel = {
  roadAddress: string;
  lookupReference: AddressLookupReference;
};

export type AddressSearchViewModel = {
  items: AddressSearchItemViewModel[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

/** 경위도 배열의 축 순서 혼동을 방지하는 최종 좌표 모델입니다. */
export type CoordinatesViewModel = {
  latitude: number;
  longitude: number;
};

/** 좌표 조회의 식별자를 모두 포함해 같은 주소 재선택으로 부모 초안을 초기화하지 않습니다. */
export function addressIdentity(item: AddressSearchItemViewModel): string {
  const ref = item.lookupReference;
  return JSON.stringify([
    item.roadAddress,
    ref.administrativeAreaCode,
    ref.roadNameManagementNumber,
    ref.isUnderground,
    ref.buildingMainNumber,
    ref.buildingSubNumber,
    ref.buildingManagementNumber,
  ]);
}
