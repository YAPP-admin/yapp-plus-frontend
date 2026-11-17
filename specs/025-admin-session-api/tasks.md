# 작업 목록: 어드민 세션 API 연결

**입력**: [명세](spec.md)·[계획](plan.md)·[모델](data-model.md)·[계약](contracts/session-api.md)
**상태**: 2단계 공통 경계 구현·검증 완료, 사용자 리뷰 대기. 이후 단계는 리뷰·진행 확인 전 착수하지 않는다.

테스트는 합의된 수용 기준이다. 회귀 테스트는 가능한 경우 수정 전 실패를 확인한다.
`[P]`는 같은 승인 단계 안에서 파일이 겹치지 않는 작업만 뜻하며 다음 단계 진행 승인이 아니다.
경로는 저장소 루트 기준이고 아직 없는 제품 파일은 해당 구현 단계에서 만든다.

## 1단계 — 준비·명세·설계

목표: 제품 구현 없이 계약과 작업 순서를 리뷰할 수 있게 한다.

- [x] T001 현재 브랜치·main·작업 트리를 확인하고 이슈 #462를 `specs/025-admin-session-api/spec.md`에 연결한다.
- [x] T002 `specs/025-admin-session-api/plan.md`, `research.md`, `data-model.md`, `contracts/session-api.md`, `quickstart.md`에 계약·설계·복구를 작성한다.
- [x] T003 `specs/025-admin-session-api/tasks.md`와 `checklists/requirements.md`에 단계별 수용 기준·문서 품질 검토를 기록한다.
- [x] T004 문서 링크·작업 형식·변경량과 루트 check 결과를 `specs/025-admin-session-api/validation.md`에 기록한다.
- [x] T005 1단계 사용자 리뷰와 2단계 진행 확인을 `specs/025-admin-session-api/validation.md`에 기록한다.

## 2단계 — 공통 경계

목표: UI 연결 없이 기수 설정·조회/입력 모델·오류를 검증한다.
독립 검증: 설정 누락, 초 단위 시간, 불완전한 집계와 유형별 요청을 모델에 공급한다.

- [x] T006 [P] `apps/admin/src/pages/sessions/model/session-config.test.ts`에 기수 설정 누락과 설정값 전달 테스트를 추가한다.
- [x] T007 [P] `apps/admin/src/pages/sessions/model/session-api-model.test.ts`에 시간 보존과 같은 분 안의 원본 일정·집계·시작 상태·유형별 요청 변환을 검증한다.
- [x] T008 `apps/admin/src/pages/sessions/model/session-api-model.ts`에 생성 타입 기반 조회 ViewModel·요청 변환을, `session-form.ts`에 API 연결용 폼 입력 스키마를 구현한다.
- [x] T009 `apps/admin/src/pages/sessions/model/session-config.ts`와 `apps/admin/.env.example`에 기수 ID 검증·설정 안내를 추가한다.
- [x] T010 `apps/admin/src/pages/sessions/model/session-error.test.ts`에 ApiError·본문 검증 실패·401·400·404·409·전송 결과 불명확 사례를 추가한다.
- [x] T011 `apps/admin/src/pages/sessions/model/session-error.ts`에 원본 응답을 노출하지 않는 오류 변환과 공개 계약 주석을 작성한다.
- [x] T012 검증·변경량·2단계 리뷰와 다음 단계 진행 확인을 `specs/025-admin-session-api/validation.md`에 기록한다.

## 3단계 — US1 목록 연결 (P1, 최소 기능)

목표: 실제 SDK 조회와 기존 필터를 연결한다. 독립 검증: MSW 정상·빈·오류 응답으로 목록을 확인한다.

- [x] T013 [P] [US1] `apps/admin/src/pages/sessions/ui/sessions-page.test.tsx`에서 생성 Query 옵션의 기수·전체 유형·인증 헤더와 404 재시도를 확인한다.
- [x] T014 [P] [US1] `apps/admin/src/pages/sessions/ui/sessions-page.test.tsx`를 MSW 기반 조회·빈/오류·필터 테스트로 전환한다.
- [x] T015 [US1] `apps/admin/src/pages/sessions/ui/sessions-page.tsx`에서 생성 `find1Options`를 직접 사용해 signal·key를 포함한 전체 조회를 구현한다.
- [x] T016 [US1] `apps/admin/src/pages/sessions/ui/sessions-page.tsx`, `session-list.tsx`, `session-card.tsx`를 전용 모델·상태에 연결하고 미연결 변경 액션을 노출하지 않는다.
- [x] T017 [US1] `apps/admin/src/routes/_dashboard/sessions.tsx`와 `apps/admin/src/pages/sessions/index.ts`에 검증한 ID 주입을 연결하고 출석의 기존 모의 소비 경로를 유지한다.
- [ ] T018 [US1] 검증·변경량·화면 근거·3단계 리뷰를 `specs/025-admin-session-api/validation.md`에 기록한다.

## 4단계 — US2 공통 폼 준비 (P1, US3에서도 재사용)

목표: 저장 액션을 노출하기 전에 실제 요청 입력 계약을 완성한다.
독립 검증: 폼 props로 정상 세션을 주입해 입력·복원·취소를 확인한다.

- [ ] T019 [US2] `apps/admin/src/pages/sessions/ui/session-form.test.tsx`, `session-location-recovery.test.tsx`에서 정규 필수 장소·팀 무입력·255자·좌표 0·저장 좌표 복원을 검증한다.
- [ ] T020 [US2] `apps/admin/src/pages/sessions/model/session-form.ts`를 전용 입력 모델·원본 시간 보존·유형별 요청 계약으로 바꾸고 팀 안내 초안을 제거한다.
- [ ] T021 [US2] `apps/admin/src/pages/sessions/ui/session-form.tsx`에서 팀 입력 제거·유형 왕복 초안을 처리하고 `session-dialogs.tsx`의 미사용 모의 저장 래퍼를 제거해 새 폼 계약과의 타입 충돌을 막는다.
- [ ] T022 [US2] 기존 주소 경합 테스트와 폼 검증·화면 근거·4단계 리뷰를 `specs/025-admin-session-api/validation.md`에 기록한다.

## 5단계 — US2 생성 연결 (P1)

목표: 생성 결과와 목록 갱신을 분리한다. 독립 검증: 정상·날짜 충돌·지연·재조회 실패를 공급한다.

- [ ] T023 [US2] `apps/admin/src/pages/sessions/model/session-api.test.ts`에 생성 전체 본문·201 ID·400/401/404/409·HTTP 재시도 없음 테스트를 추가한다.
- [ ] T024 [US2] `apps/admin/src/pages/sessions/model/session-api.ts`, `session-queries.ts`에 create2와 기본 online 모드를 사용하는 Mutation·이전 목록 취소·무효화를 구현한다.
- [ ] T025 [US2] `apps/admin/src/pages/sessions/ui/session-dialogs.tsx`, `sessions-page.tsx`에 `mutate` 콜백 기반 실제 생성·전체 필터·완료 안내·중복 방지·실패 시 초안 유지를 연결한다.
- [ ] T026 [US2] `apps/admin/src/pages/sessions/ui/sessions-page.test.tsx`에서 최초 list 지연→create 성공→old list 완료, 저장 성공→refetch 실패, 오프라인·이동 후 완료를 회귀 검증한다.
- [ ] T027 [US2] 검증·변경량·화면 근거·5단계 리뷰를 `specs/025-admin-session-api/validation.md`에 기록한다.

## 6단계 — US3 수정 연결 (P2)

목표: 저장값 보존과 수정 제한을 처리한다. 독립 검증: 기존 세션의 정규·팀 전환과 204·409를 확인한다.

- [ ] T028 [US3] `apps/admin/src/pages/sessions/model/session-api.test.ts`에서 수정 ID·전체 본문·204·날짜/수정 충돌·대상 없음을 검증한다.
- [ ] T029 [US3] `apps/admin/src/pages/sessions/model/session-api.ts`, `session-queries.ts`에 update1·캐시 무효화·저장/갱신 실패 분리를 연결한다.
- [ ] T030 [US3] `apps/admin/src/pages/sessions/ui/session-dialogs.tsx`, `session-card.tsx`에 `mutate` 콜백 기반 실제 수정·필터 유지·유형 변경 안내·페이지 수명을 연결한다.
- [ ] T031 [US3] `apps/admin/src/pages/sessions/ui/sessions-page.test.tsx`에서 수정 장소·시간 복원, 갱신 실패와 이동 후 오래된 탐색·알림 방지를 검증한다.
- [ ] T032 [US3] 검증·변경량·화면 근거·6단계 리뷰를 `specs/025-admin-session-api/validation.md`에 기록한다.

## 7단계 — US4 삭제 연결 (P2)

목표: 출석 시작 전 확인된 세션만 삭제한다. 독립 검증: 취소·204·404·상태 경합 409를 공급한다.

- [ ] T033 [US4] `apps/admin/src/pages/sessions/model/session-api.test.ts`에 DELETE 경로·무본문·204·404·409·자동 재시도 없음 테스트를 추가한다.
- [ ] T034 [US4] `apps/admin/src/pages/sessions/model/session-api.ts`, `session-queries.ts`에 delete1·이전 조회 취소·확인된 삭제 항목과 네 개수 갱신·재조회를 구현한다.
- [ ] T035 [US4] `apps/admin/src/pages/sessions/ui/session-delete-dialog.tsx`에 SEED AlertDialog·세션명·취소 초기 포커스·요청 중 잠금·실패 안내를 구현한다.
- [ ] T036 [US4] `apps/admin/src/pages/sessions/ui/session-card.tsx`, `session-list.tsx`, `sessions-page.tsx`에 `mutate` 콜백 기반 삭제 메뉴·STARTED 비활성 이유·완료 후 목록 제목 포커스를 연결한다.
- [ ] T037 [US4] `apps/admin/src/pages/sessions/ui/session-delete-dialog.test.tsx`와 `sessions-page.test.tsx`에 취소 무요청·409 경합·404 구분·마지막 항목·count·포커스·삭제 후 refetch 실패를 책임별로 검증한다.
- [ ] T038 [US4] 검증·변경량·화면 근거·7단계 리뷰를 `specs/025-admin-session-api/validation.md`에 기록한다.

## 8단계 — 통합·접근성·운영 기록

목표: 네 흐름의 연결과 실서버 후속 조건을 검토한다.

- [ ] T039 `apps/admin/src/router.test.tsx`에 실제 라우트의 기수 설정 안내와 대표 CRUD 연결·출석 mock 분리 사례를 추가한다.
- [ ] T040 키보드·스크린 리더·터치에서 폼·오류·삭제 포커스를 확인하고 `.context/session-api/`에 합성 데이터 화면 근거를 남긴다.
- [ ] T041 `apps/admin/README.md`와 `specs/025-admin-session-api/quickstart.md`에 설정·고정 MSW 한계·실서버 후속·복구 절차를 반영한다.
- [ ] T042 관련 테스트·루트 check·build와 형식·주석·공개 경계·PR 크기를 검증하고 `specs/025-admin-session-api/validation.md`에 새 실행·캐시·미실행을 기록한다.
- [ ] T043 최종 단계 리뷰와 실제 기수 ID 확보·실서버 검증의 후속 상태를 `specs/025-admin-session-api/validation.md`에 기록한다.

## 의존성과 실행 전략

1단계 리뷰 → 2단계 → US1(3단계) → US2 폼(4단계) → US2 생성(5단계) → US3(6단계) → US4(7단계) → 8단계.
모든 화살표는 해당 단계 검증·사용자 리뷰·다음 단계 진행 확인을 포함한다. 3단계가 조회만 가능한
최소 결과다. 수정·삭제는 검증된 fixture만으로도 해당 흐름을 독립 테스트할 수 있다.

병렬 가능한 예: 2단계 T006/T007, US1의 T013/T014는 서로 다른 파일이다. US2·US3·US4는
같은 서비스·Query·페이지 파일을 수정하므로 구현은 순차 처리한다. 승인된 단계 안에서 순수 모델
검증과 화면 시나리오 검토만 독립적으로 나눌 수 있다. 이 문서는 별도 병렬 구현을 요구하지 않는다.

제품 코드 변경 단계마다 관련 테스트와 check/build를 실행한다. 공통 UI 변경이 실제로 생기면
해당 Storybook 사례도 확인한다. 결과 기록·리뷰가 끝나기 전 다음 단계로 넘어가지 않는다.
실제 기수 ID·실서버 검증은 이번 43개 작업의 완료와 별개인 후속 조건이며 현재 완료 체크하지 않는다.
