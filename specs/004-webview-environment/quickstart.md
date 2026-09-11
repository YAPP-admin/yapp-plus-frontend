# Quickstart: WebView 실행 환경 식별

## 로컬 검증

```sh
node --run check
node --run build
node --run expo:doctor
```

기대 결과: 공용 User-Agent 판별 계약과 기존 Safe Area 테스트가 모두 통과하고, 웹·모바일을 포함한 빌드 및 Expo 의존성 검사가 성공합니다.

## User-Agent 판별 확인

다음 입력을 단위 테스트에서 확인합니다.

| 입력                                  | 기대 결과  |
| ------------------------------------- | ---------- |
| `Existing/User-Agent YAPPPlusWebView` | 앱 WebView |
| `YAPPPlusWebView`                     | 앱 WebView |
| `Existing/User-Agent`                 | 일반 웹    |
| `NotYAPPPlusWebView`                  | 일반 웹    |
| `YAPPPlusWebView/1.0`                 | 일반 웹    |
| `null`, `undefined`, 빈 문자열        | 일반 웹    |

## 모바일 설정 확인

모바일 WebView가 `applicationNameForUserAgent`에 공용 토큰을 사용하고 기존 `userAgent` 전체를 덮어쓰지 않는지 코드에서 확인합니다.

## Safe Area 유지 확인

1. 일반 브라우저에서는 앱 브리지 설치를 건너뛰고 `env(safe-area-inset-*)` fallback을 유지하는 테스트를 실행합니다.
2. 앱 WebView에서는 초기 Safe Area 네 방향 값이 CSS 변수에 반영되는 테스트를 실행합니다.
3. 브리지 상태가 변경되면 CSS 변수가 최신 값으로 바뀌는 테스트를 실행합니다.

## 의사결정 문서 확인

`docs/decisions/webview-environment-and-safe-area.md`에서 다음 내용을 확인합니다.

- WebView 식별자와 Safe Area 값을 분리한 이유
- `dpm-core-client`에서 참고한 범위와 다르게 선택한 부분
- `webview-bridge` shared state를 유지한 이유
- Telegram 공개 구현이 제공하는 비교 근거
- User-Agent 판별을 보안 경계로 사용하지 않는 제한
