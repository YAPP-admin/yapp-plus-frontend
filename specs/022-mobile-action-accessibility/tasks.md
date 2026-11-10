# 작업 목록: 회원 앱 하단 버튼 접근성

**입력**: [spec.md](spec.md), [plan.md](plan.md), research.md, data-model.md, contracts/
**규칙**: 각 단계 리뷰 후 다음 단계로 이동한다. `[P]`는 파일과 의존성이 분리된 작업이며 단계 승인 경계를 넘지 않는다.

## 1단계 — 준비·명세·수정 전 기준

- [x] T001 specs/022-mobile-action-accessibility/validation.md에 최신 기준·작업 트리·승인된 이슈 #411을 기록한다.
- [x] T002 specs/022-mobile-action-accessibility/spec.md와 checklists/requirements.md에 사용자 이야기·수용 기준·명세 점검을 작성한다.
- [x] T003 specs/022-mobile-action-accessibility/plan.md, research.md, data-model.md, contracts/screen-layout.md, quickstart.md에 구현·상태·재현 계약을 작성한다.
- [ ] T004 specs/022-mobile-action-accessibility/validation.md의 모든 기준 화면에서 높이·safe-area·버튼 rect·스크롤·키보드 전후를 측정하고 .context/ui-baseline/에 캡처를 저장한다.
- [ ] T005 specs/022-mobile-action-accessibility/validation.md에 check 결과·변경량·전후 비교 기준을 제출하고 1단계 리뷰 및 2단계 진행 확인을 기록한다.

**완료 조건**: 제품 변경 없이 재현표·유효한 캡처 확보. T004는 설정·가입 이름의 일부 근거만 확보했으며 화면 도구 오류로 미완료다.

## 2단계 — 공통 기반과 US1 하단 버튼

**독립 검증**: 기본 글자·키보드 닫힘에서 설정·가입 버튼이 스크롤 없이 보이며 본문과 겹치지 않는다.

- [ ] T006 [US1] apps/web/stackflow/src/activities/activity-screen.test.tsx와 apps/web/src/app/layouts의 인접 테스트에 활성 본문 관찰·safe-area 소유 회귀를 추가한다.
- [ ] T007 [US1] apps/web/src/shared/ui/step-screen.css.ts와 apps/web/src/app/layouts/page-shell.tsx·page-shell.css.ts에 헤더·본문·액션 합성과 실제 콘텐츠 높이를 적용한다.
- [ ] T008 [US1] apps/web/stackflow/src/activities/activity-screen.tsx에서 실제 스크롤 본문 root·시작점 연결 및 활성 상태 cleanup을 구현한다.
- [ ] T009 [US1] apps/web/src/pages/settings/ui/settings-page.tsx와 apps/web/src/pages/signup/ui/signup-page.tsx에 공통 본문·액션 배치를 적용하고 중복 높이를 제거한다.
- [ ] T010 [US1] apps/web/src/app/layouts/bottom-navigation.tsx·bottom-navigation.css.ts·tabs-layout.css.ts의 고정 34px과 중복 inset을 정리하고 탭 DOM·스크롤 보존을 확인한다.
- [ ] T011 [US1] specs/022-mobile-action-accessibility/validation.md에 화면 전후·check·build·변경량·2단계 리뷰 및 다음 단계 확인을 기록한다.

## 3단계 — US2 가입 키보드·탐색

**독립 검증**: 키보드 위 버튼, 이름↔휴대폰 값 보존, 서버 이름 오류 복귀, 반복 제출 차단.

- [ ] T012 [P] [US2] apps/web/src/pages/signup/model/use-signup-viewport.test.ts에 좌표 교집합·확대·미지원·활성 listener 정리 회귀를 작성한다.
- [ ] T013 [P] [US2] apps/web/src/pages/signup/ui/signup-page.test.tsx와 apps/web/stackflow/src/stack.test.tsx에 단계 왕복·오류·직접 진입·새로고침·history back·중복 제출 테스트를 작성한다.
- [ ] T014 [US2] apps/web/src/pages/signup/model/use-signup-viewport.ts에 활성 수명 한정 가시 영역 계산을 구현하고 signup-page.tsx에 연결한다.
- [ ] T015 [US2] apps/web/stackflow/src/stack.tsx·activities/activities.tsx의 Signup typed params와 apps/web/src/app/layouts/auth-layout.tsx에 가입 전용 step-aware back 조합을 연결한다.
- [ ] T016 [US2] apps/web/src/pages/signup/ui/signup-page.tsx에서 로컬 step을 Activity 계약으로 대체하고 단일 폼·오류 보존·포커스·loading·중복 제출을 유지한다.
- [ ] T017 [US2] specs/022-mobile-action-accessibility/validation.md에 키보드 전후·브라우저/Android back·자동 검증·3단계 리뷰 및 다음 단계 확인을 기록한다.

## 4단계 — US3 관련 화면 적용

**독립 검증**: 작은 화면의 각 CTA, 긴 본문 끝, 공지 확인 위치, 탭 복귀 스크롤.

- [ ] T018 [P] [US3] apps/web/src/pages/login/ui/login-page.css.ts와 signup-complete/ui/signup-complete-page.css.ts·attendance-complete/ui/attendance-complete-page.css.ts의 고정 간격·중복 높이를 정리한다.
- [ ] T019 [P] [US3] apps/web/src/pages/team-attendance-upload/ui/team-attendance-upload-page.tsx·team-attendance-upload-page.css.ts에서 사진·목록 스크롤과 하단 액션을 분리한다.
- [ ] T020 [US3] apps/web/src/pages/team-attendance-complete/ui, team-attendance-error/ui, login-error/ui의 중복 헤더·높이·하단 여백을 정리한다.
- [ ] T021 [US3] apps/web/src/pages/notices/ui와 apps/web/src/app/layouts에서 공지 본문 끝 확인, 탭 스크롤·목록 observer·스낵바 위치를 확인하고 필요한 가까운 회귀 테스트를 갱신한다.
- [ ] T022 [US3] specs/022-mobile-action-accessibility/validation.md에 관련 화면 전후·자동 검증·4단계 리뷰 및 다음 단계 확인을 기록한다.

## 5단계 — US4 실사용 QA

**독립 검증**: 320px 팝업, 큰 글자·긴 오류, 44×44px 터치, 상태 안내와 테마 가독성.

- [ ] T023 [P] [US4] apps/web/src/pages/settings/ui/settings-page.test.tsx와 signup/ui/signup-page.test.tsx에 팝업 취소·실패 안내와 입력 오류 연결을 검증한다.
- [ ] T024 [P] [US4] apps/web/src/pages/login/ui/login-page.css.ts와 settings/ui/settings-page.css.ts, 출석 규칙 팝업 소유 파일에서 화면 폭 제한·내부 스크롤을 적용한다.
- [ ] T025 [US4] apps/web/src/pages의 수정 화면에서 실제 터치 영역·키보드/스크린 리더·로딩/실패·라이트/다크 가독성을 검증하고 재현된 결함만 수정한다.
- [ ] T026 [US4] specs/022-mobile-action-accessibility/validation.md에 실제 iOS 설치 앱·Android 결과와 미실행 항목을 기록한다. 공유 UI 동작을 변경했다면 apps/storybook의 관련 사례도 갱신한다.

## 최종 정리

- [ ] T027 specs/022-mobile-action-accessibility/research.md의 미연결 기능 근거를 재확인하고 docs/web-development.md·docs/webview-navigation-contract.md에 최종 레이아웃·가입 탐색 계약을 반영한다.
- [ ] T028 specs/022-mobile-action-accessibility/validation.md에 최종 check·build의 신규/캐시 구분, 수용 기준·실기기 결과·PR 크기·최종 리뷰를 기록한다.

## 의존성과 실행 전략

T001~T005 → 2단계 US1 → 3단계 US2 → 4단계 US3 → 5단계 US4 → 최종 정리 순서다.
각 이야기 내 테스트는 가능한 경우 수정 전 실패를 확인하고 구현 후 통과시킨다. 물리적 레이아웃은 화면 측정으로 검증한다.
최소 첫 제품 결과는 US1이다. 각 단계는 독립 검토가 가능하도록 필요한 테스트와 문서를 포함한다.

병렬 가능 예시는 US2 T012/T013, US3 T018/T019, US4 T023/T024이며 모두 해당 단계 승인 후에만 가능하다.
US1은 동일 프레임·관찰 계약을 공유하므로 구현을 순차 진행한다. 병렬 표시는 별도 에이전트 실행 승인을 의미하지 않는다.
