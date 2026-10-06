# 작업 목록: 관리자 로그인

## 1단계 — 명세

- [x] T001 `specs/007-admin-login/`에 명세·계획·계약·검증 시나리오를 작성한다.

## 2단계 — 의존성과 기반

- [x] T002 `pnpm-workspace.yaml`, `apps/admin/package.json`, `pnpm-lock.yaml`에 폼·테스트 의존성을 연결한다.

## 3단계 — US1 로그인 화면 (P1)

독립 검증: 로그인 직접 접근과 반응형 화면, 대시보드 기존 내용을 확인한다.

- [x] T003 [US1] `apps/admin/src/routes/login.test.tsx`에 라우팅·화면 테스트를 작성한다.
- [x] T004 [US1] `apps/admin/src/routes/__root.tsx`, `_dashboard.tsx`, `_dashboard.index.tsx`로 헤더와 대시보드를 분리한다.
- [x] T005 [US1] `apps/admin/src/features/login/login-form.css.ts`, `login-form.tsx`에 Figma 화면과 입력을 구현한다.

## 4단계 — US2 검증과 모의 로그인 (P1)

독립 검증: 모의 계정 성공·실패·재시도와 프로덕션 비활성 동작을 확인한다.

- [ ] T006 [US2] `apps/admin/src/features/login/login-form.test.tsx`에 폼 상태·오류·제출 테스트를 작성한다.
- [ ] T007 [US2] `apps/admin/src/features/login/login-form.tsx`에 TanStack Form 검증·제출·접근성을 연결한다.
- [ ] T008 [US2] `apps/admin/src/features/login/login.mock.test.ts`, `login.mock.ts`, `login.ts`에 내부 계약과 모의 함수를 구현한다.
- [ ] T009 [US2] `apps/admin/src/routes/login.tsx`에 환경 분기·성공 이동을 연결한다.

## 5단계 — 전체 검증

- [ ] T010 `specs/007-admin-login/validation.md`에 check/build·브라우저·번들 검증 결과와 미검증 항목을 기록한다.
- [ ] T011 `specs/007-admin-login/tasks.md`와 PR 초안에 단계 완료·변경 줄 수·분리 경계를 반영한다.

## 의존성과 전달

T001 → T002 → US1 → US2 → 전체 검증 순서로 진행한다. 총 11개 작업(US1 3개, US2 4개)이다.
US1의 라우트와 CSS 조사, US2의 폼과 모의 함수 테스트 검토는 파일 경계상 독립적이지만 이번에는 순차 진행한다.
MVP는 US1 화면이며 이후 모의 동작을 연결한다. 각 단계 완료 후 사용자에게 보고한다.
문서·생성 파일을 포함한 각 PR의 추가·삭제 합계가 800줄 이상이면 stacked PR로 분리한다.
