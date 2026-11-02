# 작업 목록: 관리자 팀 매핑

입력: [spec.md](spec.md), [plan.md](plan.md), [data-model.md](data-model.md), [화면 계약](contracts/team-mapping-ui.md).
테스트는 사용자 요청에 포함된다. 체크 완료는 실제 구현/검증 완료만 뜻하며 사용자 단계 승인과 구분한다.
각 단계 끝에 quickstart.md 검증·diff 크기·화면 근거를 validation.md에 기록하고 사용자 리뷰를 기다린다.
제품 코드 단계는 이슈 번호 확인과 이전 단계 진행 승인 후 시작한다. 현재 승인된 단계까지만 수행한다.

## 준비 — 1단계

- [x] T001 specs/015-admin-team-mapping/spec.md에 인터뷰 결정·US1~US5·수용 기준을 작성한다.
- [x] T002 specs/015-admin-team-mapping/plan.md와 research.md·data-model.md·contracts/team-mapping-ui.md에 구조·Figma·불변식·초안 경계를 작성한다.
- [x] T003 specs/015-admin-team-mapping/quickstart.md·tasks.md·issue-draft.md에 검증·작업·이슈 초안을 작성한다.
- [x] T004 specs/015-admin-team-mapping/checklists/requirements.md와 validation.md에 문서 점검·check 실제 결과를 기록한다.

**독립 검증/리뷰**: 요구→설계→작업→검증 대응과 이슈 초안. 제품 코드는 변경하지 않는다.

## 기반 — 2단계 모델, 3단계 fixture

- [x] T005 apps/admin/src/features/team-management/model/team-mapping.test.ts에 참조·중복 소속·집계·PM/Design 분류 사례를 작성한다.
- [x] T006 apps/admin/src/features/team-management/model/team-mapping.ts에 readonly 타입·입력 검증·원본 집계를 구현한다.
- [x] T007 apps/admin/src/features/team-management/model/team-draft.test.ts에 필수 입력·검색·중복·동명이인·최소 인원·개별 취소/전체 취소 사례를 작성한다.
- [x] T008 apps/admin/src/features/team-management/model/team-draft.ts에 검색·생성 입력·변경 예정 합산 검증을 구현한다.
- [x] T009 apps/admin/src/features/team-management/index.ts에 실제 사용 타입·함수만 공개한다.

**2단계 중단점**: 순수 함수로 원본 보존과 양쪽 팀 최소 인원을 검증하고 리뷰받는다.

- [x] T010 apps/admin/src/features/team-management/model/team-fixtures.test.ts에 상태별 무결성·8팀/42명/10명·고정 시각을 검증한다.
- [x] T011 apps/admin/src/features/team-management/model/team-fixtures.ts에 before/draft/confirmed·동명이인·1명 팀·빈 결과·긴 이름 사례를 작성한다.
- [x] T012 apps/admin/src/features/team-management/fixtures.ts에 환경 공통 공급용 fixture 진입점을 작성한다.

**3단계 중단점**: 합성 입력만으로 각 시나리오를 구성하고 리뷰받는다. 네트워크 모킹은 없다.

## US1 — 4단계 진입과 5단계 목록 (P1)

- [x] T013 [P] [US1] apps/admin/src/pages/team-mapping/model/team-search.test.ts에 filter/preview 기본값·잘못된 값·URL 복원을 검증한다.
- [x] T014 [P] [US1] apps/admin/src/app/ui/admin-shell.test.tsx에 팀 매핑 활성 메뉴·기존 회원 메뉴·모바일 이동 사례를 추가한다.
- [x] T015 [P] [US1] apps/admin/src/pages/team-mapping/model/team-search.ts와 index.ts에 검색 스키마·공개 진입점을 작성한다.
- [x] T016 [US1] apps/admin/src/pages/team-mapping/ui/team-mapping-page.tsx와 team-mapping-page.css.ts에 공통 헤더·빌딩 전 화면·생성 진입 callback을 구현한다.
- [x] T017 [US1] apps/admin/src/routes/_dashboard/members/teams.tsx에 환경 공통 fixture·URL·현재 위치를 연결하고 공식 생성기로 routeTree를 갱신한다.
- [x] T018 [US1] apps/admin/src/app/ui/admin-navigation.ts·admin-sidebar.tsx·admin-shell.tsx·admin-mobile-navigation.tsx에 별도 경로 하위 메뉴를 연결한다.
- [x] T019 [US1] apps/admin/src/pages/members/ui/member-team-filter.tsx와 members-page.test.tsx에 팀 매핑 진입 링크와 회귀 검증을 추가한다.

**4단계 중단점**: 개발/운영 빈 화면과 탐색을 리뷰한다. 실제 생성 폼은 6단계에 연결한다.

- [x] T020 [US1] apps/admin/src/pages/team-mapping/ui/team-mapping-page.test.tsx에 필터·빈 결과·URL·상세/메뉴 이벤트 분리를 검증한다.
- [x] T021 [US1] apps/admin/src/pages/team-mapping/ui/team-card.tsx와 team-card.css.ts에 카드·원본 직군 집계·경고·비활성 메뉴를 구현한다. 팀장 정보는 카드에 표시하지 않는다.
- [x] T022 [US1] apps/admin/src/pages/team-mapping/ui/team-filters.tsx와 team-mapping-page.tsx에 필터·개수·스크롤 유지·진입 callback을 연결한다.

**5단계 중단점**: US1 목록을 독립 검증한다. 상세 패널은 8단계, 미배정 본문은 9단계에서 연결한다.

## US2 — 6단계 생성 입력과 7단계 검색 (P2)

- [x] T023 [US2] apps/admin/src/pages/team-mapping/ui/team-create-dialog.test.tsx에 모달 표시·필수 입력·값 원복·Enter 차단을 검증한다.
- [x] T024 [US2] apps/admin/src/pages/team-mapping/ui/team-create-dialog.tsx와 team-create-dialog.css.ts에 생성 폼·선택 영역·dirty·비활성 만들기를 구현한다.
- [x] T025 [US2] apps/admin/src/pages/team-mapping/ui/team-mapping-page.tsx에 두 생성 진입점과 모달을 연결한다.

**6단계 중단점**: 폼 배치·입력·원본 보존을 리뷰한다. 회원 선택과 이탈 보호는 후속 연결이다.

- [ ] T026 [US2] apps/admin/src/pages/team-mapping/ui/team-member-search.test.tsx에 한글 조합·키보드·동명이인·검색 없음·중복/마지막 팀원 차단을 검증한다.
- [ ] T027 [US2] apps/admin/src/pages/team-mapping/ui/team-member-search.tsx와 team-member-search.css.ts에 후보 검색·현재 소속·선택 포커스 복원을 구현한다.
- [ ] T028 [US2] apps/admin/src/pages/team-mapping/ui/team-create-dialog.tsx에 후보 선택/제거·선택 인원·직군 구성·원래 팀 최소 인원 검증을 연결한다.

**7단계 중단점**: US2 검색→선택→원복을 독립 검증한다. 만들기 실제 반영은 없다.

## US3 — 8단계 상세와 변경 예정 (P2)

- [ ] T029 [US3] apps/admin/src/pages/team-mapping/ui/team-detail-panel.test.tsx에 추가/이동/제외/취소·원본 보존·최소 인원·포커스를 검증한다.
- [ ] T030 [US3] apps/admin/src/pages/team-mapping/ui/team-detail-panel.tsx와 team-detail-panel.css.ts에 SidePanel·원본 팀원·내부 추가 검색·회원 메뉴를 구현한다.
- [ ] T031 [US3] apps/admin/src/pages/team-mapping/ui/team-pending-changes.tsx에 회원별 변경 예정·취소·전체 취소·차단 사유·비활성 반영을 구현한다.
- [ ] T032 [US3] apps/admin/src/pages/team-mapping/ui/team-mapping-page.tsx에 상세 진입을 연결하고 패널이 현재 작업의 예정만 소유하도록 구성한다.

**8단계 중단점**: US3 원본과 예정을 독립 검증한다. 팀 정보 수정·삭제는 계속 비활성이다.

## US4 — 9단계 미배정 개별·일괄 선택 (P2)

- [ ] T033 [US4] apps/admin/src/pages/team-mapping/ui/unassigned-members.test.tsx에 개별→일괄→개별·체크 해제·예정 취소·팀 없음·인원 보존을 검증한다.
- [ ] T034 [US4] apps/admin/src/pages/team-mapping/ui/unassigned-members.tsx와 unassigned-members.css.ts에 회원 이력·체크·개별 대상·일괄 덮어쓰기·예정 표시를 구현한다.
- [ ] T035 [US4] apps/admin/src/pages/team-mapping/ui/team-mapping-page.tsx에 미배정 본문을 연결하고 실제 반영을 비활성으로 유지한다.

**9단계 중단점**: US4 체크와 예정의 차이를 독립 검증하고 리뷰받는다.

## US5 — 10단계 이탈 보호와 11단계 확정 화면 (P2)

- [ ] T036 [P] [US5] apps/admin/src/pages/team-mapping/ui/team-leave-dialog.test.tsx에 로컬 닫기·다른 팀·filter/preview·뒤로가기·계속/버리기·중복 확인 방지를 검증한다.
- [ ] T037 [P] [US5] apps/admin/src/pages/team-mapping/model/team-editor-state.test.ts에 생성 입력/예정 dirty·검색/체크 제외·원복·보류 동작 취소를 검증한다.
- [ ] T038 [US5] apps/admin/src/pages/team-mapping/model/team-editor-state.ts에 현재 작업의 종료 요청·초안 비교·로컬/Router 이동 조정을 구현한다.
- [ ] T039 [US5] apps/admin/src/pages/team-mapping/ui/team-leave-dialog.tsx에 SEED 확인창·useBlocker·beforeunload를 연결한다.
- [ ] T040 [US5] apps/admin/src/pages/team-mapping/ui/team-mapping-page.tsx·team-create-dialog.tsx·team-detail-panel.tsx·unassigned-members.tsx에 동일 폐기 정책과 포커스 복귀를 연결한다.

**10단계 중단점**: US2~US4의 종료 경로까지 US5 보호를 통합 검증한다. 모바일 탐색 취소 시에도 원래 페이지·초안을 보존한다.

- [ ] T041 [US5] apps/admin/src/pages/team-mapping/ui/team-confirm-dialog.test.tsx에 원본 집계·미배정 경고·확정 비활성·요약 열기/닫기 시 기존 예정 보존을 검증한다.
- [ ] T042 [US5] apps/admin/src/pages/team-mapping/ui/team-confirm-dialog.tsx에 확정 확인 모달을 구현한다.
- [ ] T043 [US5] apps/admin/src/pages/team-mapping/ui/team-mapping-page.tsx와 team-mapping-page.test.tsx에 확정 이력·팀원 전용 편집·편집 종료 확인·상태 유지·새 팀 금지를 구현/검증한다.

**11단계 중단점**: US5 확정 조회/편집을 독립 검증한다. 실제 확정·성공 처리는 없다.

## 마무리 — 12단계

- [ ] T044 apps/admin/src/pages/team-mapping/ui/team-mapping-page.test.tsx에 최종 실행 비활성·원본 보존·상태/탐색 회귀를 보완한다.
- [ ] T045 specs/015-admin-team-mapping/validation.md에 개발/운영 동일 URL·새로고침·실제 요청 없음·기존 회원 탐색 검증을 기록한다.
- [ ] T046 specs/015-admin-team-mapping/validation.md에 .context/ 화면 근거·Figma 12개 비교·토스트 고정 시각 사례·375px·키보드/스크린 리더/터치 결과를 기록한다.
- [ ] T047 apps/storybook/stories/와 관련 packages/ui/src/ 테스트에서 이번에 변경한 공용 UI 사례만 갱신한다. 공용 UI 미변경이면 사유를 validation.md에 기록한다.
- [ ] T048 specs/015-admin-team-mapping/validation.md에 check/build·실행/캐시·미실행·실제 base 대비 변경량·최종 리뷰 결과를 기록한다.

## 의존성과 실행 전략

순서: 1 → 2 → 3 → US1(4·5) → US2(6·7) → US3(8) → US4(9) → US5(10·11) → 12.
US1 목록이 첫 검토 가능한 최소 결과다. 4/5단계의 callback을 6/8단계에서 연결하며 각 단계의 미완료 연결을 보고한다.
각 UI는 필요한 원본·callback을 직접 주입해 독립 검증한다. 한 규칙 실패를 모델과 모든 UI에서 반복하지 않는다.
[P]는 같은 승인 단계 내 서로 다른 파일의 독립 작업이다. 예: US1 T013/T014, US5 T036/T037.
US2·US3·US4는 동일 폼/패널 파일 의존 때문에 순차 수행한다. 단계 간 병렬 구현이나 자동 다음 단계 진행은 하지 않는다.
