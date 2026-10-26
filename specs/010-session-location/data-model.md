# 데이터 모델

이 문서는 admin 내부 설계이며 실제 서버 OpenAPI 계약을 대체하지 않는다.

## 세션 입력

기존 이름·날짜·시작/종료 시간은 유지한다. `type`을 판별자로 하는 두 구조를 Zod로 검증한다.

| 유형      | 장소 필드                                                                                   | 검증                                                                      |
| --------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `offline` | `location.roadAddress`, `location.detailAddress`, `location.latitude`, `location.longitude` | 주소 trim 후 필수, 상세주소 trim 후 빈 문자열 허용, 좌표 유한값·범위 검증 |
| `team`    | `location.guide`                                                                            | trim 후 빈 문자열 허용                                                    |

저장 입력에는 반대 유형 필드를 포함하지 않는다. `latitude`·`longitude`는 숫자이고 빈 입력을 0으로 강제 변환하지 않는다.
ID와 집계는 생성 입력에서 받지 않으며, 수정은 별도 ID로 대상을 찾고 기존 ID·집계를 보존한다.

## 편집 전용 상태

- 선택 주소 식별자는 아래 `AddressLookupReference`를 사용한다. 공공 API의 축약 필드 이름을 폼 상태에 보관하지 않는다.
- 검색어 입력, 제출한 검색어, 페이지, 결과, 요청 번호는 저장하지 않는다.
- `initialPosition`과 최종 위치는 구분한다. 초기 위치는 새 주소 조회 성공값 또는 수정 시 복원한 저장값이다.
- 좌표는 숫자 쌍으로 유지한다. 폼의 최종 좌표를 지도에 전달하며 좌표 문자열 입력 상태는 만들지 않는다.
- 오프라인·팀 초안은 같은 폼 수명 동안만 보존한다. 취소하면 모두 폐기한다.
- 상세주소 수정은 좌표 조회 응답으로 덮어쓰지 않는다.

## 저장 경계

Juso 식별자는 조회를 위한 편집 상태이며 필수 저장 필드로 만들지 않는다. 수정은 저장 좌표로 바로 열고 주소 변경 시에만 검색한다.
mock 저장소는 입력과 반환값의 중첩 location·집계를 복사해 외부 참조 수정이 내부 저장을 바꾸지 않게 한다.
알 수 없는 수정 ID는 오류다. fixture는 명시적인 테스트용 주소·좌표로 전환하며 실제 조회 성공으로 간주하지 않는다.
좌표의 한국 범위 제한이나 기존 문자열을 임의 지오코딩하는 마이그레이션은 추가하지 않는다.

## 프론트엔드 ViewModel

공공 API 응답 DTO와 화면 모델을 분리한다. DTO 스키마·원본 필드명은 Juso 연동 모듈 내부에서만 사용한다.
외부 응답을 검증한 뒤 명시적으로 ViewModel을 구성하며 응답 객체를 spread하거나 `raw` 필드로 전달하지 않는다.

```ts
type AddressLookupReference = {
  administrativeAreaCode: string;
  roadNameManagementNumber: string;
  isUnderground: boolean;
  buildingMainNumber: string;
  buildingSubNumber: string;
  buildingManagementNumber: string;
};

type AddressSearchItemViewModel = {
  roadAddress: string;
  lookupReference: AddressLookupReference;
};

type AddressSearchViewModel = {
  items: AddressSearchItemViewModel[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type CoordinatesViewModel = {
  latitude: number;
  longitude: number;
};
```

`lookupReference`는 좌표 조회에 다시 전달할 의미 있는 식별 정보다. UI는 이 값의 공급자별 직렬화 방식을 알지 않는다.
번호·코드는 문자열로 유지해 앞자리 0을 보존한다. 지하 여부는 검증된 코드만 boolean으로 변환한다.
페이지 정보는 검증된 응답과 해당 요청의 페이지·크기로 구성한다. 비동기 진행·오류 상태는 이 데이터 모델과 별개로 관리한다.
좌표 ViewModel은 투영 좌표가 아닌 변환·범위 검증이 끝난 경위도만 제공한다.
