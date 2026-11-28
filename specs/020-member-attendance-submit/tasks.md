# 작업 목록: 회원 코드 출석과 사전 출결 보고

입력: [명세](spec.md)·[계획](plan.md). 갱신일: 2026-11-28. 총 28개 작업.
T001~~T022는 #385의 과거 작업·리뷰 기록이며 미확인 상태를 임의로 완료 처리하지 않는다.
이번 #664의 복수 선택·수정은 T023~~T028이다. 사용자가 이슈 생성과 다음 문서 작업 진행을 승인했다.

## 준비

- [x] T001 Android 날짜 기준·서버 계약·기존 연결을 조사하고 `specs/020-member-attendance-submit/research.md`에 기록한다.
- [x] T002 `specs/020-member-attendance-submit/spec.md`와 설계 문서를 작성하고 요구사항 체크리스트를 검토한다.
- [x] T003 `.context/member-attendance-issue.md`의 이슈 생성 승인·번호 확인과 초안 리뷰 후 명세를 `specs/`의 다음 사용 가능한 번호로 옮긴다.

## 구현 공통 기반

- [x] T004 `apps/web/src/pages/home/model`에서 생성 SDK·스키마와 계정 경계로 출석 제출의 입력·응답 검증을 마련한다. 완료 상태는 생성된 `verifyMutation`의 성공 결과를 계정별로 구독한다.

## US1 — 코드 출석, 첫 구현 리뷰 단위

목표: 홈 → 코드 제출 → 서버 확인 → 완료 → 홈까지 독립적으로 동작한다.

- [x] T005 [US1] `apps/web/src/pages/home/ui/home-page.test.tsx` 및 인접 시트 테스트에 출석 상태·코드·성공·실패의 회귀 사례를 작성하고 수정 전 실패를 확인한다.
- [x] T006 [US1] `apps/web/src/pages/home/ui/current-week-card.tsx`에 서버 상태별 버튼과 해당 계정·세션의 완료 표시를 연결한다.
- [x] T007 [US1] `apps/web/src/pages/home/ui/home-demo-sheets.tsx`에서 코드 시연을 실제 검증 흐름으로 분리하고 네 자리 붙여넣기·로딩·오류·중복 방지를 연결한다.
- [x] T008 [US1] `apps/web/stackflow/src/activities/home-sheets.tsx`에 운영 출석 진입·대상 확인·완료 탐색을 연결하고 직접 진입·인증 복구·계정 변경·화면 이탈 회귀를 추가한다.
- [ ] T009 [US1] `quickstart.md`의 출석 검증과 check/build·실제 base 대비 변경량을 확인해 정식 명세의 `validation.md`에 기록하고 사용자 리뷰를 받는다. 자동 검증 완료, 실기기 확인·리뷰 대기.

## US2 — 사전 보고 1단계: 문서

목표: 확정된 정책과 구현·검증 경계를 문서로 검토한다. 과거 T009의 미확인 항목을 임의로 완료 처리하지 않는다.

- [x] T010 [US2] `specs/020-member-attendance-submit/`의 명세·계획·데이터·계약·조사·체크리스트·검증 절차를 인터뷰 결과로 갱신한다.
- [ ] T011 [US2] `specs/020-member-attendance-submit/validation.md`에 문서 검증·변경량을 기록하고 사용자 리뷰 및 2단계 진행 확인을 받는다.

## US2 — 사전 보고 2단계: 제출·마감 처리

목표: 운영 진입을 열지 않고 유효한 제출·마감·오류를 가까운 테스트에서 독립 검증한다.

- [x] T012 [US2] `apps/web/src/pages/home/model/attendance-report.test.tsx`에 입력·시각 경계·요청·응답·오류·중복·계정 격리 회귀를 먼저 작성하고 기존 미연동 상태에서 실패를 확인한다. 제출 직전 추가 GET이 없음을 포함한다.
- [x] T013 [US2] `apps/web/src/pages/home/model/attendance-report.ts`에 생성 SDK·주간 Query·시작 전 제한·submit1Mutation의 mutate·오류 복구를 구현한다. 현재 화면이 응답 본문을 소비하지 않으므로 별도 `responseValidator`는 두지 않는다. 입력은 필수, POST 자동 재실행과 제출 전 재조회는 금지한다.
- [x] T014 [US2] `apps/web/src/mocks/session-handlers.ts`와 `apps/web/src/mocks/attendance-handlers.test.ts`에 생성 보고 핸들러의 요청 검증·성공을 추가하고 실패·지연은 인접 테스트에서 재정의한다. 별도 가짜 저장소는 만들지 않는다.
- [x] T015 [US2] 인접 테스트·check와 실제 base 대비 변경량을 `specs/020-member-attendance-submit/validation.md`에 기록하고 2단계 리뷰·3단계 진행 확인을 받는다.

## US2 — 사전 보고 3단계: 화면·운영 탐색

목표: 홈에서 보고를 열어 입력·서버 제출·완료·홈 복귀까지 같은 운영 코드로 확인한다.

- [x] T016 [US2] `apps/web/src/pages/home/ui/attendance-report-sheet.tsx`로 보고 시트를 분리하고 `home-demo-sheets.tsx`의 시연을 교체한다. 필수 Form·유형 미선택·한 줄 사유·카운터·규정·세션·로딩·오류·마감·잠금과 인접 스타일을 연결한다.
- [x] T017 [US2] `apps/web/src/pages/home/index.ts`, `ui/home-page.tsx`, `apps/web/stackflow/src/activities/home-sheets.tsx`와 `stack.tsx`에 운영 인증 진입·보고 step·뒤로가기·완료 안내를 연결한다. 코드 출석·팀 사진·브라우저/정적 모드 제한을 보존한다.
- [x] T018 [US2] `apps/web/src/pages/home/ui/attendance-report-sheet.test.tsx`, `home-page.test.tsx`, `apps/web/stackflow/src/stack.test.tsx`에서 대표 흐름·직접 진입·입력 보존/폐기·마감·계정 변경·늦은 응답을 검증한다. 모델의 오류 조합은 중복하지 않는다.
- [ ] T019 [US2] 관련 회귀·check/build·변경량을 `specs/020-member-attendance-submit/validation.md`에 기록하고 3단계 리뷰·4단계 진행 확인을 받는다.

## US2 — 사전 보고 4단계: 통합·화면 검증

목표: 자동 검증과 실제 브라우저 근거를 확보하고 실기기·실서버 미검증을 분리한다.

- [ ] T020 [US2] `specs/020-member-attendance-submit/quickstart.md`에 따라 정상·실패·마감·키보드·모바일 크기·한국어 입력을 브라우저에서 확인하고 `.context/`에 익명 화면 근거를 보관한다. 발견 문제는 해당 소스·인접 테스트에서 수정한다.
- [ ] T021 변경에 영향받은 테스트·품질 게이트 결과와 새 실행/캐시, 실기기·실서버 미검증을 `specs/020-member-attendance-submit/validation.md`에 정리한다.
- [ ] T022 최종 변경량·PR 분리 여부·복구 방법·남은 검증을 `specs/020-member-attendance-submit/validation.md`에 기록하고 최종 리뷰를 받는다.

## 의존성과 실행 방식

기존 코드 출석은 유지한다. 과거 #385의 순서는 T010–T011 → T012–T015 → T016–T019 → T020–T022였다.
각 화살표에서 사용자 리뷰와 다음 단계 진행 확인이 필요하다. 최소 완결 흐름은 3단계까지이며
4단계 브라우저 검증 전에는 완료로 보고하지 않는다. 문서 링크 점검과 화면 근거 조회는 독립적으로
확인할 수 있지만 같은 모델·UI·Activity의 구현 단계는 순차 진행한다.
650줄에서 분리를 검토하고 800줄 이상이면 후속 구현 전에 검토 가능한 목적별 PR 분리 계획을 제출한다.

## #664 — 복수 선택·수정 1단계: 문서

- [x] T023 이슈 #664를 생성·확인하고 기존 명세·계획·데이터·계약·검증 절차를 확정한 정책과 문구로 갱신한다.
- [x] T024 문서 형식·링크·변경량과 검증 결과를 기록하고 사용자 문서 리뷰 및 구현·검증 단계 진행 확인을 받는다.

## #664 — 복수 선택·수정 2단계: 구현·검증

- [x] T025 보고 모델에 생성 조회 옵션·응답 검증·초기값·코드포인트 입력 검증·POST/PUT 분기·오류 안내·캐시 무효화를 연결한다. MSW 조회·생성·수정 상태와 모델 회귀 테스트를 함께 갱신한다.
- [x] T026 보고 시트를 체크박스·유형별 제목/예시·6px 간격·원문 사유·blur/제출 검증·오류 포커스·입력 보존·수정 버튼으로 갱신하고 시트 회귀를 추가한다.
- [ ] T027 Stackflow의 신규·수정·재진입 대표 흐름과 기존 인증·마감·중복 제출 제한을 검증한다. 브라우저에서 줄바꿈·6px 간격·키보드·IME를 확인하고 스크린 리더·터치의 실제 실행 여부를 기록한다.
- [x] T028 check/build를 실행하고 새 실행·Turbo 캐시·실패·미실행·변경량·복구 방법을 validation.md에 기록한 뒤 구현 결과를 제출한다.

T027의 자동 회귀·모바일 크기 화면 확인은 실행했다. 실제 한국어 IME·스크린 리더·터치는 미실행이며 validation.md에 구분한다.

이번 순서는 T023–T024 → T025–T028이다. 문서 리뷰 후 구현에 착수하며 650줄부터 목적별 PR 분리를 검토한다.
