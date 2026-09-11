# Data Model: WebView 실행 환경 식별

## 실행 환경 식별 토큰

- **값**: `YAPPPlusWebView`
- **소유자**: `@yapp-plus/app-bridge`
- **전달 위치**: 모바일 WebView의 기존 User-Agent 뒤에 독립 토큰으로 추가
- **수명**: 앱 실행 동안 고정
- **금지 데이터**: Safe Area, 사용자 정보, 인증 정보, 기기별 식별자

## User-Agent 판별 입력

- **형식**: 문자열, `null` 또는 `undefined`
- **앱 WebView 조건**: 공백으로 구분된 토큰 중 실행 환경 식별 토큰과 정확히 일치하는 값이 존재함
- **일반 웹 조건**: 입력이 없거나 일치하는 독립 토큰이 없음

## Safe Area 값

- **필드**: `top`, `right`, `bottom`, `left`
- **형식**: 음수가 아닌 유한한 숫자
- **소유자**: 기존 `AppBridgeState.safeAreaInsets`
- **전달**: 네이티브 브리지 shared state에서 웹 CSS 변수로 동기화
- **관계**: 실행 환경 식별 토큰과 독립적이며 User-Agent에 포함하지 않음
