# 작업 목록: 회원용 세션 확인

**입력**: [명세](spec.md), [계획](plan.md), [모델](data-model.md), [계약](contracts/session-query.md).
T001~T006은 1단계 문서·이슈 연결 작업이다. 이 단계의 완료는 제품 구현·실기기 검증을 뜻하지 않는다.
각 단계 완료 후 리뷰와 다음 단계 승인을 받는다. 경로는 정식 저장소 반영 기준이다.

## 1단계 — 명세와 작업 기반

- [x] T001 현재 소스·API·Android·이슈 조사 결과를 `specs/017-member-sessions/research.md` 초안으로 정리한다.
- [x] T002 `specs/017-member-sessions/spec.md`, `plan.md`, `data-model.md`, `contracts/session-query.md`의 검토용 초안을 작성한다.
- [x] T003 `specs/017-member-sessions/tasks.md`, `quickstart.md`, `checklists/requirements.md`의 초안을 작성하고 참조·추적 관계를 검사한다.
- [x] T004 승인된 기능 이슈 [#328](https://github.com/YAPP-admin/yapp-plus-frontend/issues/328)을 `specs/017-member-sessions/validation.md`에 연결하고 초안을 정식 위치에 반영한다.
- [x] T005 `.specify/feature.json`의 feature_directory를 정식 위치로 지정하고 Spec Kit setup-plan/setup-tasks·전제조건 검사 결과를 `specs/017-member-sessions/validation.md`에 기록한다.
- [x] T006 1단계 check·변경량을 `specs/017-member-sessions/validation.md`에 기록하고 사용자 리뷰를 요청한다.

## 2단계 — 범위 정리와 인증 재설계 제거

- [x] T007 기존 인증 provider·mutation·화면 탐색 코드를 복원한다.
- [x] T008 추가한 인증 결과 적용기·탐색 경계·전용 테스트를 제거한다.
- [x] T009 홈·일정 조회 중심으로 명세·모델·계획을 정리한다.
- [x] T010 전체 캐시 초기화·늦은 인증 응답·화면 수명·복귀 복구를 인증 작업과의 연동 요구로 남긴다.
- [x] T011 복원 상태에서 check/build를 실행한다.
- [x] T012 범위 정리 결과를 보고하고 사용자 리뷰·다음 단계 진행 확인을 받았다.

## 3단계 — US2 네이티브 갱신을 사용하는 조회

독립 검증: SDK를 MSW에 연결하고 브리지 결과만 대역으로 주입한다.

- [x] T013 [US2] `apps/web/src/features/auth/model/native-auth-client.test.ts`에 401·403·최종 401·취소·다른 로그인 세션의 갱신 응답·낮은 토큰 버전 사례를 작성한다.
- [x] T014 [US2] `apps/web/src/features/auth/model/native-auth-client.ts`에 Provider가 제공할 client 옵션과 afterResponse의 1회 브리지 갱신 재요청을 구현한다.
- [x] T015 [US2] `apps/web/src/features/auth/model/native-auth.ts`의 기존 refreshSession을 재사용하고 `apps/web/src/features/auth/model/session.tsx`에서 apiOptions를 제공한다.
- [x] T016 [US2] `apps/web/src/features/auth/model/native-auth-client.test.ts`에서 SDK HTTP 오류 결과와 HTTP 재시도 상한을 검증한다. 소비 query의 retry: false 연결은 4단계에서 검증한다.
- [x] T017 [US2] `specs/017-member-sessions/validation.md`에 3단계 검증·변경량·리뷰 결과를 기록한다.

## 4단계 — 조회 데이터 기반

공통 기반: US3·US4가 소비할 조회·시간·목업을 화면 연결 전에 검증한다.

- [x] T018 `apps/web/src/shared/lib/korean-date-time.ts`와 인접 테스트에 한국 날짜·시간 표기와 종료 비교를 구현한다.
- [x] T019 [P] `apps/web/src/pages/schedule/model/schedule-schema.ts`와 인접 테스트에 생성 Zod 확장·ID·시간 검증을 추가하고 생성 find4Options의 원본 응답·서버 순서 보존을 검증한다.
- [x] T020 [P] `apps/web/src/pages/home/model/current-week-schema.ts`와 인접 테스트에 생성 Zod 확장과 생성 find3Options의 주간 조회·null을 검증한다. useSuspenseQuery의 인증별 렌더링 차단은 5·6단계 화면 경계에서 연결한다.
- [x] T021 `apps/web/src/mocks/session-handlers.ts`에 생성 faker의 날짜·시간만 보정하고 생성 MSW 핸들러를 사용하며 `browser.ts`, `server.ts`에 생성 기본 핸들러보다 먼저 연결한다.
- [x] T022 `specs/017-member-sessions/validation.md`에 4단계 생성 코드 재사용·응답 검증·시간 유틸리티 검증 결과를 기록한다.

## 5단계 — US3 전체 일정 화면

독립 검증: /schedule 직접 진입과 화면 상태별 MSW 응답을 사용한다.

- [x] T023 [US3] `apps/web/src/pages/schedule/ui/schedule-page.test.tsx`에 실제 조회·빈 결과·최초/재조회 오류·재시도 사례를 작성한다.
- [x] T024 [US3] `apps/web/src/pages/schedule/ui/schedule-page.tsx`에서 DEFAULT_SCHEDULES 기본값을 제거하고 query와 조회 상태를 연결한다.
- [x] T025 [US3] `apps/web/src/pages/schedule/ui/schedule-item.tsx`, `schedule-empty.tsx`에 확정 표기와 조회 시점의 종료 여부·접근성 안내를 반영한다.
- [x] T026 [US3] `apps/web/stackflow/src/stack.test.tsx`에 일정 직접 진입·탭 복귀·비목업 브라우저 요청 차단을 검증한다.
- [ ] T027 [US3] check/build·키보드·변경량과 iOS Safari 오류·정상 화면 근거를 기록했다. 실제 WebView·실기기 접근성 확인이 남아 있다.

## 6단계 — US4 홈 세션 카드

독립 검증: 홈만 진입해 이번 주 조회를 검증하고 전체 일정 API 호출이 없는지 확인한다.

- [x] T028 [US4] `apps/web/src/pages/home/ui/home-page.test.tsx`에 주간 카드·달력·빈 결과·오류와 모의 성공 차단 사례를 작성한다.
- [x] T029 [US4] `apps/web/src/pages/home/ui/home-page.tsx`에 생성 find3Options·null·오류·주간 날짜·당일 문구와 응답 기준 주 경계 stale 처리를 연결한다.
- [x] T030 [US4] `apps/web/src/pages/home/ui/home-page.tsx`의 미연동 실행을 비활성화하고 준비 중 안내·유도 tooltip·바로가기 접근성 이름을 정리한다.
- [x] T031 [US4] `apps/web/stackflow/src/activities/legacy.tsx`와 홈 소비 경계에서 모의 URL/초기 상태를 DEV+MSW에 제한한다.
- [x] T032 [US4] `apps/web/src/pages/home/ui/home-page.test.tsx`와 `apps/web/stackflow/src/stack.test.tsx`에서 실서비스 차단·목업 시연·홈/일정 복귀를 검증한다.
- [ ] T033 [US4] 자동 검증·check/build·변경량은 기록했다. 사용자가 화면 동작을 확인했다. 실기기 접근성 확인이 남아 있다.

## 7단계 — 통합 검증과 출시 준비

main의 #329 구현을 병합했다. 실제 인증 mutation과 홈·일정 query의 계정 경계,
401 갱신 결과의 Provider 반영과 focus 복귀 시 계정 전환을 자동 검증했다.
T035의 조회 정책 검증은 완료했지만, 실제 WebView 복귀·BFCache 검증은 남아 있다. 상세 현황은 validation.md의 병합 후 기록을 따른다.

- [ ] T034 인증 작업의 전체 캐시 초기화·늦은 결과 차단·복귀 확인을 두 조회와 통합 검증한다. 인증 상태 관리 구현은 여기서 추가하지 않는다.
- [x] T035 사용자 리뷰로 동시 조회를 허용했다. 기본 mount/focus/reconnect 재조회와 정상 native 세션의 focus 재확인, 인증 진행·가입 대기·미지원 예외를 검증했다. 수동 복귀 Effect와 선행 조회 차단은 구현하지 않는다. BFCache 이전 화면 비노출은 별도 미완료다.
- [ ] T036 `specs/017-member-sessions/quickstart.md`의 WebView·오프라인·계정 전환·키보드/스크린 리더/터치 시나리오를 실행하고 `validation.md`에 증거를 기록한다.
- [x] T037 `specs/017-member-sessions/validation.md`에 최종 check/build·신규 실행/캐시·미실행·롤백 기준·base 대비 변경량을 기록했다. 실제 WebView 검증 보류와 PR 분리 필요를 명시했으며 출시 완료를 뜻하지 않는다.

## 의존성과 실행 전략

1 → 2(범위 정리) → 3(US2) → 4 → 5(US3) → 6(US4) → 7 순서와 사용자 리뷰 경계를 지킨다.
최소 제품 시연은 5단계의 전체 일정이지만 홈·실환경 검증을 생략한 기능 완료로 보고하지 않는다.
T019와 T020만 공통 시간·인증 기반 완료 후 독립 파일에서 병렬 작성할 수 있다. 단계 간 병렬 구현은 하지 않는다.
US1은 인증 작업과의 통합 검증이며, US2는 HTTP/브리지 경계, US3·US4는 각각 화면 테스트가 주 검증 계층이다.
작업 식별자는 추적을 위해 T001~T037을 유지한다.
