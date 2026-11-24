# 작업 목록: 최신 API와 회원 팀 출석 운영 연결

**입력**: [명세](spec.md)·[계획](plan.md)·[계약](contracts/team-attendance.md)
**현재 범위**: 현재 승인 범위의 구현·자동 검증·문서 정리 완료. 실제 iPhone 검증은 사용자 요청으로 보류한다.
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
- [x] T007 apps/admin/src/mocks/api-contract.test.ts와 해당 웹 회귀 테스트로 HTTP 경로·Query key 의미를 검증하고 specs/027-member-team-attendance/validation.md에 1A 결과·리뷰를 기록한다.

### 1B — 나머지 기존 조회 이름

- [x] T008 packages/api/openapi-ts.config.ts의 임시 이름 변환을 제거해 재생성하고 관리자 세션·프로필·알림의 앱 호출·타입·Query key·packages/api/src/mocks/handlers.ts·관련 테스트를 경로 기준으로 이관한다.
- [x] T009 specs/027-member-team-attendance/validation.md에 1B 회귀·check/build·변경량과 사용자 리뷰를 기록한다.

### 1C·1D — 팀원·사진 조회 전체 생성

- [x] T010 packages/api/openapi-ts.config.ts의 임시 필터를 제거해 팀원·사진 GET을 포함한 src/generated 전체를 재생성하고 packages/api/README.md에 계약을 갱신한다.
- [x] T011 동일 원본의 전체 재생성 일치와 팀원·사진 SDK·Zod·Query·MSW·Faker HTTP 경로를 검증하고 specs/027-member-team-attendance/validation.md에 결과·리뷰를 기록한다.

## 현재 구현·검증 항목

초기 계획에서 변경된 작업은 아래 최신 내용으로 대체한다. 과거 실행 결과는 validation.md를 따른다.

- [x] T015 [US1] TeamAttendanceTarget에 teamId를 연결하고 생성 Query 옵션을 직접 소비한다.
- [x] T017 [US1] 실제 팀원·직군 null·홈 사진 상태의 화면 테스트와 검증 결과를 기록한다.
- [x] T018 [US2] stack.test.tsx와 account-boundary.test.tsx에서 sessionId·직접 진입·사진 취소·계정 수명을 검증한다.
- [x] T019 [US2] 안내 클릭 콜백에서 브리지를 호출하고 성공 시 sessionId와 Context 사진으로 업로드 화면에 이동한다.
- [x] T020 [US2] 안내의 사진 도구 콜백과 업로드 화면의 실제 팀원 명단을 연결한다.
- [x] T021 [US2] 앨범·카메라 각각 취소·재선택·화면 이동 시 도구 호출을 검증한다.
- [x] T022 [US2] 제출 기능 테스트에서 presign·PUT·접수·실패·화면 이탈을 검증한다.
- [x] T024 [US2] File·미리보기 URL을 Context에 보관하고 완료·이탈 시 폐기한다.
- [x] T025 [US2] 선택 단계 업로드 없음과 최종 제출 시 전송을 통합 테스트로 검증한다.
- [x] T026 [US3] 결과 불명·늦은 응답·중복 제출을 기존 제출 테스트에서 검증한다.
- [x] T028 [US3] 최종 버튼에서 presign·PUT·명단 접수·201 확인 후 완료로 이동한다.
- [x] T029 [US3] 접수 정보 없는 완료 진입 차단과 완료·홈 복귀를 검증한다.
- [x] T030 [US4] 유형·출석 상태·사진 오류·복귀 조회 테스트를 연결한다.
- [x] T031 [US4] 서버 type·본인 상태로 분기하고 PENDING_APPROVAL의 사진 상세만 조회한다.
- [x] T032 [US4] 화면 활성화는 REGULAR·AVAILABLE을 따르며 제출 상태 재검사는 서버 판정에 맡긴다.
- [x] T033 [US4] 홈·앱 복귀 시 주간 상태를 강제 갱신하고 다른 화면의 stale 정책을 유지한다.
- [x] T034 [US4] 로그인·정적 모드·sessionId·선택 사진·receipt 진입 조건을 검증한다.
- [x] T035 [US4] TEAM 위치·코드 요청 0회와 접근성 자동 검증·미실행 실기기 항목을 기록한다.
- [x] T036 browser.ts의 실서버 passthrough만 제거하고 기존 생성 MSW 미구현 요청 차단을 따른다.
- [x] T037 실제 Stackflow의 사진 선택·참석자 선택·제출·완료·홈 복귀 통합 테스트와 README를 정리한다.
- [x] T038 check·build·diff와 최종 문서 정합성을 검증하고 신규 실행·캐시·미실행을 기록한다.
- [ ] T039 실제 iPhone 사진 선택·접수·승인 후 복귀·VoiceOver 확인. **사용자 요청으로 보류**.
- [x] T040 최종 구현·자동 검증 결과와 운영 진입·SDK 복구 방법을 기록한다. 최종 사용자 리뷰는 이 결과 제출로 요청한다.

## 사용자 리뷰로 대체·제외한 초기 작업

- T014·T016: 별도 team-attendance-query 래퍼·검증 계층을 만들지 않고 생성 Query 옵션을 화면에서 소비한다.
- T019의 initialPhotoSource·Effect 실행: 안내 클릭 콜백과 브리지 성공 후 이동으로 대체한다.
- T020의 동적 시작·종료 안내: 현재 UI에는 별도 시간 안내를 추가하지 않았다.
- T023 및 T022~T025의 즉시 업로드·키 교체: 최종 버튼 업로드와 File Context 수명으로 대체한다.
- T026~T027의 제출 직전 명단 비교·팀 이동 자동 초기화: 추가하지 않고 서버 접수 판정과 계정·화면 수명을 따른다.
- T028의 최종 버튼 PUT 0회: 최종 버튼에서 presign·PUT·접수를 수행하는 계약으로 대체한다.
- T036의 별도 모의 업로드 서비스: 추가하지 않고 실서버 전달 예외만 제거한다.

## 전달 경계

자동 테스트의 네이티브 응답·HTTP 응답은 모의 값이다. 실제 iPhone 검증을 대신하지 않는다.
현재 미커밋 변경은 사용자 리뷰용이며 commit·push·PR·배포는 별도 지시에 따른다.
누적 변경이 PR 제한을 넘으므로 PR 생성 전 독립 검토 단위로 분리한다.
