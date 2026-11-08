# 작업 목록: 회원 공지 조회·읽음 연동

**입력**: [명세](spec.md), [계획](plan.md), [모델](data-model.md), [계약](contracts/member-notices.md), [검증](quickstart.md).
기능 회귀 테스트는 명세와 저장소 지침에 따라 각 구현 단계에서 먼저 작성한다. 가능한 회귀는 수정 전 실패·수정 후 통과를 확인한다.
`[P]`는 같은 단계 내 독립 파일 작업이며 단계 리뷰를 생략하거나 자동으로 다른 에이전트에게 위임한다는 뜻이 아니다.

## 1단계 — 명세와 작업 준비

- [x] T001 specs/019-member-notices/spec.md, research.md에 승인 범위·기준·최신 명세 비교를 기록한다.
- [x] T002 specs/019-member-notices/plan.md, data-model.md, contracts/member-notices.md에 구조·신뢰 경계·상태·복구를 정의한다.
- [x] T003 specs/019-member-notices/quickstart.md, tasks.md, .context/member-notices-issue.md에 검증·작업·이슈 초안을 작성한다.
- [x] T004 specs/019-member-notices/checklists/requirements.md, validation.md에 문서 정합성·품질 게이트·변경량을 기록한다.
- [x] T005 specs/019-member-notices/validation.md에 1단계 사용자 리뷰·다음 단계 진행 확인·이슈 생성 승인과 번호를 기록한 뒤 제품 구현을 시작한다.

## 2단계 기반 — 조회 계약과 개발 응답

독립 검증: UI 없이 생성 queryFn을 실제 MSW 응답에 연결해 검증과 single/infinite 캐시 분리를 확인한다.

- [x] T006 apps/web/src/features/member-notice/model/notice-queries.test.ts에 int64·날짜·cursor·필터·single/infinite key 검증을 작성한다.
- [x] T007 apps/web/src/features/member-notice/model/notice-queries.ts, notice-display.ts, index.ts에 목록 schema·생성 옵션·서울 날짜/유형 변환을 구현한다.
- [x] T008 apps/web/src/mocks/member-notice-handlers.ts, browser.ts, server.ts에 생성 helper 기반 목록 fixture·3페이지·빈 결과·실패를 등록하고 테스트 초기화를 연결한다.

## 2단계 — US1 게시판 목록 (P1)

독립 검증: 세 종류의 3페이지와 반복/무효 커서, 직접 URL·상세 왕복을 확인한다.

- [x] T009 [P] [US1] apps/web/src/pages/notices/ui/notices-page.test.tsx에 필터 전환·페이지·중복·오류·숨김/복귀 회귀를 추가한다.
- [x] T010 [P] [US1] apps/web/stackflow/src/stack.test.tsx와 apps/web/src/app/navigation/tab-link.test.tsx에 category 직접 진입·정규화·탭 왕복 회귀를 추가한다.
- [x] T011 [US1] apps/web/src/pages/notices/ui/notices-page.tsx, notice-tabs.tsx, index.ts에서 고정 목록을 제거하고 로딩·빈 결과·오류·무한 스크롤·카테고리 선택을 연결한다.
- [x] T012 [US1] apps/web/src/shared/lib/use-load-more-observer.ts로 실제 공통 observer를 옮기고 apps/web/src/pages/attendance/ui/attendance-page.tsx와 notices-page.tsx의 소비를 갱신한다.
- [x] T013 [US1] apps/web/src/app/navigation/tab.ts, tab-link.tsx, use-tabs-url.ts와 apps/web/stackflow/src/stack.tsx, activities/activities.tsx에 category params·replaceStep·URL·스크롤 복원을 연결한다.
- [x] T014 [US1] docs/web-routing.md와 specs/019-member-notices/validation.md에 URL 계약·회귀·check/build·화면·변경량·2단계 리뷰를 기록한다.

## 3단계 — US2 홈 주간 공지 (P2)

독립 검증: 현재 주·지난주·다음주와 홈 공지 실패를 세션 영역과 함께 확인한다.

- [x] T015 [P] [US2] apps/web/src/pages/home/model/weekly-notices.test.ts에 서울 주간·0/1/4개·해외 시간대 변환 사례를 추가한다.
- [x] T016 [P] [US2] apps/web/src/pages/home/ui/home-page.test.tsx에 공지 독립 오류·상세 이동·주 변경 복귀·재조회 실패를 추가한다.
- [x] T017 [US2] apps/web/src/pages/home/model/weekly-notices.ts, ui/weekly-notices.tsx, ui/home-page.tsx에 ALL 첫 페이지·현재 주 필터·최대 3개·활성화/focus 갱신을 구현한다.
- [x] T018 [US2] apps/web/src/mocks/member-notice-handlers.ts에 주간 시나리오를 보완하고 specs/019-member-notices/validation.md에 check/build·화면·변경량·3단계 리뷰를 기록한다.

## 4단계 — US3 Markdown 렌더러 (P1, 상세의 선행 조건)

독립 검증: API 없이 본문 문자열로 서식·링크 정책·레이아웃을 확인한다.

- [x] T019 [US3] pnpm-workspace.yaml, apps/web/package.json, pnpm-lock.yaml에 react-markdown 10.1.0을 고정하고 의존성 변경량을 먼저 검토한다.
- [x] T020 [US3] apps/web/src/pages/notice-detail/ui/notice-markdown.test.tsx에 프로젝트 서식·HTML·URL·이미지 정책 테스트를 추가한다.
- [x] T021 [US3] apps/web/src/pages/notice-detail/ui/notice-markdown.tsx, notice-markdown.css.ts에 skipHtml·HTTP(S)·제목 계층·코드/긴 링크·이미지 대체 표시를 구현한다.
- [x] T022 [US3] specs/019-member-notices/validation.md에 check/build·번들 전후 비교·레이아웃/키보드·lockfile 포함 변경량·4단계 리뷰를 기록한다.

## 5단계 — US3 상세 조회 (P1)

독립 검증: 세 종류의 상세 직접 진입·404/503·첨부 만료에서 조회만 발생하는지 확인한다.

- [x] T023 [P] [US3] apps/web/src/pages/notice-detail/model/notice-detail-query.test.ts에 ID·응답 검증·과제/첨부·POST_NOT_FOUND 처리 테스트를 작성한다.
- [x] T024 [P] [US3] apps/web/src/pages/notice-detail/ui/notice-detail-page.test.tsx에 실제 조회·기한·첨부 순서·실패/재시도·GET 무부작용 회귀를 추가한다.
- [x] T025 [US3] apps/web/src/pages/notice-detail/model/notice-detail-query.ts, notice-detail-data.ts에 생성 detail2Options·검증·서울 D-day 변환을 연결하고 고정 상세를 제거한다.
- [x] T026 [US3] apps/web/src/pages/notice-detail/ui/notice-detail-page.tsx, notice-detail-page.css.ts에 본문·과제·이미지·조회 상태를 연결한다. 읽음 UI는 6단계 저장 연결 전 서버 표시만 하고 버튼은 비활성화한다.
- [x] T027 [US3] apps/web/src/features/member-notice/ui/notice-error-content.tsx와 index.ts에 탐색 비의존 오류 콘텐츠·그림·스타일만 옮긴다. apps/web/src/pages/notices/ui/notice-error-page.tsx, pages/notice-detail/ui/notice-detail-page.tsx에는 헤더·BackButton을 유지해 페이지 간 import와 feature → app 의존을 제거한다.
- [x] T028 [US3] apps/web/src/mocks/member-notice-handlers.ts에 상세·404/503·이미지 재시도 fixture를 연결하고 specs/019-member-notices/validation.md에 check/build·화면·변경량·5단계 리뷰를 기록한다.

## 6단계 — US4 읽음 저장 (P1)

독립 검증: 상세 fixture와 204/실패/지연 PUT으로 저장·조회 실패·경합을 확인한다.

- [ ] T029 [P] [US4] apps/web/src/pages/notice-detail/model/notice-read.test.ts에 204·유실·401 GET 복구·오프라인 예약 방지·세션/공지 소유자 검증을 추가한다.
- [ ] T030 [P] [US4] apps/web/src/pages/notice-detail/ui/notice-detail-page.test.tsx에 연속 클릭·이미 읽음·저장 후 GET 실패·늦은 GET·이탈/재진입 회귀를 추가한다.
- [x] T031 [US4] apps/web/src/pages/notice-detail/model/notice-read.ts에 생성 mutation·온라인 차단·abort·callback 격리·read 확정·상세 강제 재조회와 실패 분리를 구현한다.
- [x] T032 [US4] apps/web/src/pages/notice-detail/ui/notice-detail-page.tsx에 저장 상태·비활성·명시적 재시도·접근성 안내를 연결하고 로컬 토글을 제거한다.
- [x] T033 [US4] apps/web/src/mocks/member-notice-handlers.ts에 상태 있는 읽음 응답과 테스트별 초기화를 연결한다.
- [ ] T034 [US4] apps/web/src/features/auth/model/session-queries.test.ts에 공지 GET의 기존 401 복구와 계정 전환 중 응답 격리를 검증하고 specs/019-member-notices/validation.md에 결과를 기록한다.

## 마무리 — 통합 검증과 보고 (6단계 포함)

- [ ] T035 specs/019-member-notices/validation.md에 quickstart.md의 전체 흐름·실서버·실기기·접근성 검증과 미실행 이유를 기록한다.
- [ ] T036 specs/019-member-notices/validation.md에 최종 check/build·새 실행/캐시·변경량·롤백·6단계 리뷰를 기록하고 spec.md, tasks.md 상태를 갱신한다.

## 의존성·병렬 작업·구현 전략

T001~~T005 → 기반 T006~~T008 → US1 T009~~T014 → US2 T015~~T018 → US3 T019~~T028 → US4 T029~~T034 → T035~T036.
우선순위는 기능 중요도다. 실행 순서는 사용자가 선택한 단계대로 홈을 상세보다 먼저 연결한다.
US1 T009/T010, US2 T015/T016, US3 T023/T024, US4 T029/T030은 같은 단계 내 다른 테스트 파일이라 병렬 가능하다.
US3 렌더러 단계는 의존성→테스트→구현 순서로 직렬 처리한다. 공유 fixture·validation.md는 충돌을 피하도록 직렬 처리한다.
목록 탐색을 먼저 독립 검토한 뒤 홈·본문·실제 상세를 순서대로 연결한다. 열람 MVP는 5단계, 전체 완료는 6단계다.
중간 단계는 전체 기능 완료가 아니다. 단계 리뷰를 받기 전 다음 단계 구현·출시를 시작하지 않는다.

| 요구사항      | 작업                         |
| ------------- | ---------------------------- |
| FR-001·FR-009 | T006~~T008, T029~~T035       |
| FR-002·FR-003 | T009~T014                    |
| FR-004        | T015~T018                    |
| FR-005·FR-006 | T007, T015~~T017, T023~~T028 |
| FR-007        | T019~T028                    |
| FR-008        | T029~T034                    |
| FR-010        | T009~T036의 각 기능 UI·검증  |
