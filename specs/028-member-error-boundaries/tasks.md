# 작업 목록: 회원 웹 계층형 오류 경계

입력: [명세](spec.md), [계획](plan.md), [조사](research.md), [계약](contracts/error-boundaries.md).
테스트는 합의된 계획과 저장소 규칙에 따라 포함한다. T001~T007을 완료했고 T008의 수동 검증·사용자 리뷰를 기다린다.
경로는 저장소 루트 기준이며 새 파일은 해당 작업에서 생성한다. `specs/028-member-error-boundaries`는
번호 중복을 확인한 공식 문서 경로다.

## 1단계 — 준비·명세 등록

- [x] T001 `.context/member-error-boundaries/issue-draft.md`의 이슈 생성 승인·생성 결과를 확인해 `specs/028-member-error-boundaries/validation.md`에 번호와 URL을 기록한다.
- [x] T002 검토 초안을 `specs/028-member-error-boundaries/`에 등록하고 `spec.md`·`plan.md`·`tasks.md`를 Spec Kit 작업 경로로 연결한다. `.specify/feature.json`의 기존 값이 있으면 충돌 여부를 확인한다.
- [x] T003 `specs/028-member-error-boundaries/checklists/requirements.md`와 `validation.md`에 공식 경로 링크·작업 형식·사용자 1단계 리뷰 결과를 기록한다.

완료 기준: 이슈 번호·공식 문서·리뷰가 연결됨. 다음 단계 확인 전 제품 코드를 수정하지 않는다.

## 2단계 — US1 공통 오류 표시 기반

- [x] T004 [US1] `apps/web/src/shared/ui/error-state.test.tsx`에 page/section·액션·제목 계층·원문 오류 비노출 검증을 추가한다.
- [x] T005 [US1] `apps/web/src/shared/ui/error-state.tsx`·`error-state.css.ts`에 정적 그림과 기존 SEED 기반 공통 UI를 구현한다.
- [x] T006 [US1] `apps/storybook/stories/result-section.stories.tsx`에 큰/작은 안내·재시도·보조 액션 사례를 보강한다. 회원 웹 내부 import는 추가하지 않는다.
- [x] T007 [US1] `apps/web/src/pages/dev-routes/ui/dev-routes-page.tsx`의 개발 전용 미리보기에서 실제 ErrorState를 확인한다. 별도 운영 route나 모의 API는 만들지 않는다.
- [ ] T008 [US1] `specs/028-member-error-boundaries/validation.md`에 UI 화면·접근성·check/build·diff 크기와 2단계 리뷰를 기록한다.

완료 기준: 공통 UI를 좁은 화면과 키보드로 검토할 수 있음. page는 그림, section은 간결한 안내다.

## 3-A단계 — 공통 경계 기반·US4 최종 복구

- [x] T009 `apps/web/src/shared/ui/local-error-boundary.test.tsx`에 일반 오류·상위 전파·수동 reset·정상 자식 수명 테스트를 추가한다.
- [x] T010 `apps/web/src/shared/ui/local-error-boundary.tsx`·`error-boundary-policy.tsx`에 공통 경계·판별 Context·Query reset을 구현한다.
- [x] T011 [US4] `apps/web/src/app/app-error-boundary.tsx`와 인접 테스트에 Provider 없이 동작하는 최종 fallback·새로고침·홈 링크를 구현한다.
- [x] T012 `apps/web/src/shared/ui/query-boundary.tsx`·`screen-query-boundary.tsx`를 호환 래퍼로 연결하되 기존 소비자의 동작은 유지한다.
- [x] T013 [US4] `apps/web/stackflow/src/main.tsx`에서 AppErrorBoundary를 Provider 바깥에 연결한다.
- [x] T014 `specs/028-member-error-boundaries/validation.md`에 3-A 검증·diff·리뷰를 기록한다. 실제 인증 오류 전파는 3-B 연결 전 활성화하지 않는다.

완료 기준: 단독 경계 테스트로 상위 전파와 최종 복구를 확인한다. 앱 전체를 일반 Query 실패로 교체하지 않는다.

## 3-B단계 — US2 인증 경계와 대표 조회 연결

- [x] T015 [US2] `apps/web/src/features/auth/model/auth-error.test.ts`와 `operations.test.ts`에 오류 분류·재인증 차단·동시 실패 시나리오를 추가한다.
- [x] T016 [US2] `apps/web/src/features/auth/model/auth-error.ts`에 회원 API 최종401·브리지 AUTH_REQUIRED 판별 및 안전한 정규화를 구현한다.
- [x] T017 [US2] `apps/web/src/features/auth/model/operations.ts`·`account.ts`에 재인증 차단과 업무 cache 정리 경로를 추가한다.
- [x] T018 [US2] `apps/web/src/features/auth/model/native-auth-client.ts`와 인접 테스트에 GET 갱신 상한과 최종 오류 처리를 연결한다.
- [x] T019 [US2] `apps/web/src/features/auth/model/session.tsx`·`ui/auth-error-boundary.tsx`·`index.ts`에 재인증 필요 판별과 인증 경계를 공개한다. 초기 bootstrap 복구는 유지한다.
- [x] T020 [US2] `apps/web/stackflow/src/account-boundary.tsx`에 AuthErrorBoundary·entry guard·pop 차단·최상단 한 번의 기본 Login 이동을 연결한다.
- [x] T021 [US2] `apps/web/src/app/providers.tsx`에 Local용 인증 판별 정책을 주입하고 기존 호환 경계의 인증 전파를 활성화한다.
- [x] T022 [US2] `apps/web/stackflow/src/account-boundary.test.tsx`에 대표 조회401·로그인 왕복 방지·동일 세션 재로그인·이전 갱신 성공 경합을 검증한다.
- [x] T023 [US2] `specs/028-member-error-boundaries/validation.md`에 3-B check/build·요청/이동 횟수·diff·리뷰를 기록한다.

완료 기준: 인증 경로가 먼저 안전하게 연결되고 최초·재조회 사용처 이전을 받을 수 있다.

## 4단계 — US1 일반 조회 적용

- [x] T024 [US1] `apps/web/src/shared/lib/query-error-policy.ts`와 인접 테스트에 cache 오류·재시도 중·추가 페이지 예외의 공통 판정을 구현한다.
- [x] T025 [US1] `apps/web/src/pages/schedule/ui/schedule-page.tsx`·`notice-detail/ui/notice-detail-page.tsx`와 인접 테스트를 Local/page 정책으로 이전한다.
- [x] T026 [US1] `specs/028-member-error-boundaries/validation.md`에 일정·공지 상세 4-A 검증·화면·diff·리뷰를 기록한다.
- [x] T027 [US1] `apps/web/src/pages/home/ui/current-week-card.tsx`·`weekly-notices.tsx`를 Local/section으로 이전하고 사진 상태의 원시 ErrorBoundary를 제거한다.
- [x] T028 [US1] `apps/web/src/pages/my/ui/profile-section.tsx`·`my-page.tsx`와 `pages/attendance/ui/attendance-page.tsx`의 경고 영역에 독립 오류 교체를 적용한다.
- [x] T029 [US1] `apps/web/stackflow/src/query-recovery.test.tsx`에 성공 cache 이후 재조회 실패·복귀·정상 DOM 유지·reset 로딩·반복 실패를 추가한다.
- [x] T030 [US1] `specs/028-member-error-boundaries/validation.md`에 홈·프로필·경고 4-B 검증·화면·diff·리뷰를 기록한다.
- [x] T031 [US1] `apps/web/src/pages/home/ui/attendance-report-sheet.tsx`·`home-demo-sheets.tsx`와 `model/code-attendance.ts`·`attendance-report.ts`에서 셸/Mutation 소유 수명과 조회 fallback을 분리한다.
- [x] T032 [US1] `apps/web/stackflow/src/activities/activities.tsx`의 팀원 조회와 `apps/web/src/pages/settings/model/notification-settings.ts`·`ui/notification-setting.tsx`를 공통 정책에 연결한다.
- [x] T033 [US1] `apps/web/src/pages/home/ui/attendance-code.test.tsx`·`attendance-report-sheet.test.tsx` 및 팀 사진·설정 인접 테스트에 입력 초기화·셸 유지·제출 완료 보존·미지원 예외를 추가한다.
- [x] T034 [US1] `specs/028-member-error-boundaries/validation.md`에 입력 흐름·설정 4-C 검증·diff·리뷰를 기록한다.

완료 기준: 오류와 이전 콘텐츠가 같은 영역에 공존하지 않는다. 일반 재조회 중 정상 콘텐츠 유지와 실패 후 교체를 구분한다.

## 5단계 — US3 무한 목록 적용

- [x] T035 [US3] `apps/web/src/pages/notices/ui/notices-page.test.tsx`·`alerts/ui/alerts-page.test.tsx`·`attendance/ui/attendance-page.test.tsx`에 첫 조회/재조회/다음 페이지 오류·중복 방지·조건 변경 회귀를 추가한다.
- [x] T036 [US3] `apps/web/src/pages/notices/ui/notices-page.tsx`·`pages/alerts/ui/alerts-page.tsx`·`pages/attendance/ui/attendance-page.tsx`에서 일반 추가 오류만 목록을 유지하고 나머지는 Local로 전달한다. 분류 컨트롤·reset key·observer를 연결한다.
- [x] T037 [US3] `apps/web/stackflow/src/account-boundary.test.tsx`에 다음 페이지 인증 오류의 로그인 이동을 대표 흐름 하나로 검증한다.
- [x] T038 [US3] `specs/028-member-error-boundaries/validation.md`에 5단계 check/build·목록 화면·diff·리뷰를 기록한다.

완료 기준: 추가 페이지 실패 뒤 기존 항목이 남고 재시도 성공 뒤 중복이 없으며 인증 실패는 예외 없이 상위로 전달된다.

## 6단계 — US2 업무 Mutation 인증 전파

- [x] T039 [US2] `apps/web/src/pages/notice-detail/model/use-notice-read.ts`의 인접 테스트와 home·settings 테스트에 인증 실패/일반 실패/성공 후 재조회 실패를 구분한다.
- [x] T040 [US2] `apps/web/src/app/providers.tsx`에 인증 오류만 throw하는 업무 Mutation 기본 정책을 연결하고 `features/auth/model/mutations.ts`에서 인증 작업 자체의 기존 결과 처리를 보장한다.
- [x] T041 [US2] `apps/web/src/pages/home/model/code-attendance.ts`·`attendance-report.ts`, `pages/notice-detail/model/use-notice-read.ts`, `pages/settings/model/notification-settings.ts`에 필요한 인증 원인 보존을 적용한다.
- [x] T042 [US2] `specs/028-member-error-boundaries/validation.md`에 6-A 일반 입력·공지 롤백·로그인 이동·자동 재전송 없음·diff·리뷰를 기록한다.
- [x] T043 [US2] `apps/web/src/features/team-attendance/model/use-photo-submission.test.tsx`·`use-team-attendance.test.tsx`에 presign/최종 제출401·PUT 실패·접수 불명 회귀를 추가한다. 이전 계정의 늦은 오류 경합은 제품 정책에서 제외한다.
- [x] T044 [US2] `apps/web/src/features/team-attendance/model/use-photo-submission.ts`·`use-team-attendance.ts`의 오류 타입·catch·reset을 정리해 원본 API 인증 오류를 바깥 소유 Mutation까지 전달한다.
- [x] T045 [US2] `specs/028-member-error-boundaries/validation.md`에 6-B 검증·diff·리뷰를 기록한다.

완료 기준: 일반 제출 실패는 입력을 유지하고 인증 오류만 로그인으로 이동한다. 성공 결과와 후속 재조회 실패를 합치지 않는다.

## 7단계 — 통합 검증·정리

- [ ] T046 `apps/web/src/shared/ui/query-boundary.tsx`·`screen-query-boundary.tsx` 및 이전 화면별 fallback을 전체 사용처 이전 후 제거한다. 404·업무 전용 오류 화면은 유지한다.
- [ ] T047 `docs/web-development.md`와 `research.md`의 변경 대상 기존 명세에 새 정책 참조를 연결한다. 과거 validation의 실행 이력은 수정하지 않는다.
- [ ] T048 `apps/web/stackflow/src/query-recovery.test.tsx`·`account-boundary.test.tsx`에서 최종 탐색·재인증·캐시 수명 통합 흐름을 검증한다.
- [ ] T049 `specs/028-member-error-boundaries/quickstart.md`의 전체 시나리오와 check/build·브라우저/WebView·접근성 결과를 `validation.md`에 기록한다.
- [ ] T050 `specs/028-member-error-boundaries/validation.md`에 최종 diff 크기·PR 분리·미실행 위험·복구 절차·사용자 최종 리뷰를 기록한다.

## 의존 순서와 병렬 가능 범위

1 → 2 → 3-A → 3-B → 4-A → 4-B → 4-C → 5 → 6-A → 6-B → 7 순서다.
각 단계 리뷰 확인을 다음 단계의 선행 조건으로 취급한다. US2의 공통 인증 경로를 먼저 구축한 뒤
US1·US3 사용처와 US2 Mutation을 단계적으로 연결한다. MVP 검증은 일정의 조회·인증 복구까지다.

같은 단계 안에서 US1의 독립 화면 테스트, US2의 transport·가드 조사, US3의 세 목록 테스트,
US4의 표시·액션 테스트는 독립적으로 조사할 수 있다. 공통 파일 수정과 단계 구현은 순차 진행한다.
`[P]` 실행 지시는 부여하지 않으며 병렬 작업 가능성이 단계 리뷰를 생략하는 승인은 아니다.
