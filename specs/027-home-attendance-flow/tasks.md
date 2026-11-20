# 작업 목록: 회원 홈 출석 상태와 팀 사진 출석 연결

입력: [명세](spec.md), [계획](plan.md), [계약](contracts/attendance-flow.md).
`[P]`는 같은 단계에서 파일 충돌 없이 병행할 수 있는 작업이다. 자동으로 에이전트 위임을 승인하지 않는다.
완료 체크는 실제 수행 결과에만 사용한다. 이번 작업은 1단계 문서까지다.

## 준비 — 1단계 문서

- [x] T001 최신 base·작업 트리·이슈 #501을 확인하고 `specs/027-home-attendance-flow/plan.md`에 기준을 기록한다.
- [x] T002 확정 정책·제외 범위·성공 기준을 `specs/027-home-attendance-flow/spec.md`에 작성한다.
- [x] T003 코드·디자인·Android 근거와 외부 선행 조건을 `specs/027-home-attendance-flow/research.md`에 작성한다.
- [x] T004 데이터 수명·계약·복구를 `specs/027-home-attendance-flow/data-model.md`, `specs/027-home-attendance-flow/contracts/attendance-flow.md`에 작성한다.
- [x] T005 단계별 검증·작업 순서를 `specs/027-home-attendance-flow/quickstart.md`, `specs/027-home-attendance-flow/tasks.md`에 작성한다.
- [x] T006 문서 정합성·형식·변경량·검증 실행 결과를 `specs/027-home-attendance-flow/validation.md`에 기록하고 1단계 결과를 제출한다.
- [ ] T007 사용자 리뷰를 반영하고 2단계 진행 확인을 `specs/027-home-attendance-flow/validation.md`에 기록한다.

## 공통 선행 작업 — 2단계 시작 조건

T007 전에는 시작하지 않는다. 이 절은 사용자 스토리 구현에 필요한 최소 준비다.

- [ ] T008 `docs/frontend-development.md`, `docs/web-development.md`, `apps/web/AGENTS.md`를 재확인하고 Modern Web Guidance 1.0.0 검색·조회 결과를 `specs/027-home-attendance-flow/validation.md`에 기록한다.
- [ ] T009 관련 기존 테스트의 기준 결과와 API enum·mock 차이를 조사해 `specs/027-home-attendance-flow/validation.md`에 기록한다. 생성 파일은 수정하지 않는다.

## US1 — 홈의 최신 상태 (2단계 전반, P1)

독립 완료 기준: 상태 표·조회 상태·복귀 정책이 일치하고 팀 운영 진입은 준비 중이다.

- [ ] T010 [P] [US1] `apps/web/src/pages/home/model/current-week-attendance.test.ts`(신규)에 다섯 상태·두 유형·null 세션·빈 장소·조회 잠금 회귀 사례를 작성한다.
- [ ] T011 [P] [US1] `apps/web/src/pages/home/ui/home-page.test.tsx`에 신선한 캐시 복귀·과거 성공 이력·조회 실패·오프라인 대기 사례를 추가한다.
- [ ] T012 [US1] `apps/web/src/pages/home/model/current-week-attendance.ts`(신규)에 임시 유형·표시·행동 정책을 구현하고 제거 조건 주석을 남긴다.
- [ ] T013 [US1] `apps/web/src/pages/home/ui/current-week-card.tsx`에 정책·문구·조회 잠금·재시도·팀 준비 중 안내를 적용하고 과거 성공 우선 표시를 제거한다.
- [ ] T014 [US1] `apps/web/src/shared/lib/screen-activity.ts`와 `apps/web/src/pages/home/ui/current-week-card.tsx`에 홈 전용 항상 재조회 정책을 연결하고 다른 소비자의 기본 동작을 유지한다.
- [ ] T015 [US1] `apps/web/src/mocks/session-handlers.ts`의 코드 성공과 주간 응답 상태를 연결한다. 출석 비대상 상태를 임의로 체크인으로 바꾸지 않는다.
- [ ] T016 [US1] `apps/web/src/pages/home/ui/home-page.test.tsx`와 `apps/web/stackflow/src/query-recovery.test.tsx`에서 복귀·오류 복구 및 기존 소비자 회귀를 검증한다.
- [ ] T017 [US1] 실제 WebView의 앱 복귀를 확인하고 `specs/027-home-attendance-flow/validation.md`에 플랫폼별 근거를 기록한다. 이벤트 누락 시 브리지 변경을 시작하지 말고 별도 설계·사용자 리뷰를 받는다.

## US2 — 정규 코드 출석 (2단계 후반, P1)

독립 완료 기준: 제출 성공 즉시 완료 화면, 이후 홈 서버 상태 반영, 기존 위치·중복·직접 진입 방어 유지.

- [ ] T018 [P] [US2] `apps/web/src/pages/home/ui/attendance-code.test.tsx`에 성공 후 재조회 지연·실패와 과거 성공 이력 회귀 사례를 추가한다.
- [ ] T019 [P] [US2] `apps/web/stackflow/src/stack.test.tsx`에 현재 제출 완료와 완료 화면 직접 진입 방어 사례를 보강한다.
- [ ] T020 [US2] `apps/web/src/pages/home/model/code-attendance.ts`의 진입 판단을 현재 서버 응답 기준으로 바꾸고 현재 요청 중복 방지·완료 화면용 성공 정보는 유지한다.
- [ ] T021 [US2] `apps/web/stackflow/src/activities/activities.tsx`와 `apps/web/src/pages/home/ui/attendance-code.test.tsx`에서 완료 이동이 재조회를 기다리지 않으며 위치·코드 회귀가 없는지 확인한다.
- [ ] T022 [US2] 2단계 관련 테스트·접근성·화면 증거·check·build·변경량을 `specs/027-home-attendance-flow/validation.md`에 기록하고 사용자 리뷰를 받는다.

## US3 — 팀 운영 연결 (3단계, P2)

T022 리뷰 및 다음 단계 진행 확인과 T023 계약 확인이 모두 선행한다.
독립 완료 기준: 실대상 조회→소스별 선택→사진·팀원→접수→홈 상태, 취소·실패·이탈 수명 유지.

- [ ] T023 [US3] 실제 회원용 조회 경로·응답·권한을 확인하고 누락 정책을 사용자에게 질문하여 `specs/027-home-attendance-flow/contracts/attendance-flow.md`의 확인표를 완성한다. 미준비면 이후 작업을 시작하지 않는다.
- [ ] T024 [US3] 확인된 OpenAPI를 `packages/api/openapi-ts.config.ts` 기준으로 `pnpm --filter @yapp-plus/api generate`를 실행해 반영하고 생성 변경량·소비자 영향을 검토한다. 생성 파일을 직접 편집하지 않는다.
- [ ] T025 [P] [US3] `apps/web/src/features/team-attendance/model/submission-target.test.ts`(신규)에 본인 포함·중복·세션/계정 불일치·누락 응답 검증 사례를 작성한다.
- [ ] T026 [P] [US3] `apps/web/src/pages/team-attendance-upload/ui/team-attendance-upload-page.test.tsx`에 최초/교체 취소·실패·본인 해제 방지·늦은 선택 결과 사례를 보강한다.
- [ ] T027 [US3] `apps/web/src/features/team-attendance/model/submission-target.ts`(신규)에 실제 회원용 조회·검증·기존 제출 대상 변환을 구현하고 `apps/web/src/features/team-attendance/index.ts`로 공개한다.
- [ ] T028 [US3] `apps/web/stackflow/src/stack.tsx`, `apps/web/stackflow/src/activities/activities.tsx`, `apps/web/stackflow/src/activities/home-sheets.tsx`에 안내·업로드·완료의 공통 흐름 수명을 연결한다. 기존 URL·직접 진입 방어를 보존한다.
- [ ] T029 [US3] `apps/web/src/pages/home/ui/home-demo-sheets.tsx`와 `apps/web/src/pages/team-attendance-upload/model/use-attendance-photo.ts`에 안내 버튼별 선택 소스·최초 취소 복귀·일반 시간·선택 팀원 안내를 연결한다.
- [ ] T030 [US3] `apps/web/stackflow/src/activities/activities.tsx`에서 검증된 실대상을 연결하고 개발용 대상의 운영 사용을 제거한다. 대상 조회 실패 시 선택기·제출을 차단한다.
- [ ] T031 [US3] `apps/web/src/features/team-attendance/model/use-team-attendance.ts`에 제출 성공 후 주간 무효화를 연결하고 불확실한 제출의 자동 재전송 금지·홈 확인 안내를 유지한다.
- [ ] T032 [US3] `apps/web/src/pages/home/ui/current-week-card.tsx`에서 준비된 팀 흐름 진입을 활성화하고 `apps/web/src/pages/team-attendance-complete/ui/team-attendance-complete-page.tsx`의 접수 결과 표시를 확인한다.
- [ ] T033 [US3] `apps/web/stackflow/src/stack.test.tsx`, `apps/web/src/features/team-attendance/model/use-photo-submission.test.tsx`에서 URL·새로고침·나가기·서버 재허용·응답 유실 회귀를 검증한다.
- [ ] T034 [US3] 네이티브 카메라/보관함·취소·접수·상태 재조회와 check·build 결과를 `specs/027-home-attendance-flow/validation.md`에 기록하고 3단계 리뷰를 받는다.

## 통합 검증 — 4단계

3단계 리뷰와 다음 단계 확인 후 수행한다. 아직 구현하지 않은 기능을 완료로 처리하지 않는다.

- [ ] T035 재사용 UI 변경이 있으면 해당 Storybook 사례(예: `apps/storybook/stories/result-section.stories.tsx`)를 갱신한다. 홈·팀 전용 사례는 현재 없으므로 화면 테스트와 접근성 검증으로 확인하고 적용 여부를 `specs/027-home-attendance-flow/validation.md`에 기록한다.
- [ ] T036 `specs/027-home-attendance-flow/quickstart.md`의 계정·주차·앱 복귀·불확실한 제출 사례 중 새 통합 위험을 검증하고 결과를 `specs/027-home-attendance-flow/validation.md`에 기록한다.
- [ ] T037 최종 check·build와 필요 시 expo:doctor, 캐시 여부·미실행 위험·실제 base 변경량·분리안을 `specs/027-home-attendance-flow/validation.md`에 정리하고 최종 리뷰를 받는다.

## 의존성과 병행 예시

T001~~T006 → 사용자 리뷰 T007 → T008~~T009 → US1 → US2 → 2단계 리뷰 → T023 계약 게이트 → US3 → 3단계 리뷰 → 통합 검증.
US1은 T010/T011, US2는 T018/T019, US3은 T025/T026을 각각 다른 파일에서 병행할 수 있다.
나머지는 상태·내비게이션 공유 또는 선행 계약이 있으므로 순차 진행한다. 단계 경계를 넘어 병행하지 않는다.

## 요구사항 대응과 전달 전략

| 요구사항   | 작업                                               |
| ---------- | -------------------------------------------------- |
| FR-001~006 | T010~T017                                          |
| FR-007     | T018~T022                                          |
| FR-008     | T023~T027, T030                                    |
| FR-009~011 | T026, T028~~T029, T033~~T034                       |
| FR-012     | T031~T034                                          |
| FR-013     | T029                                               |
| FR-014     | T023~T024; 필드 도착 시 계약·작업 목록을 먼저 갱신 |
| FR-015     | T022, T034~T036                                    |

최소 전달 단위는 US1·US2의 홈·정규 출석이다. US3의 API 준비를 기다리며 이를 미루지 않는다.
코드 작성 전 회귀 사례가 기존 구현에서 실패하는지 확인한다. 650줄부터 변경을 나누고 800줄 이상 PR을 만들지 않는다.
커밋·푸시·PR 생성은 단계 진행 확인과 별개로 명시적 승인이 있을 때만 수행한다.
