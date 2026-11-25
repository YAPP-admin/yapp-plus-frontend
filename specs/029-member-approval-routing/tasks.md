# 작업 목록: 로그인 응답 기반 가입 승인 처리

관련 문서: [명세](spec.md) · [계획](plan.md) · [공개 계약](contracts/approval.md).
테스트는 사용자 승인 계획에 포함된다. 체크는 실제 완료만 뜻하며 단계 진행 승인은 별도다.
모든 제품 단계는 직전 단계 리뷰와 다음 단계 진행 확인 후 시작한다. 후속 진행은 대화에서 받은
사용자 확인에 따라 진행하며, 미완료 검증이 포함된 항목은 체크하지 않는다.

## 0단계 — 명세·설계·이슈 초안

목표: 확정 정책을 구현 가능한 작업으로 정리한다. 독립 검증: 문서 정합성·형식·링크와 변경량.

- [x] T001 `specs/029-member-approval-routing/spec.md`에 US1–US3와 사용자 확정 정책을 작성한다.
- [x] T002 `specs/029-member-approval-routing/research.md`에 main·이슈·API 조사와 대안 배제를 기록한다.
- [x] T003 `specs/029-member-approval-routing/plan.md`, `data-model.md`, `contracts/approval.md`에 단계·계약·수명을 작성한다.
- [x] T004 `specs/029-member-approval-routing/quickstart.md`, `checklists/requirements.md`, `tasks.md`에 검증·품질·의존성을 작성한다.
- [x] T005 `specs/029-member-approval-routing/issue-draft.md`에 저장소 템플릿을 따른 이슈 본문을 준비한다.
- [x] T006 `specs/029-member-approval-routing/validation.md`에 문서 정합성·형식·check 결과와 변경량을 기록한다.
- [x] T007 `specs/029-member-approval-routing/spec.md`에 이슈 생성 승인 후 실제 번호를 연결한다. 명시적 이슈 생략이면 해당 결정을 기록한다.
- [x] T008 `specs/029-member-approval-routing/validation.md`에 0단계 리뷰와 1단계 진행 확인을 기록한다.

## 1단계 — 공통 기반: 생성 API 계약

목표: 동작 변경 없이 새 서버 필드를 생성 계약에 반영한다. 독립 검증: 재현 가능한 생성·인증 fixture 타입 검사.

- [x] T009 `.context/approval-openapi.json`의 최신 입력·해시를 확인하고 `packages/api/src/generated/`를 공식 generate 명령으로 재생성한다.
- [x] T010 `apps/mobile/src/auth/`와 `apps/web/src/features/auth/`의 기존 인증 테스트 fixture에 APPROVED를 명시한다. 영향받은 fixture 경로는 validation.md에 기록한다.
- [x] T011 `packages/api/src/generated/`의 두 번째 재생성이 동일한지 확인하고 무관한 diff·650/800줄 경계를 검토한다.
- [x] T012 `specs/029-member-approval-routing/validation.md`에 관련 테스트·check·생성 diff 결과와 1단계 리뷰를 기록한다.

## 2단계 — US1: 계약·웹 승인 화면 분기 (P1)

목표: native fixture로 보호 내용 비노출과 상태별 화면을 검증한다. 실제 native 판정은 4단계다.

- [x] T013 [US1] `packages/app-bridge/src/index.ts`에 REVIEW_REQUIRED·필수 reviewTransition(NONE | PENDING_TO_APPROVED)과 경계 검증 스키마를 추가하고 `packages/app-bridge/tests/auth-result.test.ts`에 계약 테스트를 작성한다.
- [x] T014 [US1] `apps/web/src/features/auth/model/operations.test.ts`에서 제한 결과 확정·늦은 조회를, `native-auth.test.ts`와 공용 계약 테스트에서 구버전 결과의 NONE 정규화를 검증한다.
- [x] T015 [US1] `apps/web/src/features/auth/model/native-auth.ts`, `operations.ts`, `account.ts`, `session.tsx`, `mutations.ts`에서 새 결과 검증·캐시 정리·phase·callback을 연결한다.
- [x] T016 [US1] `apps/web/stackflow/src/activities/native-auth-redirect.tsx`, `activities.tsx`와 `apps/web/src/pages/signup/ui/signup-page.tsx`의 이동 판정을 통일해 홈·완료 화면 경쟁을 제거한다.
- [x] T017 [US1] `apps/web/stackflow/src/account-boundary.tsx`에서 제한 상태의 새 진입·pop 복원·업무 Query를 차단한다.
- [x] T018 [US1] `apps/web/stackflow/src/account-boundary.test.tsx`에서 상태별 1회 이동, 직접 URL·새 화면 진입·뒤로가기의 보호 화면 차단, 구버전 SIGNED_IN의 NONE 정규화부터 홈 이동까지 검증한다. 실제 기기 딥링크 실행은 T034에서 배포 후 확인한다.
- [ ] T019 [US1] `specs/029-member-approval-routing/validation.md`에 check·build·크기와 2단계 리뷰 결과를 기록한다.

## 3단계 — US2: 기존 뒤로가기로 로그인 복귀 (P1)

목표: 대기 화면 구성을 유지하고 확인·취소·복구를 완성한다. 독립 검증: 웹 fixture로 뒤로가기 흐름.

- [x] T020 [US2] `apps/web/stackflow/src/account-boundary.test.tsx`에 대기 뒤로가기 확인·취소·정리 실패·로그인 왕복을, `activities/signup-status-content.test.tsx`에 처리 중 중복 차단을 검증한다.
- [x] T021 [US2] `apps/web/stackflow/src/activities/activities.tsx`에서 기존 SEED Dialog·로그아웃 mutation으로 SignupStatus의 복귀를 연결한다. 필요하면 같은 디렉터리에 전용 컴포넌트를 분리한다.
- [x] T022 [US2] `apps/web/src/pages/login-error/ui/login-error-page.tsx`와 해당 Activity에 제한 상태 정리 후 Login 복귀를 연결하고 최신 main의 문의 링크를 보존한다.
- [x] T023 [US2] `apps/web/src/pages/signup-status/ui/signup-status-page.test.tsx`와 `apps/web/stackflow/src/account-boundary.test.tsx`에서 추가 버튼 없음·같은 계정 승인 완료·다른 계정 홈 이동을 검증한다.
- [ ] T024 [US2] `specs/029-member-approval-routing/validation.md`에 키보드·터치·VoiceOver, check·build·크기와 3단계 리뷰를 기록한다.

## 4단계 — native 활성화: US1·US2 연결과 US3 수명·호환 (P2)

목표: 새 로그인은 승인 상태를 판정하고 기존 세션은 유지한다. 독립 검증: native 대역으로 저장·복원·경합 제어.

### US1·US2의 실제 응답 연결

- [x] T025 [US1] 승인 분류를 소유한 `apps/mobile/src/auth/actions.test.ts`에서 로그인·가입 상태별 정상 세션 미확정·저장 없음 사례를 검증한다. 토큰 변환의 기존 검증은 `credentials.test.ts`에 유지한다.
- [x] T026 [US1] `apps/mobile/src/auth/actions.ts`, `credentials.ts`에서 로그인·가입 응답을 분류하고 APPROVED만 establish한다. INVALID_RESPONSE와 제한 결과를 구분한다.
- [x] T027 [US2] `apps/mobile/src/auth/actions.ts`에 현재 제한 결과·대기 계정 ID의 메모리 수명, 모든 SIGNED_IN의 필수 NONE 또는 같은 계정 승인 전환 1회 전달을 구현한다.
- [x] T028 [US2] `apps/mobile/src/auth/actions.test.ts`에서 다른 계정·취소·일시 실패·정리 실패·이력 소비를 검증한다.

### US3의 세션 수명과 호환

- [x] T029 [US3] `apps/mobile/src/auth/actions.ts`, `session.ts`에서 getSession·signOut·기존 세대 검사를 연결하고 제한 상태가 정상 세션으로 복구되지 않게 한다.
- [ ] T030 [US3] `apps/mobile/src/auth/session.test.ts`, `storage.test.ts`에 제한 상태 새 저장 없음·이전 세션 정리·삭제 실패·기존 저장 세션 복원 회귀 사례를 추가한다.
- [x] T031 [US3] `apps/mobile/src/notifications/`의 기존 인증 연동 테스트에서 제한 상태가 정상 로그인 후속 등록을 시작하지 않는지 검증한다.
- [ ] T032 [US3] `specs/029-member-approval-routing/validation.md`에 native·웹 연결 검증, check·build·크기와 4단계 리뷰를 기록한다.

## 5단계 — 통합 검증·배포 준비

- [ ] T033 `specs/029-member-approval-routing/quickstart.md`의 자동 시나리오를 수행하고 check·build 결과를 `validation.md`에 기록한다.
- [ ] T034 [배포 후 사용자 검증] `specs/029-member-approval-routing/validation.md`에 승인된 실기기 계정으로 Google·Apple·대기·재로그인·종료·복귀·접근성 결과를 기록한다. 사용자 요청에 따라 실기기 검증은 배포 후 진행하며 현재 자동 검증의 완료와 구분한다.
- [ ] T035 `specs/029-member-approval-routing/validation.md`에 구 앱+새 웹·새 앱+새 웹 조합과 웹 선배포·복구 가능 SHA를 기록한다. 배포는 실행하지 않는다.
- [ ] T036 `specs/029-member-approval-routing/checklists/requirements.md`, `spec.md`, `validation.md`를 실제 완료 상태로 갱신하고 사용자 최종 리뷰를 받는다.

## 의존성과 검토 단위

0단계 → 1단계 → 2단계 → 3단계 → 4단계 → 5단계 순서다. 단계 리뷰는 다음 단계 승인을 대신하지 않는다.
US1은 2단계 fixture로 독립 검증, US2는 3단계 fixture로 독립 검증, US3는 4단계 native 대역으로 독립 검증한다.
실제 기능 최소 완료 범위는 US1–US3를 포함한 4단계이며, 운영 검증 완료는 5단계다.

논리적 병렬 후보는 US1의 웹·native 테스트 초안, US2의 화면·이력 테스트, US3의 저장·알림 테스트다.
다만 승인된 단계 밖의 파일은 미리 구현하지 않고 같은 파일을 공유하는 작업도 병렬 편집하지 않는다.
현재는 순차 구현하며 자동 에이전트 분업을 요청한 것으로 해석하지 않는다.

650줄부터 분리 검토, 800줄 미만 유지. 체크 완료는 commit·push·PR·이슈 생성·배포 승인이 아니다.
