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
