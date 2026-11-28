# 실행·환경·공개 브리지 계약

## 앱 생명주기

기존 AppBridgeState에 `appLifecycleState?: 'active' | 'inactive' | 'background' | 'unknown'`을 추가한다.
네이티브 AppState 초기값·변화를 전달하고 웹은 기존 브리지 신뢰 경계에서 검증한다. 새로운 필수 메서드·notificationOpen 필드는 추가하지 않는다.
필드가 없거나 unknown이면 document.visibilityState로 판단한다. inactive/background이면 웹 visible만으로 전면 복귀로 판단하지 않는다.
이전 웹은 추가 필드를 사용하지 않아 기존 동작을 유지하고, 새 웹+이전 native도 visibility fallback으로 동작한다.

## 웹 설정

| 설정                     | 계약                              |
| ------------------------ | --------------------------------- |
| VITE_POSTHOG_KEY         | 해당 환경 프로젝트의 공개 수집 키 |
| VITE_POSTHOG_HOST        | https://us.i.posthog.com          |
| VITE_POSTHOG_ENABLED     | 명시적 true만 활성화, 기본 false  |
| VITE_POSTHOG_ENVIRONMENT | development 또는 production       |

로컬·Preview는 development 키로 명시적 활성화한 경우만 허용한다. 모킹·fixture·테스트는 비활성화한다.
잘못된 값·키 누락 시 SDK를 초기화하지 않으며 기존 앱은 실행한다. 실제 키는 문서·테스트 로그에 남기지 않는다.
`.env.example`, 기존 Vercel 환경 설정·검증과 Turbo 입력을 함께 반영한다.

## 네이티브 설정

MOBILE_POSTHOG_KEY, MOBILE_POSTHOG_HOST, MOBILE_POSTHOG_ENABLED, MOBILE_POSTHOG_ENVIRONMENT를 기존 Expo app.config 경로로 읽고 공개 extra 값만 앱에 전달한다.
개발·운영 프로젝트 분리는 웹과 같고 iOS에서만 오류 수집을 켠다. 내부 사용자 ID를 맞추되 SDK 세션을 강제로 공유하지 않는다.
Expo extra에는 아래 CLI 업로드 키를 절대 넣지 않는다. Expo 설정 변경 테스트로 공개 값과 비밀 값의 경계를 검증한다.

## 프로젝트와 녹화

US 리전의 YAPP+ Development·YAPP+ Production을 사용한다. 운영 웹 녹화는 100%로 시작하며 프로젝트 설정에서 비율·중단을 제어한다.
모든 입력·텍스트는 기본 마스킹, 고정 버튼·메뉴만 허용한다. 사용자 이미지·동적 속성은 별도 차단한다.
자동 이벤트와 녹화 모두 URL query/hash를 제거한다. 자동 클릭에서 요소 텍스트·속성을 제한한다.
네트워크 본문·헤더·콘솔·캔버스 녹화를 끈다. 프로젝트의 오류 수집 설정이 웹 오류 자동 수집을 켜지 못하도록 웹에서 명시적으로 끈다.

## native 소스맵·심볼 업로드

POSTHOG_CLI_HOST=https://us.posthog.com, POSTHOG_CLI_PROJECT_ID와 비밀 POSTHOG_CLI_API_KEY는 CI/EAS에서 사용한다.
수집 host인 us.i.posthog.com과 관리/업로드 host를 구분한다. API 키 권한은 공식 업로드에 필요한 error_tracking:write·organization:read로 제한한다.
CLI 버전은 재현 가능하게 고정하고 JS 번들·소스맵·dSYM·release 식별을 같은 산출물 기준으로 연결한다.
기존 mobile-delivery OTA는 실제 배포할 export에 대한 업로드가 통과한 후 게시하도록 연결하며 mobile-manual native build/submit 분리는 유지한다.
토큰·소스맵을 공개 웹 산출물에 복사하지 않는다. iOS native source 전체 업로드는 켜지 않는다.
