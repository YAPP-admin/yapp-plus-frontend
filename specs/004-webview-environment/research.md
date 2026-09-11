# Research: WebView 실행 환경 식별

## Decision 1: 기존 User-Agent에 고정 앱 토큰 추가

**Decision**: 모바일 WebView의 기존 User-Agent를 덮어쓰지 않고 `applicationNameForUserAgent`로 `YAPPPlusWebView` 토큰을 추가합니다.

**Rationale**: `react-native-webview`의 공식 API가 기존 브라우저·기기 정보를 유지한 채 애플리케이션 이름을 뒤에 추가합니다. 고정 토큰 하나면 클라이언트와 서버가 같은 입력으로 환경을 판별할 수 있고, 별도 초기화 순서를 요구하지 않습니다.

**Alternatives considered**:

- `userAgent` 전체 교체: 플랫폼의 기본 브라우저·기기 정보를 직접 재구성해야 하고 업데이트에 취약합니다.
- 브리지 객체 존재 여부만 검사: 클라이언트 hydration 이후에만 사용할 수 있고 서버 요청에서는 판별할 수 없습니다.
- 전역 변수를 JavaScript로 주입: 문서 로드 순서와 주입 시점에 의존하며 요청 헤더에서는 사용할 수 없습니다.

**Reference**: [React Native WebView `applicationNameForUserAgent`](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md#applicationnameforuseragent)

## Decision 2: 공용 순수 함수로 독립 토큰만 판별

**Decision**: `isYappPlusWebViewUserAgent(userAgent)`는 `string | null | undefined`를 받고 공백으로 구분된 토큰 중 `YAPPPlusWebView`와 정확히 일치하는 값이 있을 때만 `true`를 반환합니다.

**Rationale**: 함수가 브라우저 전역에 직접 의존하지 않으면 클라이언트 코드와 요청 처리 코드에서 같은 규칙을 재사용할 수 있습니다. 부분 문자열 일치를 피하면 비슷한 이름의 User-Agent를 YAPP Plus 앱으로 오인하지 않습니다.

**Alternatives considered**:

- `userAgent.includes('YAPPPlusWebView')`: 간단하지만 `NotYAPPPlusWebView` 같은 문자열도 잘못 인식합니다.
- 호출할 때마다 정규식 작성: 판별 규칙이 소비자마다 달라질 수 있습니다.
- 앱 버전과 플랫폼까지 함께 파싱: 현재 기능 분기에 필요하지 않은 계약과 호환 비용을 미리 추가합니다.

## Decision 3: Safe Area는 기존 브리지 상태로만 전달

**Decision**: Safe Area의 위·오른쪽·아래·왼쪽 값은 현재처럼 네이티브에서 측정하고 `webview-bridge` shared state로 전달해 CSS 변수에 반영합니다. User-Agent에는 이 값을 넣지 않습니다.

**Rationale**: Safe Area는 화면 회전과 시스템 UI 변화로 런타임에 바뀔 수 있습니다. 요청 시점의 User-Agent에 저장하면 값이 오래되고, 브리지와 User-Agent가 서로 다른 값을 가진 중복 상태가 됩니다. shared state는 변경을 웹에 전달할 수 있습니다.

**Alternatives considered**:

- DPM처럼 User-Agent에 inset 저장: 첫 요청에서 서버가 값을 알 수 있지만 동적 변경 반영과 중복 상태 관리가 필요합니다.
- CSS `env(safe-area-inset-*)`만 사용: 일반 브라우저에는 적합하지만 네이티브 WebView 컨테이너가 소유한 실제 여백을 일관되게 제공하지 못할 수 있습니다.
- 별도 `safe_area_changed` 이벤트 추가: Telegram과 같은 유효한 구조지만 현재 shared state가 동일한 역할을 수행하므로 전달 경로가 중복됩니다.

**References**:

- [DPM 네이티브 WebView 셸](https://github.com/depromeet/dpm-core-client/blob/develop/apps/native/app/index.tsx)
- [`webview-bridge` shared state](https://gronxb.github.io/webview-bridge/shared-state/react-native.html)
- [Telegram Mini Apps WebView 이벤트](https://core.telegram.org/api/bots/webapps)
- [Telegram Android Safe Area 전달](https://github.com/DrKLO/Telegram/blob/master/TMessagesProj/src/main/java/org/telegram/ui/web/BotWebViewContainer.java#L3159)
- [Telegram iOS Safe Area 전달](https://github.com/TelegramMessenger/Telegram-iOS/blob/master/submodules/WebUI/Sources/WebAppWebView.swift#L304)

## Decision 4: 실행 환경 식별은 보안 경계가 아님

**Decision**: User-Agent 판별은 UI와 네이티브 기능의 사용 가능성 분기에만 사용하고 인증·인가에는 사용하지 않습니다.

**Rationale**: User-Agent는 일반 HTTP 클라이언트에서도 임의로 설정할 수 있으므로 신뢰할 수 있는 앱 증명이 아닙니다.

**Alternatives considered**:

- 식별자가 있으면 앱 요청으로 신뢰: 구현은 단순하지만 위조할 수 있어 보안 경계로 부적절합니다.
- 앱 증명 토큰 도입: 인증 요구가 없는 현재 범위를 벗어나며 별도의 서버·네이티브 계약이 필요합니다.
