# 외부 장소 조회와 지도 경계

## 환경 변수

| 변수                    | 용도                 |
| ----------------------- | -------------------- |
| `VITE_JUSO_SEARCH_KEY`  | 주소 검색 승인키     |
| `VITE_JUSO_COORD_KEY`   | 좌표 조회 승인키     |
| `VITE_KAKAO_MAP_JS_KEY` | 카카오 JavaScript 키 |

각 기능 진입 시 필요한 값의 존재를 검증한다. 장소 설정 누락으로 팀 세션이나 전체 앱 기동을 차단하지 않는다.
브라우저에 전달되는 공개 설정이다. 서버 비밀 키를 넣지 않으며 값·요청 URL은 문서·로그·스크린샷에 남기지 않는다.

## 주소 검색

HTTPS `https://business.juso.go.kr/addrlink/addrLinkApiJsonp.do`를 고정 대상으로 사용한다.
`confmKey`, `currentPage`, `countPerPage=10`, `keyword`, `resultType=json`을 전달한다.
`results.common`의 업무 성공 여부와 전체 수, `results.juso` 배열을 검증한 뒤 화면 모델로 변환한다.
페이지는 양의 정수이며 전체 수로 이전·다음 가능 여부를 계산한다. 응답 숫자 문자열은 빈 문자열·비정수·음수를 거부한다.
도로명주소와 좌표 조회 식별 정보가 없는 결과는 선택 가능한 정상 결과로 취급하지 않는다.

## 좌표 조회

HTTPS `https://business.juso.go.kr/addrlink/addrCoordApiJsonp.do`에 별도 키와 선택 결과의
`admCd`, `rnMgtSn`, `udrtYn`, `buldMnnm`, `buldSlno`, `resultType=json`을 전달한다.
반환된 `bdMgtSn` 등 식별 정보를 선택 결과와 대조하고 대응되는 단일 좌표만 사용한다.
응답 부재·여러 후보의 모호함·식별 불일치·`entX`/`entY` 비정상 값은 오류다.

## JSONP 수명과 검증

2-5에서 주소 검색은 `callback` 쿼리 파라미터로 지정한 함수에 객체를 전달함을 실제 브라우저에서 확인했다.
응답 Content-Type은 `text/xml;charset=utf-8`이었지만 본문은 지정 콜백 호출이었다.
좌표 API의 콜백 방식·응답 포장은 승인키 발급 후 별도로 확인하며 주소 검색과 같다고 가정하지 않는다.
확인한 계약에 맞춰 요청별 식별·10초 타임아웃·스크립트/리스너/타이머 정리를 구현한다.
전역 콜백을 사용해야 한다면 요청별 고유 이름과 만료 후 안전한 처리를 검증한다.
공식 응답이 고정 콜백·문자열 포장이라면 그 방식에 맞춰 안전하게 파싱하며 `eval`을 사용하지 않는다.
전송 취소와 별개로 요청 번호·폼 수명·주소 일치 검증으로 늦은 응답을 무시한다.
네트워크, 시간 초과, 서비스 오류, 응답 검증, 좌표 변환, 설정 누락을 내부 오류 종류로 구분한다.

## 지도

좌표 입력은 `{ latitude, longitude }`, 카카오 컴포넌트 경계에서는 `{ lat, lng }`로 명시 변환한다.
지도 클릭과 마커 드래그 완료는 최종 좌표 변경 이벤트만 전달한다. 지도 중심 변경은 좌표 변경 이벤트가 아니다.
카카오 장소 검색·지오코딩·역지오코딩 services 라이브러리는 로딩하지 않는다.
모의 세션 저장과 외부 지도 SDK의 초기화 모두 브라우저에서만 수행한다.

## DTO → ViewModel 변환 경계

흐름은 `외부 응답(unknown) → DTO 검증 → 명시적 매핑 → ViewModel → 폼·화면`이다.
`juso-search.ts`는 `AddressSearchViewModel`을, 좌표 조회 모듈은 `CoordinatesViewModel`을 반환한다.
UI·폼·Query 캐시는 DTO를 import하거나 `results.common`, `results.juso`, `entX` 등을 직접 읽지 않는다.
모델 정의는 `model/location/location-view-model.ts`에 둔다. 범용 mapper 계층이나 공용 패키지를 추가하지 않는다.

| 원본 필드                   | 프론트엔드 필드            | 변환                                   |
| --------------------------- | -------------------------- | -------------------------------------- |
| `roadAddr`                  | `roadAddress`              | 검증한 도로명주소                      |
| `admCd`                     | `administrativeAreaCode`   | 문자열 유지                            |
| `rnMgtSn`                   | `roadNameManagementNumber` | 문자열 유지                            |
| `udrtYn`                    | `isUnderground`            | 허용 코드 `0`/`1` 검증 후 boolean 변환 |
| `buldMnnm`                  | `buildingMainNumber`       | 문자열 유지                            |
| `buldSlno`                  | `buildingSubNumber`        | 문자열 유지                            |
| `bdMgtSn`                   | `buildingManagementNumber` | 문자열 유지                            |
| `results.juso`              | `items`                    | 검증된 항목만 명시적으로 구성          |
| `results.common.totalCount` | `totalCount`               | 비음수 정수로 검증·변환                |
| `entX`, `entY`              | `longitude`, `latitude`    | 투영 변환 후 이름 있는 좌표 객체 구성  |

좌표 요청을 만들 때만 `lookupReference`를 공공 API 파라미터명으로 역매핑한다.
`isUnderground`는 `0`/`1`로 직렬화한다. 응답 식별자 대조도 연동 모듈 안에서 끝낸다.
외부 오류 코드는 내부 오류 종류로 변환하고, UI는 그 종류에 맞는 한국어 안내를 제공한다.
mapper 테스트는 축약 필드가 ViewModel에 남지 않음, 코드의 앞자리 0 보존, 잘못된 지하 코드 거부,
숫자 문자열 검증, 페이지 경계와 경위도 순서를 확인한다. 실제 응답 필드 계약은 2-5에서 대조한다.
