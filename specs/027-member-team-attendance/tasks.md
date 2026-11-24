# 작업 목록: 최신 API와 회원 팀 출석 운영 연결

**입력**: [명세](spec.md)·[계획](plan.md)·[계약](contracts/team-attendance.md)
**현재 범위**: T033 리뷰·커밋 완료. T034 운영 진입 검증 완료 후 사용자 리뷰 대기이며 최신 사용자 결정은 validation.md의 2026-11-24 기록을 따른다.
작업 경로는 저장소 루트 기준이다. 테스트는 명세의 수용 조건과 회귀를 가까운 계층에서 확인한다.
각 리뷰에는 실제 diff·check 결과·제품 변경 시 build 결과·캐시 재사용·미실행 항목을 제출한다.

## 0단계 — 준비

- [x] T001 .context/api-027-openapi.json에 원본을 저장하고 specs/027-member-team-attendance/research.md에 기준·해시·#501·#503 조사 결과를 기록한다.
- [x] T002 specs/027-member-team-attendance/spec.md와 checklists/requirements.md에 확정 정책·품질 검토를 작성한다.
- [x] T003 specs/027-member-team-attendance/plan.md·data-model.md·contracts/team-attendance.md·quickstart.md·tasks.md를 작성한다.
- [x] T004 문서 링크·작업 형식·check·변경량을 확인해 specs/027-member-team-attendance/validation.md에 기록한다.
- [x] T005 specs/027-member-team-attendance/validation.md에 사용자 문서 리뷰와 1A 진행 확인을 기록한다.

## 1단계 — 공용 계약 기반

각 소단계는 독립 리뷰 단위이며 생성 코드 수동 수정 없이 진행한다.

### 1A — 주간 필드·후반 조회 이름

- [x] T006 packages/api/openapi-ts.config.ts의 임시 필터·이름 변환으로 src/generated를 재생성하고 apps/web/src/mocks/session-fixtures.ts·공용 fixture·관련 소비자·테스트에 type·endTime 및 후반 조회 이름을 이관한다.
- [ ] T007 apps/admin/src/mocks/api-contract.test.ts와 해당 웹 회귀 테스트로 HTTP 경로·Query key 의미를 검증하고 specs/027-member-team-attendance/validation.md에 1A 결과·리뷰를 기록한다.

### 1B — 나머지 기존 조회 이름

- [x] T008 packages/api/openapi-ts.config.ts의 임시 이름 변환을 제거해 재생성하고 관리자 세션·프로필·알림의 앱 호출·타입·Query key·packages/api/src/mocks/handlers.ts·관련 테스트를 경로 기준으로 이관한다.
- [ ] T009 specs/027-member-team-attendance/validation.md에 1B 회귀·check/build·변경량과 사용자 리뷰를 기록한다.

### 1C·1D — 팀원·사진 조회 전체 생성

- [x] T010 packages/api/openapi-ts.config.ts의 임시 필터를 제거해 팀원·사진 GET을 포함한 src/generated 전체를 재생성하고 packages/api/README.md에 계약을 갱신한다.
- [x] T011 동일 원본의 전체 재생성 일치와 팀원·사진 SDK·Zod·Query·MSW·Faker HTTP 경로를 검증하고 specs/027-member-team-attendance/validation.md에 결과·리뷰를 기록한다.

## 2단계 — US1 실제 팀·기존 사진 확인 (P1)

독립 검증: 응답 입력만으로 유효한 대상·기존 사진·사진 조회 실패·다른 조회 실패의 차이를 확인한다.

- [ ] T014 [US1] apps/web/src/features/team-attendance/model/team-attendance-query.test.tsx에 명단 검증·사진 오류만 미제출·이전 캐시·취소 후 쓰기 0회 회귀를 작성한다. 생성 Query 옵션을 직접 소비하기로 해 화면 연결 단계에서 다시 검토한다.
- [x] T015 [US1] apps/web/src/features/team-attendance/model/submission-input.ts에 teamId를 연결하고 기존 fixture·제출 테스트 입력을 갱신한다. 생성 응답 화면 모델 변환은 생성 Query 옵션 직접 소비 정책에 따라 추가하지 않는다.
- [ ] T016 [US1] apps/web/src/features/team-attendance/model/team-attendance-query.ts에 생성 조회·계정 수명·사진 실패 한정 정책을 연결하고 index.ts에 필요한 계약만 공개한다. 생성 Query 옵션 직접 소비 정책에 따라 별도 공개 계약을 추가하지 않는다.
- [ ] T017 [US1] specs/027-member-team-attendance/validation.md에 US1 검증과 2단계 리뷰를 기록한다.

## 3~4단계 — US2 사진 입력과 즉시 업로드 (P1)

독립 검증: 실제 최종 접수 없이 사진 도구·준비·선택 직후 업로드·실패·교체를 확인한다.

### 3단계 — 실제 대상·일회성 사진 도구

- [ ] T018 [US2] apps/web/stackflow/src/stack.test.tsx에 sessionId 전달·직접 진입·사진 도구 일회성·취소·계정 변경 시나리오를 작성한다.
- [ ] T019 [US2] apps/web/stackflow/src/stack.tsx와 activities/home-sheets.tsx·activities.tsx에서 실제 대상과 일회성 initialPhotoSource를 연결한다. 운영 차단은 유지한다.
- [ ] T020 [US2] apps/web/src/pages/home/ui/home-demo-sheets.tsx에 실제 시작·종료 시간과 도구 선택 콜백을 연결하고 pages/team-attendance-upload/ui/team-attendance-upload-page.tsx에 실제 명단을 표시한다.
- [ ] T021 [US2] specs/027-member-team-attendance/validation.md에 도구 1회·지연 조회·폼 재마운트 검증과 3단계 리뷰를 기록한다.

### 4단계 — 업로드·키 수명

- [ ] T022 [US2] apps/web/src/features/team-attendance/model/use-photo-upload.test.tsx에 즉시 PUT·키 교체·새 URL 재시도·이탈과 업로드 중 제출 차단 회귀를 작성한다.
- [ ] T023 [US2] apps/web/src/features/team-attendance/model/use-photo-upload.ts로 presign·PUT을 분리하고 model/use-photo-submission.ts는 최종 접수 책임으로 좁힌다.
- [ ] T024 [US2] apps/web/src/pages/team-attendance-upload/model/use-attendance-photo.ts와 ui/team-attendance-upload-page.tsx에서 준비 성공 즉시 업로드·사진 교체·재시도를 연결한다.
- [ ] T025 [US2] specs/027-member-team-attendance/validation.md에 업로드 성공 전 제출 차단·취소의 기존 사진 보존과 4단계 리뷰를 기록한다.

## 5단계 — US3 최종 접수와 변경된 명단 (P1)

독립 검증: 업로드 완료 입력으로 최종 요청 본문·명단/팀 변화·접수 실패·결과 불명을 확인한다.

- [ ] T026 [US3] apps/web/src/features/team-attendance/model/use-team-attendance.test.tsx·use-photo-submission.test.tsx에 최종 버튼 PUT 0회·명단 변경·팀 이동·결과 불명·늦은 응답 회귀를 작성한다.
- [ ] T027 [US3] apps/web/src/features/team-attendance/model/use-team-attendance.ts에서 제출 직전 생성 SDK 재조회와 같은 팀 선택 초기화·팀 변경 전체 폐기를 연결한다.
- [ ] T028 [US3] apps/web/src/features/team-attendance/model/use-photo-submission.ts에 imageKey·명단 접수·201 검증·Query 무효화를 연결하고 pages/team-attendance-complete/ui/team-attendance-complete-page.tsx의 시각 문구를 제출 시각에 맞춘다.
- [ ] T029 [US3] specs/027-member-team-attendance/validation.md에 중복 접수 차단·조회 실패와 성공 분리·완료 직접 진입 검증과 5단계 리뷰를 기록한다.

## 6단계 — US4 유형별 홈·복귀·운영 진입 (P1)

독립 검증: 두 유형과 다섯 상태, 기존 사진 여부, fresh 캐시 복귀·서버 정정을 확인한다.

- [ ] T030 [US4] apps/web/src/pages/home/ui/home-page.test.tsx·attendance-code.test.tsx와 stackflow/src/query-recovery.test.tsx에 유형·홈 상태·사진 오류·강제 복귀 조회 회귀를 작성한다.
- [x] T031 [US4] apps/web/src/pages/home/ui/current-week-card.tsx에 서버 type·상태를 연결하고 PENDING_APPROVAL의 사진 상세만 조회한다. 사용자 리뷰로 사진 존재 기반 제출 차단을 대체했다.
- [x] T032 [US4] apps/web/src/pages/home/model/code-attendance.ts의 화면 활성화는 REGULAR·AVAILABLE을 따르고 과거 성공 mutation이 최신 정정을 덮어쓰지 않도록 한다. 사용자 리뷰에 따라 제출 함수의 상태 재검사는 생략하고 서버 판정에 맡긴다.
- [x] T033 [US4] apps/web/src/shared/lib/screen-activity.ts의 기본 동작은 보존하며 home/ui/current-week-card.tsx의 홈·앱 복귀 조회만 강제한다. polling은 추가하지 않는다.
- [x] T034 [US4] apps/web/stackflow/src/activities/home-sheets.tsx·activities.tsx의 팀 인증 운영 진입을 열고 로그인·정적 모드·세션 조건과 receipt 없는 완료 차단을 검증한다.
- [ ] T035 [US4] specs/027-member-team-attendance/validation.md에 TEAM 코드·위치 요청 0회, 상태·접근성·6단계 리뷰를 기록한다.

## 7단계 — 통합과 검증 기록

- [ ] T036 apps/web/src/mocks/browser.ts의 실서버 presign·submit passthrough를 제거하고 생성 MSW 시나리오로 교체하며 stackflow/src/activities/team-photo-development.ts의 고정 대상 공급을 제거한다.
- [ ] T037 apps/web/stackflow/src/stack.test.tsx에서 전체 흐름·production/정적 모드·직접 진입을 검증하고 apps/web/README.md에 실제·모킹 실행 경계를 갱신한다.
- [ ] T038 specs/027-member-team-attendance/quickstart.md의 자동·브라우저 검증과 check/build를 실행하고 validation.md에 신규 실행·캐시·미실행·변경량을 기록한다.
- [ ] T039 사용자가 지정한 테스트 세션의 실제 iPhone 제출·승인 후 복귀·VoiceOver 확인 결과를 specs/027-member-team-attendance/validation.md에 기록한다. 직접 확인 전에는 미완료로 둔다.
- [ ] T040 specs/027-member-team-attendance/validation.md에 최종 리뷰와 운영 차단·SDK/소비자 복구 방법을 기록한다.

## 의존성과 실행 전략

0 → 1A → 1B → 1C → 1D → US1(2) → US2(3 → 4) → US3(5) → US4(6) → 통합(7).
각 화살표에는 앞 단계 리뷰와 다음 단계 진행 확인이 필요하다. 모든 story는 P1이며 실제 운영 완성에는 모두 필요하다.
최소 검토 단위는 US1의 대상·기존 제출 확인이다. 이 단계만으로 사진 제출을 운영에 공개하지 않는다.

같은 단계에서 독립적인 읽기 전용 검증은 나눌 수 있다. 예: US1 명단/사진 오류 사례 검토,
US2 native 도구/UI 전송 사례 검토, US3 요청 본문/탐색 사례 검토, US4 상태표/복귀 사례 검토.
공유 파일을 수정하는 작업은 순차 처리하며 단계 리뷰를 건너뛰는 병렬 구현은 하지 않는다.
