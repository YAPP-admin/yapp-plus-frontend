# 구현 계획: Stackflow 기반 웹 내비게이션 전환

**Branch**: `DongjaJ/stacflow` | **Date**: 2026-11-01 | **Issue**: [#259](https://github.com/YAPP-admin/yapp-plus-frontend/issues/259) | **Spec**: [spec.md](./spec.md)

**Input**: `specs/015-stackflow-navigation/spec.md`

## 요약

현재 Next.js 회원 웹의 공개 URL, query, 화면별 fallback과 WebView safe-area 계약을 기준선으로 고정한 뒤, SEED AppScreen과 Stackflow 호환성 셸을 먼저 검증합니다. 스파이크가 성공할 때만 Vite 정식 전환과 화면별 Activity 이전을 진행하며, 실패하면 Next.js 구조를 유지합니다. Stackflow 의존성은 `apps/web`에만 두고 `packages/ui`는 변경하지 않습니다.

## 기술 맥락

- **언어/버전**: TypeScript 6.0.3, Node.js 24.20.0, pnpm 12.3.4
- **주요 의존성**: React 19.2.8, Next.js 16.3.4, `@seed-design/react`·`@seed-design/css` 3.1.0, 향후 `@seed-design/stackflow` 2.1.0과 Stackflow core/react 1.x
- **Storage**: 별도 저장소 없음. 탭·스크롤·필터·입력 상태는 현재 실행 메모리에만 유지
- **Testing**: Vitest, Testing Library, Oxlint, TypeScript, Next/Vite production build, Expo Doctor(모바일 계약 변경 시)
- **Target Platform**: 일반 브라우저, iOS WebView, Android WebView
- **Project Type**: 회원용 웹 애플리케이션과 iOS WebView 셸
- **Performance Goals**: 대표 화면 이동에서 60fps를 목표로 하며, lazy Activity가 초기 화면의 불필요한 코드를 로드하지 않음
- **Constraints**: 공개 URL과 문구·인증·API 정책 유지, safe-area 중복 금지, 입력 화면의 우발적 swipe 금지, Stackflow 1.x peer 호환성 유지
- **Scale/Scope**: 회원 웹 공개 경로 22개, 3개 대표 Activity 호환성 셸, 전체 화면 10개 단계 이전, Android 네이티브 구현은 별도 프로젝트

## Constitution Check

기준 commit `origin/main`/`98ee1b9ab0b4b62b76d0e477ef645a92e3b0c7f4`와 루트·`apps/web/AGENTS.md`, `docs/mission.md`를 확인했습니다.

| 원칙                      | 점검 | 근거                                                                                                                                                 |
| ------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 제품 맥락과 최소 범위     | PASS | 회원 앱의 탐색 UX만 다루며 인증·API·제품 정책은 변경하지 않습니다.                                                                                   |
| 앱과 공용 계약의 경계     | PASS | Stackflow와 AppScreen은 `apps/web` 내부에 두고 `packages/ui`에는 의존성을 추가하지 않습니다. 브리지는 `@yapp-plus/app-bridge` 공개 API를 사용합니다. |
| 재현 가능한 도구와 의존성 | PASS | Node·pnpm 고정 버전, catalog·lockfile, 공식 SEED/Stackflow peer 조합과 `--frozen-lockfile` 검증을 계획합니다.                                        |
| 변경에 가까운 검증        | PASS | 단계별 인접 테스트, `node --run check`, `node --run build`, 모바일 계약 시 `node --run expo:doctor`를 기록합니다.                                    |
| 검토 가능한 변경과 복구   | PASS | 리뷰 게이트마다 멈추고 commit·push 없이 검토하며, 호환성 실패 시 Next 구조를 유지합니다.                                                             |

## 변경 경계와 구조 결정

```text
apps/web/
├── app/                       # Stage 9까지 호환 wrapper를 단계적으로 제거
├── src/app/navigation/        # Stackflow adapter, typed link, history/fallback 정책
├── src/app/layouts/           # AppScreen/AppBar/TabsActivity shell
├── src/activities/             # lazy Activity와 화면별 options
└── vite.config.ts             # Stage 2 셸, Stage 9 정식 전환

packages/app-bridge/
└── src/                       # safe-area 공개 계약만 Stage 8에서 확장

apps/mobile/
└── src/bridge.ts               # iOS WebView inset 전달, Android는 별도 Native 프로젝트

specs/015-stackflow-navigation/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── validation.md
└── contracts/navigation.md
```

**구조 결정**: AppScreen은 웹 앱의 WebView 전용 화면 껍데기이므로 `apps/web`에 설치·생성합니다. `packages/ui`는 두 앱 이상에서 안정적으로 소비되는 디자인 계약만 관리하며 Stackflow의 화면 생명주기와 history에 의존하지 않습니다.

## 단계별 구현 계획과 리뷰 게이트

### 0단계 — 기준선과 Spec Kit (현재 단계)

1. `git fetch origin` 후 `origin/main`과 작업 트리를 확인하고 최신 base로 fast-forward합니다.
2. 공개 URL·query·BackButton fallback·safe-area 변수를 파일 근거와 함께 [validation.md](./validation.md)에 기록합니다.
3. `node --run check`, `node --run build`, Next 웹 번들 크기와 route 목록을 기준선으로 기록합니다.
4. iOS Simulator/실기기 사용 가능 여부를 확인하고, 불가능하면 정적 코드·브라우저 테스트와 미실행 위험을 명시합니다.
5. 이 spec, plan, research, data model, contract, quickstart를 작성합니다.

**리뷰 게이트**: URL·query·fallback 표가 맞고, 전환 범위·중단 조건·플랫폼 책임이 명확할 때만 1단계를 시작합니다.

### 1단계 — 의존성과 SEED AppScreen 설치

`apps/web`에만 SEED Stackflow 2.1.0과 호환되는 Stackflow 1.x 의존성을 설치하고 catalog·lockfile을 갱신합니다. `apps/web/seed-design.json`과 공식 `ui:app-screen` 스니펫을 생성하며 `packages/ui`, Motion, `@stackflow/plugin-basic-ui`는 변경하지 않습니다. CLI compat, TypeScript와 peer 의존성을 검증합니다.

**리뷰 게이트**: 설치 버전과 peer 경고가 정확히 맞고 공식 스니펫 타입 검사가 통과해야 합니다.

### 2단계 — 최소 Vite·Stackflow 호환성 셸

Production과 연결하지 않는 Vite 진입점에 React Compiler, Vanilla Extract, SEED Vite plugin, renderer/history-sync/SEED plugin을 연결합니다. Home·Notices·NoticeDetail 세 Activity, lazy import, typed Link, AppBarBackButton stable hook, `defaultHistory` 직접 진입을 검증합니다.

**중단 조건**: 공식 AppScreen을 수정해야 하거나 URL·Stack 상태·직접 진입이 일치하지 않으면 전체 전환을 중단하고 Next 구조를 유지합니다.

### 3단계 — 플랫폼·모션·접근성 기반

User-Agent에서 `ios | android | web`을 판별하여 initialContext로 전달하고, iOS Cupertino+slide+swipe, Android transition+no swipe, Web Cupertino layout+fade+no swipe 정책을 적용합니다. `useAppScreenOptions`, reduced-motion 전역 plugin, 비활성 Activity pause, focus 진입·복원을 적용합니다. Motion 의존성은 추가하지 않습니다.

### 4단계 — 탭·Alerts·history 구조

Home·Schedule·Notices·My를 TabsActivity의 lazy panel로 구성하고, 각 panel은 React 19 `<Activity>`로 표시·숨김을 제어합니다. `Activity`는 방문한 탭의 state·DOM을 유지하면서 숨겨진 panel의 Effect를 정리합니다. 탭 전환은 `replaceStep`으로 history·애니메이션을 만들지 않습니다. 실행 중 탭별 상태를 유지하고 Alerts를 Home 위의 step으로 복원합니다. unknown surface는 NotFound로 처리합니다.

SEED Tabs의 `lazyMount`·`unmountOnExit`는 panel 마운트 정책과 중복될 수 있으므로, 하단 메뉴처럼 URL을 소유하는 현재 navigation Link에는 강제로 적용하지 않습니다. SEED Tabs UI를 별도 local tab control로 도입할 때만 `unmountOnExit={false}`와 Activity 경계를 함께 검토합니다.

### 5단계 — 공지 대표 흐름 완성

공지 목록·상세·필터·스크롤을 이전하고 `/notices/:noticeId` 직접 진입 시 Notices를 복원합니다. 존재하지 않는 ID, iOS swipe, Android theme, browser back을 검증하고 관련 Next API와 테스트를 이전합니다.

### 6단계 — 마이·출석·팀 출석·설정

My → Attendance → Attendance rules → Attendance complete → Settings → Team upload → Team error/complete 순서로 이전합니다. 기존 fallback은 `defaultHistory`로 옮기고 Signup·Team upload swipe를 차단하며, 정상 완료 흐름과 직접 진입 흐름의 Upload 하위 스택 정책을 구분합니다.

### 7단계 — 로그인·가입·오류 화면

Login, Login error, Signup, Signup status, Signup complete, Signup unregistered, NotFound와 개발 route를 이전합니다. 직접 진입 fallback, 입력 화면 swipe 차단, title, lazy import 오류 연결을 유지합니다.

### 8단계 — safe area와 Native 계약

브리지에서 `--safe-area-inset-*`과 `--seed-safe-area-*`를 함께 갱신하고 중복 PageShell padding을 제거합니다. `viewport-fit=cover`, iOS WebView 실환경과 노치·홈 인디케이터를 검증하고 Android 팀용 User-Agent·`canGoBack`·`webView.goBack()`·root back·deep link 계약 문서를 작성합니다.

### 9단계 — Next 제거와 Vite 정식 전환

Next route wrapper, `next`, Next 전용 plugin·config·type generation·lint 예외와 `next/link`·`next/image`·`next/navigation` 잔여 사용을 제거합니다. Vite script와 `VITE_API_MOCKING`, README·웹 개발 문서를 정식 구조로 갱신합니다.

### 10단계 — Vercel Preview와 최종 검증

Vercel framework/output을 Vite/`dist`와 SPA rewrite로 전환하고 공개 URL 직접 진입·새로고침, check/build/expo doctor, 플랫폼·접근성·safe-area 체크리스트를 완료합니다. 임시 스파이크를 제거하고 남은 기술 부채와 최신 major 업그레이드 조건을 기록합니다.

## 복구 전략

- Stage 2 호환성 셸 실패: Production 연결과 이후 전환을 하지 않고 기존 Next 경로를 유지합니다.
- 특정 Activity 실패: 해당 단계의 Activity·adapter·테스트 변경만 되돌리고 승인된 이전 단계 산출물을 유지합니다.
- safe-area 계약 실패: 새 CSS 변수 쓰기를 중단하고 기존 `--safe-area-inset-*` 계약으로 돌아갑니다.
- 최종 Vite/Preview 실패: Next route wrapper와 Vercel Next 설정을 제거하지 않은 상태를 유지하고 별도 수정 후 재검토합니다.

## 설계 후 헌법 재점검

`research.md`, `data-model.md`, `contracts/navigation.md`, `quickstart.md` 작성 후에도 모든 원칙은 통과합니다. 새 공용 패키지나 데이터 모델을 만들지 않고, 브리지·URL·네이티브 연동 변경은 계약 문서와 단계별 검증으로 제한합니다.

## 복잡성 추적

헌법 위반이나 별도 정당화가 필요한 복잡성은 없습니다. Vite 호환성 셸은 Production 경로에 연결하지 않는 스파이크이므로 Stage 2 승인 전까지 임시 산출물로 취급합니다.
