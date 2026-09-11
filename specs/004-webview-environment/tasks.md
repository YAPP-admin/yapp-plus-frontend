# Tasks: WebView 실행 환경 식별

**Input**: Design documents from `/specs/004-webview-environment/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/user-agent.md, quickstart.md

**Tests**: 공용 판별 계약은 테스트를 먼저 추가하고 실패를 확인한 뒤 구현합니다. 기존 Safe Area 계약은 기존 테스트로 보존을 확인합니다.

**Organization**: 각 작업은 사용자 스토리별로 독립 검증할 수 있게 구성합니다.

## Phase 1: Setup

**Purpose**: 공용 계약과 변경 범위를 구현 전에 고정합니다.

- [x] T001 `YAPPPlusWebView` 토큰과 판별 규칙을 `specs/004-webview-environment/contracts/user-agent.md`에 확정한다.

---

## Phase 2: Foundational

새 의존성이나 기반 구조는 필요하지 않습니다. 기존 `@yapp-plus/app-bridge` 공개 진입점과 모바일 WebView를 그대로 사용합니다.

---

## Phase 3: User Story 1 - 앱 WebView 구분 (Priority: P1) 🎯 MVP

**Goal**: 일반 웹과 YAPP Plus 앱 WebView를 공용 규칙으로 구분합니다.

**Independent Test**: 정확한 독립 토큰, 비슷한 문자열, 빈 입력을 판별해 기대 결과와 일치하는지 확인합니다.

- [x] T002 [US1] 앱 토큰의 일치·불일치·빈 입력 테스트를 `packages/app-bridge/tests/user-agent.test.ts`에 먼저 추가하고 구현 전 실패를 확인한다.
- [x] T003 [US1] 공용 토큰과 `isYappPlusWebViewUserAgent()`를 `packages/app-bridge/src/index.ts`에 구현한다.
- [x] T004 [US1] `apps/mobile/app/index.tsx`의 WebView에 공용 토큰을 `applicationNameForUserAgent`로 적용한다.

**Checkpoint**: 공용 패키지 테스트와 모바일 타입 검사로 User Story 1을 독립 검증합니다.

---

## Phase 4: User Story 2 - 실행 환경별 Safe Area 유지 (Priority: P2)

**Goal**: 일반 브라우저 fallback과 앱 WebView의 동적 Safe Area 전달이 기존대로 동작함을 확인합니다.

**Independent Test**: 일반 브라우저, 앱 초기값, 브리지 변경값 시나리오를 기존 패키지 테스트로 검증합니다.

- [x] T005 [US2] `packages/app-bridge/tests/install-safe-area.test.ts`와 `packages/app-bridge/tests/safe-area.test.ts`의 기존 Safe Area 시나리오를 실행해 전달 경로가 유지되는지 확인한다.

**Checkpoint**: User Story 1 변경 후에도 User Story 2 테스트가 독립적으로 통과합니다.

---

## Phase 5: User Story 3 - 전달 방식의 근거 확인 (Priority: P3)

**Goal**: 식별자와 Safe Area 전달을 분리한 이유와 참고 근거를 저장소에 남깁니다.

**Independent Test**: 문서만으로 선택한 방식, 제외한 대안, 보안 제한과 참고 자료를 확인할 수 있습니다.

- [x] T006 [US3] 의사결정 배경, 대안과 출처를 `docs/decisions/webview-environment-and-safe-area.md`에 기록한다.

**Checkpoint**: 문서가 실제 공용 계약 및 모바일 설정과 일치합니다.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 전체 계약과 배포 가능한 앱의 품질 게이트를 검증합니다.

- [x] T007 `specs/004-webview-environment/quickstart.md`에 정의한 `node --run check`, `node --run build`, `node --run expo:doctor`를 실행한다.

---

## Dependencies & Execution Order

- **T001**은 모든 구현보다 먼저 완료합니다.
- **T002 → T003 → T004** 순서로 테스트 실패, 공용 계약 구현, 모바일 적용을 진행합니다.
- **T005**는 User Story 1 적용 뒤 실행해 기존 Safe Area 동작을 검증합니다.
- **T006**은 확정된 구현을 기준으로 작성합니다.
- **T007**은 모든 사용자 스토리 완료 후 실행합니다.

## Parallel Opportunities

공용 계약과 모바일 적용이 같은 공개 API에 의존하므로 T001부터 T005까지 순차 실행합니다. T006 문서 작성은 구현과 병행할 수 있지만 최종 내용은 실제 구현과 다시 대조합니다.

## Implementation Strategy

1. User Story 1의 실패 테스트와 최소 구현으로 WebView 구분 계약을 완성합니다.
2. 기존 Safe Area 테스트로 전달 경로가 변하지 않았음을 확인합니다.
3. 실제 선택과 일치하는 의사결정 문서를 작성합니다.
4. 저장소 전체 품질 게이트와 Expo Doctor를 통과시킵니다.
