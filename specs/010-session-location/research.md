# 기술 선택과 조사 근거

**확인일**: 2026-10-23. 결정과 실제 환경 검증 완료를 구분한다.

## 좌표 변환: proj4

**결정**: 행안부의 투영 좌표를 `proj4`로 EPSG:5179에서 EPSG:4326으로 변환한다.
**이유**: JavaScript·브라우저에는 이 투영 변환을 직접 수행하는 표준 API가 없다.
Geolocation은 현재 장치의 WGS84 위치를 얻는 API이며 임의 주소의 투영 좌표 변환기가 아니다.
변환 수학을 직접 구현하는 대신 검증 가능한 라이브러리를 사용한다. 변환 자체에는 키·네트워크가 필요하지 않다.
**대안**: 직접 수식 구현은 축·타원체·투영 상수 오류의 부담이 크다. 서버 변환은 이번 브라우저 조회 결정과 맞지 않는다.
카카오 좌표 변환 서비스를 추가로 호출하지 않는다.

- Juso `entX`는 동쪽 방향 X, `entY`는 북쪽 방향 Y로 처리한다. 단위는 미터다.
- proj4 기본 입력은 `[x, y]`, 경위도 출력은 `[longitude, latitude]`다. 앱 내부에서는 이름 있는 필드로 즉시 변환한다.
- EPSG의 축 표기와 라이브러리 배열 규약을 혼동하지 않는다. 카카오 `LatLng`는 위도·경도 순서다.
- EPSG:5179는 명시적으로 등록한다. 정의 후보는 Transverse Mercator, GRS80, 원점 위도 38·경도 127.5, 축척 0.9996, false easting 1000000·northing 2000000이다.
- 정의 원문·datum 처리와 수치 기준점은 3-4에서 공급자 명세/공식 좌표계 자료에 대조한 뒤 고정한다. 단순 왕복 변환만으로 정확성을 검증하지 않는다.
- 투영 원점의 `[1000000, 2000000] → [127.5, 38]` 검증 외에 서로 다른 지역의 독립 기준점과 실제 주소 지도 위치를 함께 확인한다. EPSG 정의는 출처 확인 전 복사해 구현하지 않는다.

근거: [proj4 공식 문서](https://proj4js.org/), [proj4 저장소](https://github.com/proj4js/proj4js),
[W3C Geolocation 범위](https://www.w3.org/TR/geolocation/#scope), [행안부 좌표 안내](https://business.juso.go.kr/jst/jstCoordApiSearch).

## 지도: react-kakao-maps-sdk

**결정**: `<Map>`·`<MapMarker>`를 사용하고 앱 폼이 최종 좌표를 소유한다.
**이유**: 지도 객체·마커·React 이벤트 수명 처리를 재사용한다. 일반 목적의 React 지도 래퍼는 만들지 않는다.
**대안**: 카카오 SDK 전체를 직접 래핑하면 불필요한 이벤트 정리·업데이트 코드를 관리해야 한다.

지도 클릭은 `event.latLng.getLat()/getLng()`, 마커 드래그 완료는 `marker.getPosition()`을 읽어 폼에 전달한다.
마커의 `position`은 최종 좌표를 따른다. 지도 이동 이벤트로 좌표를 저장하지 않는다.
지도 컨테이너는 높이를 확보하고 모달 표시/크기 변경 시 필요한 relayout을 확인한다.
지도는 브라우저에서만 마운트하며 키보드 좌표 입력은 SDK와 독립적으로 제공한다.

v1.2.0 소스를 기준으로 조사했다. `useKakaoLoader`는 재시도 함수를 노출하지 않으며,
Loader의 최종 실패 이후 reset 경로는 SDK 미존재 상태에서 정상 재삽입을 보장하기 어렵다.
단순 재마운트나 옵션 변경을 재시도로 취급하지 않는다.
앱 전용 작은 script 로더에서 `autoload=false`와 `kakao.maps.load` 완료를 관리하고 준비된 후 지도 컴포넌트를 마운트한다.
오류·10초 타임아웃 시 자신이 만든 script·handler와 pending Promise를 정리하고 사용자 재시도를 허용한다.
성공한 SDK는 폼 닫기마다 제거하지 않는다. 실패한 SDK의 내부 부분 로드 상태와 늦은 로딩은 실제 브라우저에서 검증한다.
범용 래퍼 신설이나 라이브러리 소스 패치는 하지 않는다. 설치할 버전이 달라지면 로더 동작을 재확인한다.

근거: [v1.2.0 useKakaoLoader](https://github.com/JaeSeoKim/react-kakao-maps-sdk/blob/v1.2.0/packages/react-kakao-maps-sdk/src/hooks/useKakaoLoader.tsx),
[Loader](https://github.com/JaeSeoKim/react-kakao-maps-sdk/blob/v1.2.0/packages/react-kakao-maps-sdk/src/util/kakaoMapApiLoader.ts),
[Map](https://github.com/JaeSeoKim/react-kakao-maps-sdk/blob/v1.2.0/packages/react-kakao-maps-sdk/src/components/Map.tsx),
[드래그 마커 예제](https://react-kakao-maps-sdk.jaeseokim.dev/docs/sample/overlay/draggableMarker/).

## 주소 조회와 페이지 이동

**결정**: 주소와 좌표는 행안부에서 조회한다. 주소 검색은 명시적 제출, 페이지당 10개다.
**이유**: 주소 데이터와 지도 표시 역할을 분리하고 사용자가 조정한 최종 위치를 저장하기 위함이다.
**대안**: 카카오 POI·지오코딩 결과를 저장하는 흐름은 이번 범위에서 채택하지 않는다.

공식 안내의 `currentPage`·`countPerPage`·`totalCount`를 사용한다. 주소 검색은 임차 업체 전체를 찾는 장소 검색이 아니므로 상세 장소 안내는 직접 입력한다.
주소 검색은 일반 JSON endpoint와 CORS 허용 헤더를 확인하여 fetch를 사용한다. JSONP와 iframe은 필요하지 않다. 좌표 조회의 JSON·CORS 지원은 승인 후 별도 검증한다.
이번 확인에서 Juso 안내 페이지의 본문이 웹 도구에 추출되지 않아 앞선 조사 내용을 계획에 반영했으며,
발급 조건·키 동작·응답 스키마는 2단계 검증을 완료했다고 주장하지 않는다.

근거: [주소 검색 안내](https://business.juso.go.kr/jst/jstRoadNmAddrApiSearch),
[좌표 검색 안내](https://business.juso.go.kr/jst/jstCoordApiSearch).

## 참고 UX와 저장 경계

[Shiftee 장소 설정](https://shiftee.io/ko/help/article/timeclockArea)의 장소 설정 흐름을 참고한다.
이번 기능은 주소 선택→지도 위치 확인·조정까지만 적용하며 출퇴근 반경·WiFi·QR 설정을 추가하지 않는다.
외부 검색은 실제 요청, 세션 저장은 DEV 메모리로 구분한다. 키는 브라우저에 보이며 비밀 저장 수단으로 취급하지 않는다.

## 좌표 활용 가이드와 이용 조건 검토 — 2026-10-26

**결정**: 주소·좌표 조회, proj4 변환, 지도 위치 조정과 최종 좌표 저장 설계를 유지한다.
좌표 조회·변환 개발과 실제 배포 시 이용 조건 확인을 구분한다. 주소만 저장하는 명세로 변경하지 않는다.

사용자가 제공한 디지털주소정보플랫폼의 「좌표검색API 활용 방법」을 확인했다.

- 3쪽은 도로명주소의 X·Y 좌표 실시간 활용 및 일반 JSON endpoint `addrCoordApi.do`를 안내한다.
- 14쪽은 웹 페이지 직접 호출과 고객 사이트의 결과 출력 흐름을 제시한다.
- 17~18쪽은 JSON 응답을 HTML로 변환하는 예제와 `entX`·`entY` 출력 예시를 제공한다.

이 근거로 웹에서 좌표를 조회·출력하는 행위 전체가 금지된다고 단정하지 않는다.
다만 기술 예제가 이용 조건을 대체하지는 않는다. 예제의 'HTML 형태로 저장'은 DB 영구 저장 허용의 근거가 아니다.
비공개·공개제한 시설에만 표시 제한이 적용되는지도 이 가이드만으로 확정하지 않는다.

배포 전 제공기관에 확인할 항목:

- 일반 건물 좌표를 지도 마커와 위·경도 숫자로 표시하고 조정하는 범위.
- 조회·변환·조정한 최종 좌표를 행사 장소로 DB에 저장할 수 있는지.
- 국외 반출 금지의 적용 범위: 해외 서버 저장·처리·로그 및 해외 접속.

Vercel 프론트엔드 배포 사실만으로 국외 반출을 단정하지 않고 실제 좌표 데이터 흐름을 확인한다.
현재 승인키 처리 상태와 실제 좌표 API 응답·CORS 검증 여부는 별도 관리한다.
가이드의 JSON endpoint 안내를 브라우저 CORS 허용을 검증한 것으로 취급하지 않는다.
원본 PDF는 사용자 첨부 자료로 로컬 `.context/attachments/AC9GNY/`에 있으며 Git에는 포함하지 않는다.

## 3-4 좌표 정의와 독립 기준점 — 2026-10-26

행안부 공식 답변에서 좌표제공 API가 UTM-K(GRS80)를 사용함을 확인했다.

- https://business.juso.go.kr/addrlink/qna/qnaDetail.do?bulletinRefSn=128137
- https://juso.go.kr/addrlink/qna/qnaDetail.do?bulletinRefSn=130956

EPSG 웹 레지스트리는 도구에서 열리지 않아 PROJ의 EPSG 데이터베이스를 pyproj로 조회하여
EPSG:5179 정의를 대조했다. pyproj 3.8.0 / PROJ 9.8.1을 개발용 임시 실행 환경에서 사용했으며
제품 의존성에는 추가하지 않았다. 정의는 tmerc, lat_0=38, lon_0=127.5, k=0.9996,
x_0=1000000, y_0=2000000, ellps=GRS80, units=m이다.
별도 지역 보정 그리드나 측량 정밀도를 보장하는 변환은 추가하지 않는다.
proj4 2.22.0을 catalog로 고정했다. 기본 배열 규약은 https://proj4js.org/ 의 Axis order를 따른다.

독립 기준점은 PROJ의 `Transformer.from_crs(4326, 5179, always_xy=True)`로 생성했다.
테스트는 아래 고정 미터 좌표를 proj4로 역변환하여 지정한 경위도와 소수점 7자리 수준으로 대조한다.
이는 변환 구현의 수치 일치 확인이며 주소 출입구 원자료의 위치 정확도 보장이 아니다.

| 기준점 | 경도     | 위도    | 동쪽 X(m)          | 북쪽 Y(m)          |
| ------ | -------- | ------- | ------------------ | ------------------ |
| 서울   | 126.978  | 37.5665 | 953901.1653121515  | 1952032.0809790879 |
| 부산   | 129.0756 | 35.1796 | 1143467.3796645734 | 1688281.9820715077 |
| 제주   | 126.5312 | 33.4996 | 910010.5457116975  | 1501279.788866011  |

투영 원점과 공식 가이드의 한국지역정보개발원 예제도 검증한다.
좌표 API JSON endpoint는 가이드 3쪽에서 확인했으나 사용자 승인키 호출·CORS·지도 실위치는 미검증이다.
