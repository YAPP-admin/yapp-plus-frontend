# 작업 목록: 마이페이지 프로필 조회

**입력**: [명세](spec.md), [계획](plan.md), [연구](research.md), [모델](data-model.md), [계약](contracts/profile-query.md)
**표기**: `[P]`는 선행 작업 완료 후 다른 파일과 병렬 가능한 작업, `[USn]`은 사용자 스토리다.
테스트는 승인된 계획의 필수 작업이다. 회귀 사례를 먼저 추가하고 구현 전 실패·구현 후 성공을 확인한다.

## 1단계 — 준비와 명세

- [x] T001 승인된 이슈 #413을 생성·재조회하고 `specs/022-my-profile/validation.md`에 기록한다.
- [x] T002 `specs/022-my-profile/spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/profile-query.md`, `quickstart.md`, `checklists/requirements.md`, `tasks.md`를 작성한다.
- [x] T003 문서 링크·작업 형식·명세 품질·check·diff 검사를 수행하고 `specs/022-my-profile/validation.md`에 결과와 변경량을 기록한다.
- [ ] T004 1단계 결과를 제출하고 사용자 리뷰·2단계 진행 확인을 `specs/022-my-profile/validation.md`에 기록한다.

**리뷰 경계**: T004 완료 전 생성기와 제품 코드를 변경하지 않는다.

## 2단계 — 공용 생성 기반과 호환성

- [x] T005 최신 OpenAPI를 `.context/profile-openapi.json`에 받아 프로필 계약을 확인하고 수신 시각·해시를 `specs/022-my-profile/validation.md`에 기록한다.
- [x] T006 기존 `packages/api/openapi-ts.config.ts`와 고정 도구로 `packages/api/src/generated/`를 재생성한다.
- [x] T007 `packages/api/src/mocks/handlers.ts`, `apps/web/src/`, `apps/admin/src/`의 생성 소비 지점을 HTTP 경로·메서드와 대조해 필요한 호환성만 수정한다.
- [x] T008 생성 validator의 원본 JSON 보존을 확인하고 전체 check/build·operation 대응·변경량을 `specs/022-my-profile/validation.md`에 기록한다.
- [x] T009 변경량에 따른 분리 필요성을 보고하고 2단계 리뷰·3단계 진행 확인을 `specs/022-my-profile/validation.md`에 기록한다.

**리뷰 경계**: T009 완료 전 프로필 연결을 시작하지 않는다. 800줄 이상이면 분리 방안부터 확정한다.

## 3단계 — 사용자 스토리별 연결

### US1 — 본인 프로필 표시 (P1)

목표: 네 항목을 서버 계약대로 표시한다. 정상·소속 없음·직군 없음과 세션 이름 불일치로 독립 검증한다.

- [ ] T010 [P] [US1] `apps/web/src/pages/my/model/profile-model.test.ts`에 모든 상태·직군·기수·null 표시 변환 사례를 추가한다.
- [ ] T011 [P] [US1] `apps/web/src/pages/my/model/profile-query.test.ts`에 생성 요청·검증 오류·원본 number 보존·성공 캐시 오염 방지 사례를 추가한다.
- [ ] T012 [US1] `apps/web/src/pages/my/model/profile-query.ts`에 생성 옵션과 responseValidator 연결, `profile-model.ts`에 생성 타입 기반 표시 변환을 구현한다.
- [ ] T013 [US1] `apps/web/src/mocks/member-profile-handlers.ts`의 생성 타입 fixture·핸들러를 `browser.ts`와 `server.ts`의 공용 fallback 앞에 연결한다.
- [ ] T014 [US1] `apps/web/src/pages/my/ui/my-page.test.tsx`에 API 이름 전용·null 화면 사례를 추가하고 기존 세션 이름·전역 — 개수 기반 검증을 프로필 영역 기준으로 갱신한다.
- [ ] T015 [US1] `apps/web/src/pages/my/ui/profile-section.tsx`와 `my-page.tsx`에 조회·표시를 연결하고 세션 이름 fallback을 제거한다.

### US2 — 독립적인 실패와 복구 (P1)

목표: 프로필 장애 중 출석·메뉴를 유지한다. 프로필 지연·실패·재시도와 출석 실패를 분리해 검증한다.

- [ ] T016 [US2] `apps/web/src/pages/my/ui/my-page.test.tsx`에 최초 지연·409/503·네트워크 오류·성공 후 재조회 실패의 UI 사례를 추가한다. 잘못된 응답 조합은 T011에서만 검증한다.
- [ ] T017 [US2] `apps/web/src/pages/my/ui/profile-section.tsx`에 프로필 전용 ScreenQueryBoundary·Suspense·로딩·오류·이전 값 안내와 재시도를 구현한다.
- [ ] T018 [US2] `apps/web/src/pages/my/ui/my-page.test.tsx`에서 프로필·점수 양방향 독립성, 메뉴·규칙 유지, 재시도 대상과 중복 실행 차단을 확인한다.
- [ ] T019 [US2] `apps/web/src/pages/my/ui/profile-section.tsx`의 상태 역할·오류 안내·버튼 이름·loading/disabled를 확인하고 필요한 범위만 `my-page.css.ts`에 반영한다.

### US3 — 인증과 화면 수명 (P1)

목표: 현재 계정만 조회하고 기존 복귀 정책을 따른다. 미로그인·계정 변경·늦은 응답·복귀로 독립 검증한다.

- [ ] T020 [US3] `apps/web/src/pages/my/ui/my-page.test.tsx`에 브라우저 요청 차단, 로그아웃·계정 전환 시 이전 프로필과 늦은 응답 차단 사례를 기존 인증 경계와 연결해 추가한다.
- [ ] T021 [US3] `apps/web/src/pages/my/ui/profile-section.tsx`에서 인증 apiOptions·요청 허용 조건·useRefetchOnScreenReturn을 연결하고 전용 인증/캐시 계층이 없는지 확인한다.
- [ ] T022 [US3] `apps/web/src/pages/my/ui/my-page.test.tsx`에서 stale·fresh 복귀를 확인하고 `apps/web/src/mocks/browser.ts` 연결이 개발 전용임을 검증한다.

### 3단계 종료

- [ ] T023 관련 테스트·화면 근거·변경량과 사용자 리뷰·4단계 진행 확인을 `specs/022-my-profile/validation.md`에 기록한다.

## 4단계 — 최종 품질과 완료 보고

- [ ] T024 [P] `specs/022-my-profile/quickstart.md`에 따라 모바일 너비·긴 이름·테마·키보드·터치·스크린 리더를 확인하고 `.context/`에 비식별 화면 근거를 남긴다.
- [ ] T025 [P] 인증된 WebView·실서버 조회를 확인하거나 미실행 사유와 위험을 `specs/022-my-profile/validation.md`에 기록한다.
- [ ] T026 전체 check/build·diff 검사와 실제 base 대비 변경량을 `specs/022-my-profile/validation.md`에 기록한다. 신규 실행과 Turbo 캐시를 구분한다.
- [ ] T027 `specs/022-my-profile/checklists/requirements.md`, `tasks.md`, `validation.md`의 완료 표시를 실제 결과와 대조하고 최종 변경·검증·복구·남은 제한을 제출한다.

## 의존성과 병렬 가능성

`T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009` 순서다.
3단계는 US1(T010~~T015) 기반을 만든 뒤 같은 화면을 수정하는 US2(T016~~T019), US3(T020~T022)를 순서대로 연결한다.
T023 리뷰 후 T024·T025는 서로 다른 확인 환경에서 병렬 가능하며 T026·T027로 종료한다.

- US1: T009 이후 서로 다른 모델 테스트 T010·T011을 병렬 작성할 수 있다.
- US2: 같은 `my-page.test.tsx`·`profile-section.tsx`를 수정하므로 병렬 편집하지 않는다.
- US3: 같은 화면 테스트·인증 연결을 검증하므로 병렬 편집하지 않는다.
- 병렬 가능 표시는 단계 리뷰를 건너뛰거나 자동으로 다른 에이전트를 실행하는 승인이 아니다.

## 전달 전략

US1을 먼저 개발 시연 가능한 최소 단위로 검증한다. US2·US3도 이번 출시의 필수 범위이므로
US1만으로 기능 완료나 배포를 선언하지 않는다. 각 단계별 테스트는 변경에 가까운 계층에서 실행하며,
변경·실패·미해결 우려가 없으면 동일 검증을 불필요하게 반복하지 않는다. commit·push·PR·배포는 별도 승인 대상이다.
