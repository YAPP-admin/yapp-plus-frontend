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
브라우저 조회는 공식 JSONP 인터페이스를 사용하되 콜백 포장은 키를 받은 뒤 실제 응답으로 확정한다.
이번 확인에서 Juso 안내 페이지의 본문이 웹 도구에 추출되지 않아 앞선 조사 내용을 계획에 반영했으며,
발급 조건·키 동작·응답 스키마는 2단계 검증을 완료했다고 주장하지 않는다.

근거: [주소 검색 안내](https://business.juso.go.kr/jst/jstRoadNmAddrApiSearch),
[좌표 검색 안내](https://business.juso.go.kr/jst/jstCoordApiSearch).

## 참고 UX와 저장 경계

[Shiftee 장소 설정](https://shiftee.io/ko/help/article/timeclockArea)의 장소 설정 흐름을 참고한다.
이번 기능은 주소 선택→지도 위치 확인·조정까지만 적용하며 출퇴근 반경·WiFi·QR 설정을 추가하지 않는다.
외부 검색은 실제 요청, 세션 저장은 DEV 메모리로 구분한다. 키는 브라우저에 보이며 비밀 저장 수단으로 취급하지 않는다.
