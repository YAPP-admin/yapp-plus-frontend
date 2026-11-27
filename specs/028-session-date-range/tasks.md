# Tasks: 세션 시작일·종료일 분리

**Input**: Design documents from `/specs/028-session-date-range/`

## Phase 1: Foundational contract

- [x] T001 [P] API 생성 타입·Zod·Faker의 관리자 세션 요청·응답 날짜 필드를 `startDate`·`endDate`로 갱신한다.
- [x] T002 [P] `packages/api/src/mocks/fixtures.ts`의 관리자 세션 fixture를 날짜 범위 계약에 맞춘다.

## Phase 2: User Story 1 - 세션 기간 입력

- [x] T003 [US1] `apps/admin/src/pages/sessions/model/session-form.ts`의 폼 값·기본값·제출 변환을 시작일·종료일로 변경한다.
- [x] T004 [US1] `apps/admin/src/pages/sessions/ui/session-form.tsx`에 시작일·종료일 필드를 표시한다.
- [x] T005 [US1] `apps/admin/src/pages/sessions/model/session-api-model.ts`의 API 변환을 날짜 범위로 변경하고 기존 단일 날짜 응답을 동일 날짜로 복원한다.
- [x] T006 [US1] `apps/admin/src/pages/sessions/ui/session-card.tsx`와 `sessions-page.tsx`의 기간 표시·시작일 정렬을 갱신한다.
- [x] T007 [US1] 관리자 출석 상세의 세션 시작·종료 일시 변환을 새 응답 필드에 맞춘다.

## Phase 3: User Story 2 - 일정 경계 검증

- [x] T008 [US2] 모델 테스트에 같은 날짜·다음 날짜·역전 날짜의 검증 사례를 추가한다.
- [x] T009 [US2] API 변환·폼·카드·페이지 테스트의 날짜 fixture와 기대값을 갱신하고 기간 표시를 검증한다.

## Phase 4: Polish and validation

- [x] T010 [P] 세션 관련 테스트를 실행하고 실패 원인을 수정한다.
- [x] T011 `node --run check`를 실행하고 결과를 quickstart 및 최종 보고에 기록한다.
- [ ] T012 백엔드 OpenAPI 원본 갱신 및 생성 명령 재실행이 필요한 후속 조건을 문서와 최종 보고에 남긴다.

## Dependencies & Execution Order

- T001·T002 → T003~T007 → T008·T009 → T010·T011
- T012는 코드 검증과 독립적으로 확인하되 실서버 배포 전 필수다.
