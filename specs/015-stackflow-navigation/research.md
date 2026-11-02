# 조사 결과: Stackflow 기반 웹 내비게이션 전환

## 조사 기준

- 기준 commit: `origin/main` / `98ee1b9ab0b4b62b76d0e477ef645a92e3b0c7f4`
- 확인일: 2026-11-01
- 관련 issue: [#259](https://github.com/YAPP-admin/yapp-plus-frontend/issues/259)
- 제품 맥락: [docs/mission.md](../../docs/mission.md)

## 결정 사항

### 1. SEED Stackflow 2.1과 Stackflow core/react 1.x 조합을 사용

- **결정**: `@seed-design/stackflow@2.1.0`을 UI 계층으로 사용하고, 다음 direct dependency를 `apps/web`에만 추가합니다.
  - `@stackflow/config@1.2.2`
  - `@stackflow/core@1.3.2`
  - `@stackflow/react@1.12.0`
  - `@stackflow/plugin-renderer-basic@1.1.13`
  - `@stackflow/plugin-history-sync@1.11.2`
  - `@stackflow/link@1.6.1`
  - `@stackflow/plugin-preload@1.4.4`
- **근거**: SEED Stackflow 2.1.0은 Stackflow core `>=1.1.0`, React `>=1.4.1`과 `@seed-design/css ^3.1.0`을 peer로 요구합니다. `@seed-design/stackflow`가 내부적으로 `@stackflow/react-ui-core ^1.3.3`을 사용하므로 SEED React 3.1과 Stackflow 1.x를 함께 유지할 수 있습니다.
- **대안 제외**: Stackflow 2.x core를 임의로 조합하거나 SEED Stackflow를 직접 우회하면 공식 AppScreen과 peer 계약이 깨질 수 있습니다. `packages/ui`에 의존성을 넣으면 앱 경계를 넘어 화면 lifecycle을 공유하게 되므로 제외합니다.

### 2. 공식 AppScreen은 `apps/web` 안에서 CLI로 생성

- **결정**: Stage 1에서 `apps/web/seed-design.json`을 만들고 공식 `ui:app-screen` snippet을 앱 내부에 생성합니다. AppScreen, AppBar, PullToRefresh는 앱의 navigation adapter가 직접 조합합니다.
- **근거**: AppScreen은 safe area, platform theme과 Stackflow Activity lifecycle을 함께 다루는 WebView 전용 껍데기입니다. 재사용 UI 패키지의 안정된 계약이 아니며 `packages/ui`가 Stackflow에 의존할 이유가 없습니다.
- **대안 제외**: AppScreen을 `packages/ui`로 옮기거나 공식 파일을 수정하면 앱별 Stackflow context와 SEED CLI 생성 계약이 섞입니다.

### 3. Motion과 `@stackflow/plugin-basic-ui`를 설치하지 않음

- **결정**: 화면 전환은 Stackflow renderer와 SEED theme/plugin의 공식 transition을 사용하고, 별도 Motion 의존성은 추가하지 않습니다. `@stackflow/plugin-basic-ui`도 설치하지 않습니다.
- **근거**: SEED AppScreen이 AppBar·PullToRefresh·theme을 제공하며, Stackflow renderer가 push/pop 전환 수명주기를 담당합니다. Motion을 추가하면 두 애니메이션 시스템이 같은 Activity transform을 제어할 위험이 있습니다.
- **대안 제외**: Motion으로 동일 전환을 중첩하거나 basic-ui를 추가하면 성능·reduced-motion·gesture 정책을 이중으로 관리하게 됩니다.

### 4. 호환성 스파이크를 Production 전환보다 먼저 수행

- **결정**: Stage 2는 Vite 진입점과 Home·Notices·NoticeDetail 세 Activity만 연결하고 Production route와 분리합니다. 공식 AppScreen을 수정하지 않고 typed Link, `defaultHistory`, browser back과 lazy import를 검증합니다.
- **근거**: 현재 앱은 Next App Router wrapper와 `next/navigation`에 의존하므로 한 번에 전환하면 URL·query·fallback 회귀 원인을 분리하기 어렵습니다.
- **대안 제외**: 기존 Next route에 Stackflow를 혼합 연결하는 hybrid 구조는 두 history의 소유자가 충돌하므로 선택하지 않습니다.

### 5. 탭은 replace, 상세·알림은 push/pop

- **결정**: Home·Schedule·Notices·My 탭은 실행 중 상태를 보존하는 React `<Activity>` panel을 `replaceStep`으로 바꾸고 브라우저 history와 전환 애니메이션을 만들지 않습니다. Activity가 숨겨진 panel의 Effect를 정리하므로 별도 탭별 타이머 pause 로직을 기본값으로 두지 않습니다. Alerts와 상세는 부모 화면 위에 push합니다.
- **근거**: 기존 하단 메뉴는 네 탭을 동등한 root destination으로 취급하고, 사용자가 탭을 여러 번 바꾼 뒤 시스템 뒤로가기로 탭 변경을 되감지 않기를 기대합니다.
- **대안 제외**: 탭마다 push하면 WebView system back이 탭 왕복을 재생해 기존 UX와 달라집니다.

### 6. React Activity와 SEED Tabs의 경계

- **결정**: URL을 소유하는 하단 메뉴는 현재의 typed `Link`를 유지하고, 탭 panel의 생명주기는 React `<Activity>`가 담당합니다. SEED Tabs는 local tab control이 필요한 화면에서만 사용하며, 사용할 때는 `unmountOnExit={false}`를 명시해 Activity가 보존할 state·DOM을 제거하지 않도록 합니다.
- **근거**: React 19.2의 Activity는 숨겨진 children의 state·DOM을 보존하면서 Effect를 정리합니다. SEED Tabs는 `value`, `lazyMount`, `unmountOnExit`를 제공하지만 URL·history 정책은 제공하지 않습니다.
- **대안 제외**: SEED Tabs를 URL navigation의 단일 소유자로 사용하면 Stackflow history와 Link 동작이 중복될 수 있습니다.

### 7. 플랫폼 문맥과 모션 정책

- **결정**: `User-Agent`의 `YAPPPlusWebView`와 표준 iOS/Android token을 조합해 `ios | android | web`을 판별하고 Stack `initialContext`에 전달합니다. iOS는 Cupertino+slide+swipe, Android는 Android transition+no swipe, web은 Cupertino layout+fade+no swipe입니다. reduced-motion은 모든 transition/fade/swipe를 제거합니다.
- **근거**: 현재 iOS 셸은 `applicationNameForUserAgent="YAPPPlusWebView"`를 사용하고 Android 셸은 별도 프로젝트입니다. 플랫폼 필드는 브리지 상태에 중복 저장하지 않고 UA를 단일 입력으로 유지합니다.
- **대안 제외**: 브리지에 플랫폼 필드를 추가하면 Android·iOS 네이티브 계약을 동시에 갱신해야 하고 두 진실 공급원이 생깁니다.

### 8. safe-area는 기존 브리지 계약을 확장하되 한 번만 적용

- **결정**: Stage 8에서 기존 `--safe-area-inset-*`에 SEED 변수 alias를 추가하고 AppScreen content가 좌우·상단 inset을 소유합니다. PageShell의 중복 padding은 제거하고, 브리지 응답 전에는 WebKit `env()` fallback을 사용합니다.
- **근거**: `packages/app-bridge`는 native 상태를 기존 변수와 `--seed-safe-area-*`에 함께 반영하고, WebView 초기 hydration 전에는 `env()` fallback을 제공합니다. SEED AppScreen은 `--seed-safe-area-*`를 사용합니다.
- **대안 제외**: WebView와 AppScreen에 각각 padding을 남기면 노치·홈 인디케이터 여백이 두 번 적용됩니다. 하단 메뉴의 home-indicator 영역은 AppScreen의 `layerOffsetBottom`과 중복하지 않습니다.

## 공식 문서와 근거

- [SEED Stackflow 시작하기](https://seed-design.io/react/stackflow/getting-started)
- [SEED AppScreen](https://seed-design.io/react/stackflow/app-screen)
- [SEED v3 업그레이드 안내](https://seed-design.io/llms/react/updates/upgrade/v3.txt)
- [Stackflow 소개](https://stackflow.so/docs/get-started/introduction)
- [Stackflow history sync](https://stackflow.so/docs/advanced/history-sync)
- [Stackflow Next 예시](https://github.com/daangn/stackflow-example-nextjs)
- [Vercel Vite 배포](https://vercel.com/docs/frameworks/frontend/vite)

## 검증된 현재 상태

- `packages/ui`와 `apps/web`에 Stackflow 패키지는 아직 없습니다.
- `@seed-design/react`, `@seed-design/css`는 3.1 계열입니다.
- 현재 BackButton은 `NavigationHistory`가 내부 이력을 확인한 뒤 `router.back()` 또는 route별 `router.replace(fallback)`을 실행합니다.
- iOS WebView는 `useSafeAreaInsets()`의 safe-area inset을 브리지로 전달하고, 웹은 native 응답 전 `env()`와 응답 후 두 CSS 변수 계약을 사용합니다.
- 실제 부팅된 iOS Simulator는 없어 Stage 0에서 WebView 제스처를 직접 실행하지 못했습니다. 이 위험은 [validation.md](./validation.md)에 남기고 Stage 2 이후 실제 Simulator/기기 검증을 승인 조건으로 둡니다.
