# Contract: YAPP Plus WebView User-Agent

## 토큰

```text
YAPPPlusWebView
```

모바일 앱은 플랫폼의 기존 User-Agent를 유지하고 위 토큰을 공백으로 구분해 뒤에 추가합니다.

## 공개 API

```ts
export const YAPP_PLUS_WEBVIEW_USER_AGENT_TOKEN = 'YAPPPlusWebView';

export const isYappPlusWebViewUserAgent = (
  userAgent: string | null | undefined,
): boolean;
```

## 판별 규칙

- 입력에 공백으로 구분된 `YAPPPlusWebView` 토큰이 있으면 `true`입니다.
- `undefined`, `null`, 빈 문자열은 `false`입니다.
- `YAPPPlusWebViewBeta`, `NotYAPPPlusWebView`, `YAPPPlusWebView/1.0`은 독립 토큰이 아니므로 `false`입니다.
- 토큰 앞뒤에 기존 브라우저·기기 User-Agent 토큰이 있어도 `true`입니다.

## 사용 제한

- 이 결과는 앱 전용 UI 또는 네이티브 기능 사용 가능성 판별에 사용합니다.
- 인증, 인가, 앱 요청 증명에는 사용하지 않습니다.
- Safe Area와 같은 동적 값은 이 계약에 추가하지 않습니다.
