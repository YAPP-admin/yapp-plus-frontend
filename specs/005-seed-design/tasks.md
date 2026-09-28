# 작업 목록: Seed Design 기반 웹 UI 전환

**입력**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md),
[data-model.md](./data-model.md), [계약](./contracts/ui.md), [검증 가이드](./quickstart.md)

**현재 상태**: 사용자 1~3단계 완료·승인. 4단계 문서 리뷰 대기. 5단계 이후 미시작.

작업 번호는 실행 순서다. `[P]`는 같은 승인 단계 안에서 서로 다른 파일로 독립 수행할 수 있다는 뜻이며
다음 단계 승인이나 에이전트 추가 실행 권한을 뜻하지 않는다. 작업 체크와 사용자 승인을 구분한다.
테스트는 이번 명세에서 요구한 공용 계약·상태·회귀에 한정한다.

## 준비 — 사용자 1~4단계

- [x] T001 `mise.toml`, `mise.lock`, `package.json`의 고정 환경을 준비하고 `feat/seed-design` 생성 및 기존 check 결과를 확인한다.
- [x] T002 `.github/ISSUE_TEMPLATE/feature-request.md`를 기준으로 승인된 이슈 #28을 생성하고 내용을 재조회한다.
- [x] T003 `.agents/skills/seed-design/`에 사용자 지정 명령으로 공식 스킬을 설치하고 `skills-lock.json`과 check 결과를 확인한다.
- [x] T004 `specs/005-seed-design/`에 공식 지침을 반영한 설계·계약·작업 목록과 `checklists/requirements.md`를 작성·검토한다.

**중단 지점**: 이 문서까지 4단계 결과로 보고한다. 사용자 리뷰 승인 전 T005를 실행하지 않는다.

## 기반 설정 — 사용자 5단계, 모든 사용자 스토리의 선행 조건

- [ ] T005 `pnpm-workspace.yaml`, `packages/ui/package.json`, `apps/web/package.json`, `apps/admin/package.json`, `apps/storybook/package.json`에 계약의 Seed 버전을 선언하고 `pnpm-lock.yaml`을 갱신한다. UI는 peer+dev, 앱은 catalog 소비로 정렬한다.
- [ ] T006 `packages/ui/seed-design.json`에 React·TSX·RSC·스니펫 경로·telemetry 설정을 작성한다.

## US1 — 공용 ActionButton 제공, 사용자 5단계 (P1)

**목표**: 공식 스니펫으로 공용 버튼을 제공한다. 기존 소비자를 깨뜨리지 않고 새 API를 검증한다.
**독립 검증**: 공용 버튼 테스트·CLI compat. 최소 제공 단위는 이 스토리지만 전체 완료 범위를 줄이지 않는다.

- [ ] T007 [US1] `packages/ui/src/action-button.test.tsx`에 클릭, disabled, loading과 disabled의 독립성, 접근 가능한 이름, ref와 명시한 type 전달 테스트를 작성한다. 구현 전 실패를 확인한다.
- [ ] T008 [US1] CLI 1.7.0으로 `packages/ui/src/seed-design/ui/`에 ActionButton과 필수 loading-indicator·progress-circle을 생성하고 `packages/ui/package.json`의 의존성 소유권을 재확인한다.
- [ ] T009 [US1] `packages/ui/src/index.ts`에서 ActionButton과 타입을 공개한다. 기존 Button·theme·전역 스타일은 6단계 소비자 이전까지 유지한다.
- [ ] T010 [US1] `packages/ui/seed-design.json` 기준 compat와 새 버튼 테스트, 루트 `package.json`의 check·build를 실행하고 5단계 결과를 보고한다.

**중단 지점**: 5단계 사용자 리뷰 승인 전 T011 이후를 실행하지 않는다.

## US2 — 기존 화면 전환, 사용자 6단계 (P1)

**목표**: 기존 콘텐츠와 배치를 유지하면서 Seed 토큰·CSS로 전환한다.
**독립 검증**: 웹 홈·관리자 대시보드 테스트와 각각의 화면 확인.

- [ ] T011 [US2] `apps/web/src/app/page.test.tsx`, `apps/admin/src/routes/index.test.tsx`에서 기존 제목·문구·빈 상태의 의미 구조를 확인하고 필요한 회귀 검증만 보강한다.
- [ ] T012 [US2] `packages/ui/src/global.css.ts`의 자체 테마 선언을 Seed 공개 토큰으로 바꾸고 컴포넌트 스타일을 덮는 전역 폼 규칙을 제거한다. 앱 기본 스타일의 책임은 유지한다.
- [ ] T013 [P] [US2] `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.css.ts`에 base.css 로딩과 Seed 토큰·서체 규격을 적용한다. `apps/web/src/app/global.css.ts` 연결과 기존 safe-area를 보존한다.
- [ ] T014 [P] [US2] `apps/admin/src/routes/__root.tsx`, `apps/admin/src/routes/__root.css.ts`, `apps/admin/src/routes/index.css.ts`에 base.css 로딩과 Seed 토큰·서체 규격을 적용한다.

## US3 — 시스템 테마, 사용자 6단계 (P1)

**목표**: 서버·브라우저 경계를 지키며 초기 테마와 실행 중 변경을 처리한다.
**독립 검증**: 공용 스크립트 테스트와 각 문서의 초기 테마·양방향 변경.

- [ ] T015 [US3] `packages/ui/src/theme-script.test.ts`에 최초 light/dark, 양방향 change, addListener, 감지 부재·실패·구독 부재와 서버 import 안전성 테스트를 작성한다. 구현 전 실패를 확인한다.
- [ ] T016 [US3] `packages/ui/src/theme-script.ts`에 자체 완결 `seedThemeScript` 문자열을 구현하고 `packages/ui/package.json`에 전용 공개 진입점을 추가한다.
- [ ] T017 [P] [US3] `apps/web/src/app/layout.tsx`의 문서 속성·head 스크립트·color-scheme을 연결하고 문서 루트 속성 차이에만 hydration 예외를 적용한다.
- [ ] T018 [P] [US3] `apps/admin/src/routes/__root.tsx`에 동일 계약을 연결한다. 클라이언트 라우트 이동마다 스크립트를 재등록하지 않는다.
- [ ] T019 [P] [US3] `apps/storybook/.storybook/main.ts`의 previewHead에 같은 스크립트와 color-scheme을 연결하고 `apps/storybook/.storybook/preview.tsx`에서 base.css를 로드한다.

## US4 — 컴포넌트 검토 환경, 사용자 6단계 (P2)

**목표**: 새 API와 상태를 Storybook에서 재현한다.
**독립 검증**: 각 스토리가 라이트·다크에서 표시되고 controls와 접근성 검토가 가능하다.

- [ ] T020 [US4] `apps/storybook/stories/button.stories.tsx`를 ActionButton 사례로 교체한다. brandSolid·neutralWeak, small·medium, disabled, loading, loading+disabled를 표현하고 비제출 type을 명시한다.

## 전환 정리 — 사용자 6단계 종료

- [ ] T021 `packages/ui/src/index.ts`, `packages/ui/package.json`에서 옛 Button·ButtonProps·theme 진입점을 제거하고 `packages/ui/src/button.tsx`, `button.css.ts`, `button.test.tsx`, `theme.css.ts`를 정리한다. 모든 소비자의 옛 참조가 없는지 확인한다.
- [ ] T022 `package.json`의 check·build와 `packages/ui` 테스트를 실행해 6단계 결과를 보고한다.

**중단 지점**: 6단계 사용자 리뷰 승인 전 통합 검증 단계 T023을 시작하지 않는다.

## 통합 검증 — 사용자 7단계

- [ ] T023 `specs/005-seed-design/quickstart.md`의 최종 compat·check·build·의존성 버전 확인을 실행하고 결과를 `.context/seed-design-validation.md`에 기록한다.
- [ ] T024 `specs/005-seed-design/quickstart.md`에 따라 세 환경의 초기·실시간 테마, hydration, 390px·1280px 배치와 웹 safe-area를 검증하고 `.context/seed-design-validation.md`에 근거를 남긴다.
- [ ] T025 `specs/005-seed-design/quickstart.md`의 키보드·터치·스크린 리더 확인을 수행하고 `.context/seed-design-validation.md`에 실제 확인 방법과 미실행 항목을 구분한다.
- [ ] T026 `apps/storybook/storybook-static/`과 web·admin 프로덕션 산출물에서 CSS·테마를 확인하고 `.context/seed-design-validation.md`에 기록한다. 7단계 결과를 보고한다.

**중단 지점**: 7단계 사용자 리뷰 승인 전 문서 마무리 T027을 시작하지 않는다.

## 문서와 인계 — 사용자 8단계

- [ ] T027 `README.md`에 공식 스킬 설치 명령, 공용 API·CSS·테마 책임, 스니펫 추가·검증 방법과 지원 Seed 범위를 기록한다.
- [ ] T028 `.context/seed-design-validation.md`의 실제 결과를 `specs/005-seed-design/validation.md`로 정리하고 `specs/005-seed-design/tasks.md`·`plan.md` 상태를 갱신한다. 문서 포맷과 최종 diff를 확인해 리뷰를 요청한다.

## 의존 관계와 단계별 실행

```text
T001~T004 → 4단계 리뷰
  → T005~T010 (US1) → 5단계 리뷰
  → T011~T014 (US2) → T015~T019 (US3) → T020 (US4) → T021~T022 → 6단계 리뷰
  → T023~T026 → 7단계 리뷰
  → T027~T028 → 최종 리뷰
```

US2는 토큰 전환을 단독 확인할 수 있지만 US3와 함께 6단계 결과로 검토한다. US4는 US1과 US3에 의존한다.
테스트는 필요한 계약을 먼저 정의하고 구현 후 통과를 확인한다. 사용자 리뷰 완료를 자동으로 가정하지 않는다.

## 병행 가능한 작업 예시

- US1: 설정→테스트→스니펫→export 순서가 필요해 구현 병행을 지정하지 않는다.
- US2: T012 후 T013 웹과 T014 관리자 스타일은 파일이 달라 병행할 수 있다.
- US3: T016 후 T017·T018·T019의 앱 연결은 서로 독립적이다.
- US4: 하나의 스토리 파일을 다루므로 순차 수행한다.
- 통합 검증은 실행 환경이 준비된 뒤 독립 브라우저 시나리오를 나눌 수 있으나 결과 기록 파일은 순차 작성한다.

## 요구사항 추적

| 요구사항                  | 작업                                 |
| ------------------------- | ------------------------------------ |
| FR-001 공식 스킬          | T003, T004                           |
| FR-002 버튼               | T007~T010, T020                      |
| FR-003 전체 UI 전환       | T005, T012~~T014, T019~~T021         |
| FR-004 기존 동작          | T011, T013, T014, T024               |
| FR-005·FR-006 테마·기본값 | T015~T019, T024                      |
| FR-007 접근성             | T007, T020, T025                     |
| FR-008 사례·문서          | T020, T027, T028                     |
| FR-009 리뷰 경계          | 각 중단 지점, T010, T022, T026, T028 |

## 실행 제한

4단계 승인 전 제품 코드·의존성·스니펫을 변경하지 않는다. 이 목록은 GitHub 이슈 수정, commit,
push, PR, 배포를 승인하지 않는다. 각 단계에서 작업 결과·변경 파일·검증 결과를 보고한 뒤 멈춘다.
