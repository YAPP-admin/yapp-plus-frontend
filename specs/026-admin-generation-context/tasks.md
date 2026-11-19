# 작업 목록: 관리자 기수 선택과 세션 연결

**입력**: [명세](spec.md), [계획](plan.md), [조사](research.md), [모델](data-model.md), [계약](contracts/generation-context.md)
**상태**: 5단계 통합 검증·운영 문서 갱신 완료.
테스트는 명세의 수용 조건과 저장소 규칙에 따라 포함한다. 단계마다 리뷰 후 진행한다.

## 1단계 — 준비와 문서

- [x] T001 `specs/026-admin-generation-context/spec.md`에 범위·사용자 시나리오·성공 기준을 작성한다.
- [x] T002 `specs/026-admin-generation-context/plan.md`, `research.md`, `data-model.md`, `contracts/generation-context.md`, `quickstart.md`에 설계·복구·검증 절차를 작성한다.
- [x] T003 `specs/026-admin-generation-context/issue-draft.md`에 저장소 템플릿 기반 이슈 초안을 작성한다.
- [x] T004 `specs/026-admin-generation-context/issue-draft.md`의 생성 승인을 받고 이슈 번호를 `spec.md`에 연결한다. 사용자가 이슈 생략을 명시하면 그 결정을 기록한다.
- [x] T005 `specs/026-admin-generation-context/validation.md`에 문서 검사·check 결과를 기록하고 1단계 리뷰·2단계 진행 확인을 받는다.

## 2단계 — 공통 API 기반

목표: 최신 계약을 생성하고 기존 기능을 유지한다. 기수 UI는 아직 연결하지 않는다.
독립 검증: 생성 경로별 operation 대응과 기존 소비자 테스트·check/build.

- [x] T006 `.context/admin-generation-openapi.json`에 최신 명세를 확보하고 해시를 `specs/026-admin-generation-context/validation.md`에 기록한다.
- [x] T007 `packages/api/src/generated/`를 기존 생성 명령으로 갱신하고 수동 편집 없이 계약 diff를 검토한다.
- [x] T008 `packages/api/src/mocks/handlers.ts`, `apps/admin/src/`, `apps/web/src/`의 변경된 생성 이름 소비자를 경로 기준으로 수정한다.
- [x] T009 `packages/api/src/mocks/fixtures.ts`와 `handlers.ts`에 서로 다른 ID·번호를 가진 두 기수의 정상 목록 응답을 연결한다.
- [x] T010 `specs/026-admin-generation-context/validation.md`에 관련 테스트·check/build·변경량을 기록하고 리뷰받는다.

## 3단계 — US1 최신 기수에서 시작 (P1)

목표: 로그인 후 최신 기수의 세션 CRUD와 상태 안내를 사용할 수 있다.
독립 검증: 토큰이 있는 진입부터 기수·세션 요청까지, 미로그인·잘못된 응답·오류에서는 전역 경계가
작업 영역을 대체하고 세션 요청을 차단.

- [x] T011 [US1] `apps/admin/src/features/admin-generation/model/admin-generation.test.tsx`에 기본 선택·응답 검증·오류 throw·재시도 회귀 테스트를 작성한다.
- [x] T012 [US1] `apps/admin/src/features/admin-generation/model/admin-generation.tsx`와 `index.ts`에 생성 옵션·응답 검증·Suspense Provider·공개 훅을 구현한다.
- [x] T013 [US1] `apps/admin/src/features/login/admin-session.ts`와 `index.ts`에 `clearAdminAccessToken` 공개 함수를 추가한다. `apps/admin/src/app/ui/admin-generation-boundary.tsx`에 ClientOnly·Suspense·일반 오류 재시도·401 전용 token 삭제/Query 제거/로그인 이동 경계를 만들고, `apps/admin/src/routes/_dashboard/route.tsx`에 연결한다. `apps/admin/src/routes/login.tsx`에는 로그인 성공 후 Query 취소·제거를 연결한다.
- [x] T014 [US1] `apps/admin/src/app/ui/admin-sidebar.tsx`에 실제 기수 표시와 상태 안내를 연결한다.
- [x] T015 [US1] `apps/admin/src/routes/_dashboard/sessions.tsx`에서 Context가 보장한 유효한 ID를 세션 화면에 전달한다. `apps/admin/src/pages/sessions/`의 환경 설정 함수·테스트·공개 export와 `apps/admin/.env.example`의 기수 변수를 제거한다.
- [x] T016 [US1] `apps/admin/src/router.test.tsx`에 로그인·재로그인 캐시 초기화·토큰 없음과 401의 access token 삭제 및 즉시 로그인 이동·미확정 요청 차단을 검증하고 기존 세션 테스트를 실제 기수 공급에 맞춘다.
- [x] T017 [US1] `specs/026-admin-generation-context/validation.md`에 관련 테스트·check/build·변경량·화면 근거를 기록하고 리뷰받는다.

## 4단계 — US2 기수 전환 (P2)

목표: 선택 기수를 바꿔도 세션 데이터와 이전 화면 작업이 섞이지 않는다.
독립 검증: 두 기수 전환·메뉴 왕복·지연 완료와 모바일 패널 내 선택.

- [x] T018 [US2] `apps/admin/src/app/ui/admin-shell.test.tsx`에 기수 선택·화면 이동 유지·모바일 선택 테스트를 작성한다.
- [x] T019 [US2] `apps/admin/src/app/ui/admin-sidebar.tsx`에 기존 SEED Select 패턴으로 선택 UI를 구현한다.
- [x] T020 [US2] `apps/admin/src/app/ui/admin-overlay-provider.tsx`와 `apps/admin/src/pages/sessions/ui/sessions-page.tsx`에 세션 경로의 기수별 초기화 경계를 연결한다.
- [x] T021 [US2] `apps/admin/src/pages/sessions/ui/sessions-page.test.tsx`와 `apps/admin/src/app/ui/admin-overlay-provider.test.tsx`에 지연 완료·모달 폐기·기수별 CRUD/무효화 회귀 테스트를 추가한다.
- [x] T022 [US2] `apps/storybook/stories/admin-generation-select.stories.tsx`에 기수 선택에 사용하는 SEED Select의 정상·긴 이름·여러 기수 상태 사례를 추가한다. 다른 앱 코드를 import하지 않으며 실제 관리자 연결은 앱 테스트로 검증한다.
- [x] T023 [US2] `specs/026-admin-generation-context/validation.md`에 키보드·스크린 리더·터치·check/build·변경량을 기록하고 리뷰받는다.

## 5단계 — 통합 검증과 운영 문서

- [x] T024 `apps/admin/README.md`와 `packages/api/README.md`에 최신 생성 계약·기수 조회·환경 설정 변경을 반영한다. 과거 명세의 검증 기록은 보존한다.
- [x] T025 `specs/026-admin-generation-context/quickstart.md`의 전체 흐름을 검증하고 `validation.md`에 새 실행·캐시 재사용·미실행을 구분한다.
- [x] T026 `specs/026-admin-generation-context/validation.md`에 승인된 실서버 확인 범위 또는 미실행 사유·복구 방법을 기록하고 최종 리뷰받는다.

## 의존성과 실행 순서

1단계 리뷰 → 2단계 계약 → 3단계 US1 → 4단계 US2 → 5단계 순서로 진행한다.
최소 사용 가능한 결과는 3단계다. 이후 사용자 확인 없이 다음 단계 구현을 시작하지 않는다.
US1은 Provider 상태 테스트와 기존 CRUD 회귀 테스트를, US2는 모바일 선택과 지연 요청 시나리오를
독립적으로 실행할 수 있다. 같은 라우트·Provider를 함께 수정하므로 구현 작업은 순차 진행한다.
작업 목록의 단계 통과는 commit·push·PR 생성 승인을 의미하지 않는다.
