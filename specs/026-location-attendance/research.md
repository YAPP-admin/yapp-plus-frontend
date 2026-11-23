# 조사와 결정

**확인일**: 2026-11-18. 기존 대화의 원문 조회와 현재 저장소 코드를 근거로 한다.

## 거리 계산

- 결정: 웹에서 `geolib@4.0.2`의 `getPreciseDistance(current, target, 0)`을 사용한다.
- 이유: WGS84 타원체 거리 계산을 재사용하면서 iOS 네이티브 모듈·브리지 확장을 피한다.
- 확인: npm 배포본은 외부 런타임 의존성이 없고 ESM·CJS·타입을 제공한다. 마지막 인자 0은 반올림 해제다.
  수렴 실패 시 NaN을 반환하므로 호출 경계에서 실패로 처리한다. 내부 파일 경로가 아니라 공개 export를 사용한다.
- 대안: 직접 Haversine은 더 작지만 구면 모델, Core Location은 네이티브 계약 확대,
  GeographicLib는 가능하지만 이번 선택은 geolib로 사용자 확정됐다. 기존 proj4는 좌표 투영용이며 직접 측지 계산 대체로 쓰지 않는다.
- 출처: [geolib 문서](https://github.com/manuelbieh/geolib), [4.0.2 배포본](https://unpkg.com/geolib@4.0.2/dist/index.mjs).

## 기존 API와 화면

- `GET /api/sessions/current-week`의 latitude·longitude는 nullable이며 attendanceStatus는 AVAILABLE·NOT_OPEN·NOT_ELIGIBLE다.
- `POST /api/attendance-verifications`는 sessionId·code만 받으며 verified·checkedInAt을 반환한다.
- `GET /api/attendance-history`는 출결 결과를 제공하지만 체크인 시각·여부 계약은 없다.
- `useAttendanceConfirmation`은 verifyMutationKey 성공 context의 sessionId를 메모리에서 읽는다.
  위치 성공을 이 key의 성공으로 기록하거나 null·이탈 결과를 성공으로 resolve하면 거짓 완료가 생길 수 있다.
- 완료 조회 필드의 추가 가능성은 별도 서버 문의다. 응답을 발명하거나 출결 결과를 체크인 여부로 추정하지 않는다.

## 위치 브리지와 화면 수명

- 공개 `requestCurrentLocation`, `getLocationPermission`, `openAppSettings`, `getAppBridge`를 사용한다.
- native는 권한 대기 이후 측정 15초·수신 시점 5초 이내 표본을 검사한다. OS 측정 자체의 취소는 보장하지 않는다.
- web wrapper는 일반 브라우저·잘못된 응답·통신 실패를 LOCATION_UNAVAILABLE로 정규화한다.
- WebView 존재 검사는 메서드 지원 검사가 아니다. 기존 getAppBridge().isNativeMethodAvailable로 제출 시 위치 메서드 지원을 확인한다.
  연결 미준비/미지원은 같은 제출 불가 안내로 처리하고 자동 대기·재전송하지 않는다. settings 메서드도 호출 전에 확인한다.
- bridge 통신 timeout은 180초다. 전체 사용자 요청이 15초 안에 끝난다고 표시하지 않는다.
- 출석 Activity는 일반 ActivityScreen 활성 context를 제공하지 않으므로 시트 open/isActive를 명시적으로 사용한다.

## Android 비교

- 기준: develop `7fa39e5ab7c03f0805cd4538a1cffdd514a66733`, [거리 취득 코드](https://github.com/YAPP-admin/yapp-plus-android/blob/7fa39e5ab7c03f0805cd4538a1cffdd514a66733/data/src/main/java/com/yapp/plus/data/session/DeviceSessionDistanceDataSource.kt).
- 현재 FINE/COARSE 중 하나로 조회 가능, 15초 대기, Location.distanceBetween 결과를 정수 미터로 표시한다.
  거리·권한 실패는 코드 출석을 막지 않는다. [기존 작업 #209](https://github.com/YAPP-admin/yapp-plus-android/issues/209).
- 결정: 향후 양쪽 정책은 precise·50m·100m로 맞추며 Android는 별도 작업이다.
  [Android API](https://developer.android.com/reference/android/location/Location)는 WGS84 계산이며 반올림 전 값으로 비교한다.

## 개인정보와 외부 가이드

- modern-web-guidance@1.0.0에서 privacy를 조회했다. 권한 요청 전 목적 안내와 사용 후 위치 폐기를 계획에 반영했다.
  근거 문구: “delete data as soon as the purpose for its collection has been fulfilled”.
- 제품 구현 전 해당 시점의 검색·조회 절차와 .mwgrc를 다시 적용한다. 브라우저 위치 권한으로 대체하지 않는다.
- 50m는 사용자가 선택한 제품 기준이다. 정확한 권한·추정 오차는 실제 위치를 절대 보장하지 않으며 실내 실기기 확인이 필요하다.
