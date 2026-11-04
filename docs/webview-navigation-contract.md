# WebView와 Native 탐색 계약

이 문서는 회원 웹 앱을 iOS·Android WebView에 연결할 때 필요한 최소 계약을 정의합니다.
웹의 Stackflow 상태와 Native WebView의 뒤로가기를 서로 중복 처리하지 않는 것이 목적입니다.

## WebView 식별과 safe-area

- iOS WebView는 `applicationNameForUserAgent`에 `YAPPPlusWebView`를 추가합니다.
- 웹은 User-Agent의 `YAPPPlusWebView` 토큰으로 WebView 여부를 판별할 수 있습니다.
- Native는 현재 safe-area 값을 브리지의 `safeAreaInsets`로 전달합니다.
- 웹 브리지는 다음 두 종류의 CSS 변수를 항상 같은 값으로 갱신합니다.
  - `--safe-area-inset-top|right|bottom|left`
  - `--seed-safe-area-top|right|bottom|left`
- Native WebView의 자동 content inset 보정은 끄고(`contentInsetAdjustmentBehavior="never"`),
  웹의 `AppScreen`과 CSS 변수가 한 번만 inset을 적용하도록 합니다.

## Android 뒤로가기

Android Native는 시스템 뒤로가기 이벤트를 다음 순서로 처리합니다.

1. WebView의 `canGoBack()`이 `true`이면 `webView.goBack()`을 호출합니다.
2. `false`이면 현재 화면이 앱의 root인지 확인합니다.
3. root이면 Android의 기본 종료·백 동작을 실행하거나 제품에서 정한 종료 확인을 표시합니다.

Stackflow 화면 내부 이동은 URL history로 동기화됩니다. 따라서 Native가 화면별 버튼을 직접
해석하거나 Activity를 별도로 push하지 않습니다. 입력 화면은 웹 Activity가
`preventSwipeBack`으로 우발적인 입력 손실을 막습니다.

## 직접 진입과 deep link

Native는 deep link의 path와 query를 변경하지 않고 WebView에 전달합니다. 웹은 Stackflow의
`defaultHistory`를 사용해 부모 화면을 복원합니다.

예시는 다음과 같습니다.

| 직접 진입 경로         | 복원되는 부모 흐름                        |
| ---------------------- | ----------------------------------------- |
| `/signup`              | `Login → Signup`                          |
| `/signup/status`       | `Login → SignupStatus`                    |
| `/login/error`         | `Login → LoginError`                      |
| `/error`               | `Login → Error`                           |
| `/my/attendance/rules` | `Tabs(my) → Attendance → AttendanceRules` |
| `/notices/:noticeId`   | `Tabs(notices) → NoticeDetail`            |

Native는 위 부모 흐름을 중복 생성하지 않습니다. 첫 로드 시 WebView의 현재 URL을 유지하고,
웹의 history sync가 다음 URL을 관리하도록 둡니다.

## 검증 책임

환경마다 확인할 수 있는 범위가 다르므로 실행하지 못한 항목을 다른 계층의 통과 결과로 대체하지
않습니다.

### 자동 테스트와 브라우저

- route의 typed params, query와 `defaultHistory`가 URL에서 복원되는가
- 탭 이동이 history를 추가하지 않고 실행 중 state를 보존하는가
- browser back·forward와 Stackflow stack이 같은 화면을 가리키는가
- 플랫폼·reduced motion·화면별 swipe 차단 정책이 합성되는가
- reduced motion에서 이동 애니메이션과 edge swipe가 비활성화되는가

### iOS Simulator

- 일반 상세 화면은 edge swipe로 한 번만 뒤로 가는가
- 입력 손실 위험이 있는 화면은 같은 edge swipe에도 유지되는가
- 회전 전후 AppBar·본문·하단 메뉴에 safe-area가 한 번만 적용되는가
- 직접 URL을 로드하고 새로고침해도 부모 흐름이 복원되는가

### 실제 iOS 기기

- 실제 노치와 홈 인디케이터에서 safe-area가 한 번만 적용되는가
- cold launch와 background 복귀 후 WebView URL·Stackflow 상태가 유지되는가
- 기기 설정의 reduced motion이 WebView 전환 정책에 반영되는가

### Android Native

- 표준 Android User-Agent와 `YAPPPlusWebView` 식별 토큰이 유지되는가
- `canGoBack()`이 `true`일 때 `webView.goBack()`이 한 번만 호출되는가
- root 화면에서 시스템 back 동작이 중복 호출되지 않는가
- `/signup/status`, `/error`, `/notices/:noticeId` deep link의 path와 query를 변경하지 않는가
