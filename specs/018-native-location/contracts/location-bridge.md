# 위치 브리지 계약

상태: 구현 전 계약 초안. 단일 원천은 구현 후 `@yapp-plus/app-bridge`의 타입·검증 스키마다.
기존 인증·safe-area 계약은 유지하고 위치를 공유 store 속성으로 추가하지 않는다.

## 공개 RPC

| 메서드                     | 입력 | 반환                       |
| -------------------------- | ---- | -------------------------- |
| `getLocationPermission()`  | 없음 | `LocationPermissionResult` |
| `requestCurrentLocation()` | 없음 | `LocationResult`           |
| `openAppSettings()`        | 없음 | `OpenAppSettingsResult`    |

아래의 `'precise' | 'approximate'` 같은 표기는 문자열 리터럴 유니온이다.
나열된 문자열 중 하나만 사용할 수 있다는 뜻이며 TypeScript의 `enum` 선언은 아니다.
`status`로 성공·실패를 구분한 뒤 해당 결과에만 있는 필드를 읽는다.

```ts
/** OS가 허용한 위치 정밀도다. 실제 측정 오차인 accuracy와는 다르다. */
type LocationPrecision =
  | 'precise' // 정확한 위치 접근이 허용됨. 특정 오차 이내의 측정을 보장하지는 않음.
  | 'approximate' // 대략적인 위치 접근만 허용됨.
  | 'unknown'; // 권한이 없거나 OS에서 정밀 권한 수준을 확인할 수 없음.

/** 조회 시점의 앱 위치 권한과 기기 위치 서비스 상태다. */
type LocationPermission = {
  status:
    | 'granted' // 앱의 사용 중 위치 접근이 허용됨.
    | 'denied' // 위치 접근이 거부됨. 재요청 가능 여부는 canAskAgain으로 확인.
    | 'undetermined'; // 사용자가 아직 위치 권한을 결정하지 않음.
  /** OS 권한 팝업을 다시 요청할 수 있는지 여부. 허용 여부와는 별개다. */
  canAskAgain: boolean;
  /** OS가 허용한 위치 정밀도. */
  precision: LocationPrecision;
  /** 기기 전체의 위치 서비스가 켜져 있는지 여부. 앱 권한 허용과는 별개다. */
  servicesEnabled: boolean;
};

/** 한 번 측정해 전달하는 위치 결과다. 출석 성공 여부를 포함하지 않는다. */
type LocationSample = {
  /** 위도(도). -90 이상 90 이하. */
  latitude: number;
  /** 경도(도). -180 이상 180 이하. */
  longitude: number;
  /** 기기가 추정한 수평 오차 반경(m). 작을수록 정밀하며 null은 오차를 알 수 없다는 뜻. */
  accuracy: number | null;
  /** 위치를 측정한 시각. 1970-01-01 UTC부터 경과한 밀리초(epoch ms). */
  timestamp: number;
  /** 측정 시점에 OS가 허용한 위치 정밀도. */
  precision: LocationPrecision;
};

/** 실패 원인 분류다. OS나 서버의 원문 오류 문자열은 전달하지 않는다. */
type LocationErrorCode =
  | 'PERMISSION_DENIED' // 위치 권한 미허용. canAskAgain으로 재요청/설정 안내를 구분.
  | 'SERVICES_DISABLED' // 기기 위치 서비스가 꺼져 있어 측정할 수 없음.
  | 'TIMEOUT' // 위치 측정 응답 대기 15초를 초과함.
  | 'BUSY' // 기존 위치 요청이나 권한 팝업이 진행 중이라 새 요청을 시작하지 않음.
  | 'APP_INACTIVE' // 시작 시 active가 아니거나 권한 확인 후·위치 반환 시 background임.
  | 'LOCATION_UNAVAILABLE'; // 위치 취득·응답 검증·브리지 통신·설정 실행 실패.

/** RPC 실패 결과. ERROR는 요청 실패를 뜻하며 출석 거절을 뜻하지 않는다. */
type LocationFailure =
  | {
      status: 'ERROR';
      code: 'PERMISSION_DENIED';
      /** true면 권한 재요청 가능, false면 권한 변경을 위해 앱 설정 안내 필요. */
      canAskAgain: boolean;
    }
  | {
      status: 'ERROR';
      /** Exclude는 위 오류 코드 집합에서 PERMISSION_DENIED만 제외한다. */
      code: Exclude<LocationErrorCode, 'PERMISSION_DENIED'>;
    };

/** 권한 조회 결과. SUCCESS여도 permission.status가 denied일 수 있다. */
type LocationPermissionResult =
  { status: 'SUCCESS'; permission: LocationPermission } | LocationFailure;

/** 위치 요청 결과. SUCCESS는 측정 성공이며 출석 완료가 아니다. */
type LocationResult = { status: 'SUCCESS'; location: LocationSample } | LocationFailure;

/** 설정 실행 요청 결과. SUCCESS는 설정에서 권한이 변경되었음을 보장하지 않는다. */
type OpenAppSettingsResult = { status: 'SUCCESS' } | LocationFailure;
```

설정 열기의 SUCCESS는 설정 실행 요청의 성공만 뜻하며 권한 허용을 뜻하지 않는다.

## 검증·정규화

- 좌표는 유한수이고 위도 -90 이상 90 이하, 경도 -180 이상 180 이하이다. timestamp는 양의 안전한 정수(epoch ms)다.
- accuracy는 0 이상의 유한수(미터) 또는 null이다. OS가 미확인 값으로 반환한 null·음수 sentinel은 null로 정규화한다. NaN·무한수는 잘못된 응답이다.
- accuracy는 기기가 추정한 수평 위치 오차 반경이며, 사용자가 지정하는 수치나 출석 허용 반경이 아니다. 유효한 값은 크기와 관계없이 전달하고 null도 임의의 수치로 대체하지 않는다.
- 후속 출석 API의 허용 반경은 100m를 예정 기준으로 둔다. accuracy를 더해 허용 반경을 늘리지 않는다. 오차가 크거나 null일 때의 재측정·출석 판정 기준은 후속 API 작업에서 정하며 이 RPC에 추가하지 않는다.
- 이 저장소의 iOS 구현은 full/reduced를 precise/approximate로 매핑한다. OS 정보가 없거나 권한이 없으면 unknown이다. 오차로 정밀 권한을 추정하지 않는다.
- 네이티브 변환 시 유효성을 검증하고 웹 수신 경계에서도 스키마를 검증한다. 잘못된 응답은 LOCATION_UNAVAILABLE이며 원문 오류·추가 OS 필드는 노출하지 않는다.
- 수신 시점 기준 측정 후 5초를 초과한 표본은 LOCATION_UNAVAILABLE로 거부한다. 마지막 알려진 위치 API나 이전 요청의 결과를 사용하지 않는다.

## 요청 처리와 오류

1. 위치 요청이 이미 진행 중이면 BUSY다. 앱이 active가 아니면 APP_INACTIVE다.
2. 권한을 조회하고 granted가 아니면서 canAskAgain이면 foreground 권한을 요청한다. 미허용이면 PERMISSION_DENIED다.
3. 권한 확인 뒤 위치 서비스가 꺼져 있으면 SERVICES_DISABLED다. 권한 조회 RPC는 이 경우에도 servicesEnabled=false로 성공할 수 있다.
4. getCurrentPositionAsync에 Accuracy.High를 지정한다. 측정 응답을 15초 대기하고 초과 시 TIMEOUT이다.
5. 잘못된 표본·수신 시점 기준 5초를 초과한 표본·OS 취득 실패는 LOCATION_UNAVAILABLE다. 권한 확인 후와 위치 반환 시 background이면 APP_INACTIVE다. 권한 팝업의 일시적 inactive는 허용한다.
6. 응답 종료 시 타이머와 중복 요청 잠금을 해제한다. 구독·AppState listener·전체 150초 타이머는 사용하지 않는다.

권한 선택 대기에는 별도 제한을 두지 않으며 팝업 응답 전에는 BUSY로 중복 요청을 막는다.
기존 브리지의 180초 대기가 먼저 끝나도 OS 팝업은 닫히지 않으며, 이후 승인되면 네이티브 측정은 진행될 수 있다.
단발 API는 취소할 수 없으므로 timeout 뒤 OS 측정이 남을 수 있다. 재시도는 허용하며 이전 요청의 늦은 성공·실패는 무시한다.
앱 상태 전환을 감시하지 않으므로 잠시 background에 갔다가 결과 반환 전에 복귀하면 정상 결과를 받을 수 있다.
앱 설정 열기는 Linking.openSettings의 성공·실패를 반환한다. 복귀 감지·자동 재요청·권한 허용 성공을 뜻하지 않는다.

## 웹 호출 도우미

`@yapp-plus/app-bridge/web`에서 RPC와 같은 이름의 도우미 세 개를 공개한다.
SSR·일반 브라우저에서는 호출자가 위치 동작을 실행하지 않고 앱 이용 안내를 제공한다.
도우미가 직접 잘못 호출되면 LOCATION_UNAVAILABLE로 처리한다.
출시 전 앱과 웹을 함께 갱신하므로 구버전 메서드 지원 검사·별도 준비 polling·fallback은 추가하지 않는다.
위치 RPC의 브리지 timeout·통신 예외는 LOCATION_UNAVAILABLE로 변환하며 네이티브 TIMEOUT과 구분한다.
예상한 실패를 예외로 던지지 않는다. 기존 인증 RPC의 timeout·오류 정책은 변경하지 않는다.

개발 도구는 권한·정밀 수준·성공/오류 코드만 표시한다. 좌표와 측정 시각 원문을 DOM·콘솔·로그에 남기지 않는다.
화면의 진행 중 요청은 버튼 중복을 막고 접근성 상태로 안내한다. 이탈 시 응답을 버리고 재진입 시 초기화한다.
브리지 debug 로깅은 네이티브에서 끄고, 웹 라이브러리에서도 payload가 출력되지 않는지 검증한다.
