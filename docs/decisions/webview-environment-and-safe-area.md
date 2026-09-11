# WebView 식별과 Safe Area 전달 방식

- **상태**: 승인
- **결정일**: 2026-09-11
- **관련 이슈**: [#25 WebView 실행 환경 식별자 추가](https://github.com/YAPP-admin/yapp-plus-frontend/issues/25)
- **기존 구현**: [`d619f99` Expo WebView 셸과 Safe Area 브리지 구성](https://github.com/YAPP-admin/yapp-plus-frontend/commit/d619f991d788b00a5c50c6984dc6bc8aaf588faa)

## 배경

`apps/web`은 일반 브라우저와 `apps/mobile`의 WebView에서 함께 실행됩니다. 두 환경은 같은 웹 코드를 사용하지만 네이티브 브리지의 사용 가능 여부와 Safe Area 값의 출처가 다릅니다.

초기 모바일 셸은 2026-09-08에 `depromeet/dpm-core-client`의 WebView 중심 구조를 참고해 만들었습니다. 당시 `react-native-safe-area-context`로 화면 여백을 측정하고 `webview-bridge`를 네이티브와 웹 사이의 계약으로 사용하기로 했습니다.

DPM 구현은 앱 정보와 Safe Area 값을 User-Agent에 함께 넣습니다. 우리 구현은 Safe Area가 화면 회전과 시스템 UI 변화로 바뀐다는 점을 고려해 처음부터 `webview-bridge` shared state로 전달했습니다. 이 차이와 근거가 저장소 문서에 남아 있지 않아, WebView 실행 환경 식별자를 추가하면서 계약을 명시합니다.

## 결정

### WebView 실행 환경

모바일 WebView는 플랫폼의 기존 User-Agent 뒤에 다음 고정 토큰을 추가합니다.

```text
YAPPPlusWebView
```

`@yapp-plus/app-bridge`가 토큰과 `isYappPlusWebViewUserAgent()`를 공개합니다. 판별 함수는 공백으로 구분된 독립 토큰만 인식하며 브라우저 전역을 직접 읽지 않습니다. 따라서 브라우저 코드와 요청 처리 코드가 필요에 따라 User-Agent를 명시적으로 전달해 같은 규칙을 사용할 수 있습니다.

`applicationNameForUserAgent`를 사용해 기존 User-Agent를 유지합니다. `userAgent` 전체를 덮어쓰거나 앱 버전과 플랫폼을 별도 형식으로 추가하지 않습니다.

### Safe Area

Safe Area 값은 User-Agent에 포함하지 않고 기존 브리지로만 전달합니다.

```text
react-native-safe-area-context
  → nativeAppBridge.safeAreaInsets
  → webview-bridge shared state
  → --safe-area-inset-top/right/bottom/left
```

일반 브라우저에서는 브리지를 설치하지 않고 CSS의 `env(safe-area-inset-*)` 값을 사용합니다. 앱 WebView에서는 네이티브가 전달한 초기값과 변경값을 CSS 변수에 반영합니다.

## 이유

- 실행 환경 식별자는 고정 정보이므로 User-Agent 토큰에 적합합니다.
- Safe Area는 동적 정보이므로 변경을 구독할 수 있는 브리지 상태에 적합합니다.
- 같은 Safe Area 값을 User-Agent와 브리지 양쪽에 저장하면 어느 값이 최신인지 결정해야 하는 중복 상태가 생깁니다.
- 기존 User-Agent를 유지하면 플랫폼과 브라우저 엔진이 제공하는 정보를 직접 재구성하지 않아도 됩니다.
- 공용 순수 함수 하나로 판별 규칙을 고정하면 소비자마다 다른 부분 문자열 검사를 작성하지 않아도 됩니다.

## 검토한 대안

### Safe Area를 User-Agent에 포함

첫 HTTP 요청부터 서버가 Safe Area를 알 수 있다는 장점이 있습니다. 하지만 화면 회전 후 값이 오래되고, 브리지의 최신 값과 불일치할 수 있습니다. 현재 서버 렌더링에서 Safe Area에 따라 다른 화면을 만들 요구도 없으므로 선택하지 않았습니다.

### `window.ReactNativeWebView`만 검사

현재 Safe Area 브리지 설치 여부를 확인하는 데에는 유효합니다. 그러나 클라이언트 전역이 만들어진 뒤에만 사용할 수 있고 HTTP 요청이나 서버 코드에서는 같은 판별 규칙을 사용할 수 없어 실행 환경의 공용 계약으로 선택하지 않았습니다.

### 별도 `safe_area_changed` 이벤트 추가

Telegram처럼 네이티브가 이벤트를 보내고 웹 SDK가 CSS 변수에 반영하는 방식도 유효합니다. 다만 현재 `webview-bridge` shared state가 초기값과 변경값 전달을 이미 담당하므로 별도 이벤트를 추가하면 같은 경로가 중복됩니다.

## 보안 제한

User-Agent는 호출자가 임의로 설정할 수 있습니다. `isYappPlusWebViewUserAgent()` 결과는 앱 전용 UI와 네이티브 기능 사용 가능성을 판단하는 힌트일 뿐이며 인증, 인가 또는 앱 요청 증명에 사용하지 않습니다.

## 참고 자료와 출처

초기 구현에서 직접 참고한 자료는 다음과 같습니다.

- [DPM 네이티브 WebView 셸](https://github.com/depromeet/dpm-core-client/blob/develop/apps/native/app/index.tsx)
- [DPM 앱 브리지](https://github.com/depromeet/dpm-core-client/blob/develop/apps/native/bridge/app-bridge.ts)
- [`webview-bridge` shared state](https://gronxb.github.io/webview-bridge/shared-state/react-native.html)
- [`webview-bridge` Next.js 연동](https://gronxb.github.io/webview-bridge/ssr/next-js-app-router.html)

이번 결정을 검토하면서 확인한 공개 비교 자료는 다음과 같습니다. Telegram은 초기 구현의 출처가 아니라, 네이티브 Safe Area를 WebView 이벤트로 전달하는 같은 계열의 설계를 확인하기 위한 비교 사례입니다.

- [React Native WebView `applicationNameForUserAgent`](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md#applicationnameforuseragent)
- [Telegram Mini Apps WebView 이벤트 규약](https://core.telegram.org/api/bots/webapps)
- [Telegram Android Safe Area 전달](https://github.com/DrKLO/Telegram/blob/master/TMessagesProj/src/main/java/org/telegram/ui/web/BotWebViewContainer.java#L3159)
- [Telegram iOS Safe Area 전달](https://github.com/TelegramMessenger/Telegram-iOS/blob/master/submodules/WebUI/Sources/WebAppWebView.swift#L304)
- [Telegram Desktop Safe Area 전달](https://github.com/telegramdesktop/tdesktop/blob/dev/Telegram/SourceFiles/ui/chat/attach/attach_bot_webview.cpp#L2583)

## 후속 변경 기준

- 앱 버전이나 플랫폼에 따른 분기가 실제로 필요해질 때 별도의 형식과 호환 정책을 정의합니다.
- 서버가 첫 응답부터 신뢰할 수 있는 앱 증명을 요구하면 User-Agent가 아닌 별도의 인증 계약을 설계합니다.
- Safe Area 전달 경로를 변경할 때는 일반 브라우저 fallback과 앱 WebView의 초기값·변경값 테스트를 함께 갱신합니다.
