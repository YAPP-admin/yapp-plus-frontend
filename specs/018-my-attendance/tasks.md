# 작업 목록: 마이페이지·출석 내역 연동

**입력**: [명세](spec.md), [계획](plan.md), [모델](data-model.md), [계약](contracts/attendance-query.md), [검증](quickstart.md).
**테스트**: 명세에서 요구한 회귀 테스트를 각 실패에 가장 가까운 계층에 작성한다.
`[P]`는 해당 단계 내 독립 파일 작업이다. 다음 단계의 리뷰 승인을 생략하는 의미가 아니다.

## 1단계 — 명세와 작업 준비

- [x] T001 기준·출처·범위를 specs/018-my-attendance/spec.md, research.md에 기록한다.
- [x] T002 specs/018-my-attendance/plan.md, data-model.md, contracts/session-name.md, contracts/attendance-query.md에 설계와 롤백을 정의한다.
- [x] T003 specs/018-my-attendance/quickstart.md, tasks.md와 .context/my-attendance-issue.md에 검증·작업·이슈 초안을 작성한다.
- [x] T004 specs/018-my-attendance/checklists/requirements.md, validation.md에 문서 정합성·품질 게이트 결과를 기록한다.
- [x] T005 specs/018-my-attendance/validation.md에 1단계 리뷰와 작업 이슈 생성 승인·번호를 기록한 뒤 제품 구현을 시작한다.

## 2단계 — 이름 전달 기반 (US1·US3의 선행 조건)

독립 검증: UI 구현 없이 인증 결과·저장·복구에서 이름이 같은 계정에만 남는지 확인한다.

- [x] T006 packages/app-bridge/src/index.ts에 선택적 name과 sessionNameSchema를 추가하고 packages/app-bridge/tests/session-name.test.ts에 정규화·구버전 입력 테스트를 작성한다.
- [x] T007 apps/mobile/src/auth/storage.test.ts, session.test.ts, actions.test.ts에 이름 저장·복구·잘못된 이름·계정 전환 회귀 사례를 추가한다.
- [x] T008 apps/mobile/src/auth/credentials.ts, storage.ts, session.ts에서 이름 전달·version 1 호환·갱신 보존·새 계정 정리를 구현한다.
- [x] T009 specs/018-my-attendance/validation.md에 인접 테스트·check·변경량·호환성 결과와 2단계 리뷰를 기록한다.

## 3단계 — US1 마이페이지 (P1)

독립 검증: 가상 세션·점수 응답만으로 실제 값·미지원·미대상·실패 화면을 검증한다.

- [x] T010 [US1] apps/web/src/features/member-attendance/model/score-query.test.ts에 정상·미대상 code·오류·ID 정규화 회귀 테스트를 추가한다.
- [x] T011 [US1] apps/web/src/features/member-attendance/model/score-query.ts, index.ts에 생성 mineOptions 재사용·schema·미대상 code 판별·공유 query 반환 계약을 구현한다.
- [x] T012 [US1] apps/web/src/pages/my/ui/my-page.test.tsx에 세션 이름·0값·대상 아님·실패·규칙·메뉴 테스트를 갱신한다.
- [x] T013 [US1] apps/web/src/pages/my/ui/my-page.tsx, my-page.css.ts에서 목업 제거·name 정규화·점수 Suspense/ErrorBoundary·미지원 `—`를 구현한다.
- [x] T014 [US1] apps/web/src/mocks/member-attendance-handlers.ts, browser.ts, server.ts에 점수 정상·미대상·지연·오류 fixture와 DEV 전용 myState 시나리오를 연결한다.
- [ ] T015 [US1] specs/018-my-attendance/validation.md에 check/build·화면·접근성·변경량 결과와 3단계 리뷰를 기록한다.

T010–T014 구현·자동 검증 완료. T015는 브라우저 도구 오류로 화면 캡처·실환경 접근성 검증이 남아 있다.

## 4단계 — US2 출석 내역 (P2)

독립 검증: 3페이지 이상 조회에서 모든 상태·마지막 페이지·추가 오류·중복·반복 커서를 검증한다.

- [ ] T016 [P] [US2] apps/web/src/pages/attendance/model/history-query.test.ts에 schema·커서 반복·정상 다중 페이지 재조회·중복 병합·summary 갱신 테스트를 추가한다.
- [ ] T017 [P] [US2] apps/web/src/pages/attendance/model/attendance-status.test.ts에 출결·운영진 판단의 모든 매핑과 우선순위를 검증한다.
- [ ] T018 [US2] apps/web/src/pages/attendance/model/history-query.ts, attendance-status.ts에 생성 infinite 옵션·검증·병합·배지 변환을 구현한다.
- [ ] T019 [US2] apps/web/src/pages/attendance/ui/attendance-page.test.tsx에 초기·후속·재조회 오류, 빈 페이지, 무한 스크롤 중복 방지, 결석 9/10 경계를 추가한다.
- [ ] T020 [US2] apps/web/src/pages/attendance/ui/attendance-page.tsx, attendance-page.css.ts에 실제 조회·무한 스크롤·요약·배지·독립 경고와 재시도를 구현한다.
- [ ] T021 [US2] apps/web/stackflow/src/stack.tsx, activities/activities.tsx와 apps/web/src/pages/attendance/index.ts에서 목업 mode·props를 정리하고 stack.test.tsx로 기존 URL·MY fallback을 검증한다.
- [ ] T022 [US2] apps/web/src/mocks/member-attendance-handlers.ts, browser.ts에 attendanceState 정상·빈 결과·전체 배지·경고·추가 오류 시나리오를 연결한다.
- [ ] T023 [US2] docs/web-routing.md의 내역 상태 설명을 실제 조회 기준으로 갱신하고 specs/018-my-attendance/validation.md에 check/build·화면·변경량·4단계 리뷰를 기록한다.

## 5단계 — US3 계정 격리·통합 (P1)

독립 검증: 인증 mutation과 실제 생성 query를 함께 실행해 이전 이름·업무 데이터가 새 계정에 반영되지 않는지 확인한다.

- [ ] T024 [P] [US3] apps/web/src/features/auth/model/session-queries.test.ts에 두 조회와 이름이 포함된 세션의 401 복구·계정 전환 지연 응답 사례를 추가한다.
- [ ] T025 [P] [US3] apps/web/stackflow/src/account-boundary.test.tsx에 이름 없는 새 계정의 이전 화면 비노출을 검증한다.
- [ ] T026 [US3] apps/web/src/pages/attendance/ui/attendance-page.test.tsx에 화면 숨김·복귀 시 observer 정리·재조회 실패·스크롤 보존 회귀를 보완한다.
- [ ] T027 [US3] specs/018-my-attendance/validation.md에 WebView 로그인→MY→내역→복귀, 재시작·계정 전환과 구 native 호환 실측·미실행 근거를 기록한다.

## 마무리 — 최종 검증과 보고 (5단계 포함)

- [ ] T028 specs/018-my-attendance/validation.md에 check/build, 필요 시 expo:doctor, 접근성·테마·safe-area 결과와 실제 실행/캐시를 기록한다.
- [ ] T029 specs/018-my-attendance/spec.md, tasks.md, validation.md의 완료 상태·남은 서버 보완·PR 크기·롤백 근거를 갱신하고 최종 리뷰를 제출한다.

## 의존성과 병렬 작업 예시

T001–T005 → T006–T009 → US1(T010–T015) → US2(T016–T023) → US3(T024–T027) → T028–T029.
US1은 공용 schema 구현 후 native 저장/웹 fixture 조사를 독립 검토할 수 있지만 실제 구현은 단계 순서를 지킨다.
US2의 T016/T017, US3의 T024/T025는 같은 단계 내 다른 파일이므로 병렬 가능하다.
공유 mocks·validation.md 갱신은 충돌을 피하도록 직렬 처리한다.

## 구현 전략

US1을 먼저 사용 가능한 MVP로 검토한 후 내역과 통합 검증을 진행한다.
각 단계는 하나의 사용자 리뷰 단위이며 완료 보고 후 다음 단계 승인을 기다린다.
기존 이름 저장 사용자는 없어도 로그인 가능해야 하고 백엔드 미지원 항목은 후속 계약 없이 확장하지 않는다.

| 요구사항      | 담당 작업                       |
| ------------- | ------------------------------- |
| FR-001·FR-002 | T006–T008, T012–T013, T024–T025 |
| FR-003·FR-004 | T010–T014, T020                 |
| FR-005·FR-006 | T016–T020, T022                 |
| FR-007·FR-008 | T010–T014, T018–T020            |
| FR-009·FR-010 | T014, T021–T027                 |
