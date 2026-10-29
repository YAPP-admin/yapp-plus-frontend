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

HTTPS `https://business.juso.go.kr/addrlink/addrLinkApi.do`를 고정 대상으로 사용한다.
`confmKey`, `currentPage`, `countPerPage=10`, `keyword`, `resultType=json`을 전달한다.
`results.common`의 업무 성공 여부와 전체 수, `results.juso` 배열을 검증한 뒤 화면 모델로 변환한다.
페이지는 양의 정수이며 전체 수로 이전·다음 가능 여부를 계산한다. 응답 숫자 문자열은 빈 문자열·비정수·음수를 거부한다.
도로명주소와 좌표 조회 식별 정보가 없는 결과는 선택 가능한 정상 결과로 취급하지 않는다.

## 좌표 조회

좌표 endpoint는 HTTPS `https://business.juso.go.kr/addrlink/addrCoordApi.do`다. 별도 키와 선택 결과의
`admCd`, `rnMgtSn`, `udrtYn`, `buldMnnm`, `buldSlno`, `resultType=json`을 전달한다.
검증된 검색 ViewModel의 식별자를 요청에 사용한다. 응답 부가 식별자 대조·건물 번호 정규화는 하지 않는다.
응답 부재·여러 후보·`entX`/`entY` 비정상 값은 오류다. 상세 검증은 아래 3-4 계약을 따른다.

## JSON 요청 수명과 검증

주소 검색은 일반 JSON endpoint의 HTTP 200, `application/json`, `Access-Control-Allow-Origin: *`를
실제 승인키로 확인했다. 행안부 전용 ky 인스턴스로 요청하며 JSONP·iframe·전역 콜백은 사용하지 않는다.
ky의 `timeout`·`totalTimeout` 10초 제한으로 본문 읽기를 포함하며 전송 함수는 선택적 취소 signal을 지원한다.
UI의 별도 AbortController·타이머·요청 번호는 사용하지 않는다. HTTP 오류·네트워크 오류·JSON 파싱 오류를 구분한다.
검색어·페이지와 좌표 조회 조건별 Query key로 늦은 응답을 분리한다. 주소 검색 UI는 취소 signal을 전달하지 않는다.
실제 좌표 JSON·CORS의 기존 검증 기록은 quickstart 3-6에 있으며 배포 환경·이용 조건 확인을 대신하지 않는다.

## 지도

좌표 입력은 `{ latitude, longitude }`, 카카오 컴포넌트 경계에서는 `{ lat, lng }`로 명시 변환한다.
마커 드래그 완료와 초기 위치 복귀만 최종 좌표를 변경한다. 지도 클릭·중심 변경은 좌표를 바꾸지 않는다.
좌표는 읽기 전용으로 표시한다. SDK의 `useKakaoLoader`를 사용하며 별도 스크립트 로더·로더용 Query·10초 지도 제한은 두지 않는다.
카카오 장소 검색·지오코딩·역지오코딩 services 라이브러리는 로딩하지 않는다.
모의 세션 저장과 외부 지도 SDK의 초기화 모두 브라우저에서만 수행한다.

## DTO → ViewModel 변환 경계

흐름은 `외부 응답(unknown) → DTO 검증 → 명시적 매핑 → ViewModel → 폼·화면`이다.
`juso-search.ts`는 성공 시 `AddressSearchViewModel`을 담은 결과를 반환하고, 좌표 조회 모듈은 `CoordinatesViewModel`을 반환한다.
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
`isUnderground`는 `0`/`1`로 직렬화한다. 응답 부가 식별자 대조는 수행하지 않는다.
외부 오류 코드는 내부 오류 종류로 변환하고, UI는 그 종류에 맞는 한국어 안내를 제공한다.
mapper 테스트는 축약 필드가 ViewModel에 남지 않음, 코드의 앞자리 0 보존, 잘못된 지하 코드 거부,
숫자 문자열 검증, 페이지 경계와 경위도 순서를 확인한다. 실제 응답 필드 계약은 2-5에서 대조한다.

### 3-2 전송 구현

`address-request.ts`의 `requestAddressJson`은 확인된 주소 검색 endpoint만 대상으로 한다.
응답을 `unknown`으로 반환하며 공급자 DTO 검증·ViewModel 매핑은 3-3의 호출자가 담당한다.
`resultType=json`을 고정하고 `callback` 파라미터를 제거하며 쿠키를 보내지 않는다.
전송 계층은 ky의 HTTPError·TimeoutError·NetworkError와 JSON 파싱·취소 오류를 그대로 전달한다.
화면 경계에서 오류 타입을 판별해 한국어 안내로 변환하고 취소는 안내하지 않는다.
원본 오류에는 승인키가 포함될 수 있으므로 화면·로그·오류 수집 도구에 그대로 출력하지 않는다.
HTTP 200 응답의 행안부 업무 오류는 3-3에서 별도로 검증한다.
SSR과 이미 취소된 요청은 전송하지 않는다. 좌표 전송은 아래 3-4 계약을 따른다.

### HTTP 클라이언트 분리

admin은 ky를 직접 의존하며 `juso-client.ts`에서 `ky.create()`로 행안부 전용 인스턴스를 한 번 생성한다.
OpenAPI 생성 클라이언트의 인스턴스·인증 헤더·훅을 상속하지 않는다.
행안부 기본 URL, `timeout: 10_000`, `totalTimeout: 10_000`, `retry: 0`, `credentials: 'omit'`을 설정한다.
전체 시간 제한은 본문 읽기를 포함한다. 승인키·검색 조건·취소 signal은 요청마다 전달한다.
주소·좌표 조회는 이 인스턴스를 공유한다. 환경별 키·CORS·이용 조건은 배포 전에 별도로 확인한다.
ky 버전 2.1.0은 pnpm catalog로 통일하고 공용 패키지에서 단순 재노출하지 않는다.

### 3-3 주소 검색 결과

`searchAddresses({ keyword, page, approvalKey }, signal)`은 입력 검증 후 페이지당 10개를 요청한다.
승인키는 호출자가 전달하며 빈 값은 전송 전에 거부한다. 검색어는 앞뒤 공백을 제거한다.
성공은 `{ status: 'success', data: AddressSearchViewModel }`, 업무 실패는
`{ status: 'service-error', code }`로 구분한다. 업무 실패의 외부 메시지는 전달하지 않는다.
별도 전송 오류 클래스는 만들지 않는다. ky 오류·취소는 그대로 전파하고 잘못된 DTO는 Zod 검증 오류로 거부한다.
화면과 Query 캐시는 이 결과만 사용하며 원본 DTO를 참조하지 않는다.
필수 주소·식별자 누락, 잘못된 지하 코드, 비정상 숫자 문자열, 요청과 다른 페이지 응답은 거부한다.
식별자는 문자열로 보존하고 이전·다음 페이지 여부는 페이지 번호와 전체 개수로 계산한다.
좌표 ViewModel과 좌표 변환 구현은 3-4에서 추가한다.

### 좌표 이용 조건과 배포 경계

좌표 조회·변환·지도 조정·저장 설계는 유지한다. 공식 가이드의 웹 결과 출력 예제를 근거로
좌표 활용 전체를 금지로 단정하지 않되, 일반 건물의 지도 표시·DB 저장 허용 범위와 국외 반출 조건은
실제 배포 전에 확인한다. 상세 근거와 미확인 사항은 `../research.md`의 이용 조건 검토에 기록한다.
기술 구현 완료나 승인키 발급만으로 위 이용 조건을 확인 완료 처리하지 않는다.

### 3-4 좌표 조회와 변환

`lookupCoordinates(reference, approvalKey, signal)`은 별도 좌표 승인키로 `addrCoordApi.do`를 요청한다.
성공은 `{ status: 'success', data: CoordinatesViewModel }`, 업무 실패는 `{ status: 'service-error', code }`다.
전송 오류는 ky 타입 그대로 유지한다. SSR·빈 키·이미 취소된 요청은 전송하지 않는다.
입력 식별자는 검색 단계에서 검증된 ViewModel을 사용하며 여기서 다시 검증하지 않는다.
응답의 부가 식별자 대조·건물 번호 정규화·전체 수 일치 검사는 하지 않는다.
API의 주소별 조회 계약을 따르되 결과가 없거나 여러 개이면 오류로 처리한다.
`entX`·`entY`는 유한한 십진 숫자 문자열로 검증한다. 변환 결과는 유한한 경위도 범위를 검증한다.
프로덕션 이용 조건과 실제 API·CORS 확인은 구현 완료와 별개로 남긴다.

### 주소 검색 UI의 요청 정책

최종 리뷰에 따라 주소 검색은 입력이 300ms 멈추면 자동 조회하고 페이지 이동은 즉시 조회한다. 검색어·페이지별 Query key로 응답을 분리하고 취소 signal은 전달하지 않는다.
전송 계층의 선택적 취소 지원과 10초 제한은 유지한다. 응답 상태는 TanStack Query가 관리하며 부모의 선택값은 사용자 선택 시에만 변경한다.
