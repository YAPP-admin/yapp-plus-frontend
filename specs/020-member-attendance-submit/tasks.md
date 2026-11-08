# 작업 목록: 회원 코드 출석과 사전 출결 보고

입력: [명세](spec.md)·[계획](plan.md). 총 14개 작업, US1 5개·US2 4개.
이슈 #385 생성과 초안 리뷰를 승인받았다. 1단계 구현 후 리뷰받고 US2를 진행한다.

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

## US2 — 사전 출결 보고, 두 번째 구현 리뷰 단위

목표: 코드 출석을 수행하지 않고 세 보고 유형을 독립적으로 제출한다. US1 리뷰 후 시작한다.

- [ ] T010 [US2] `apps/web/src/pages/home/ui`의 시트 테스트에 세 유형·빈 사유·30자·이모지·오류별 복구·중복 방지 사례를 작성하고 수정 전 실패를 확인한다.
- [ ] T011 [US2] `apps/web/src/pages/home/model`과 `ui/home-demo-sheets.tsx`에 submit1·응답 검증·사유 길이·오류 매핑·수동 재시도를 연결한다.
- [ ] T012 [US2] `apps/web/src/pages/home/ui/home-page.tsx`와 `apps/web/stackflow/src/activities/home-sheets.tsx`에 인증된 운영 보고 진입·서버 확인 후 완료 안내를 연결한다.
- [ ] T013 [US2] `quickstart.md`의 보고·계정 변경·통신 단절 시나리오와 check/build를 실행하고 정식 명세의 `validation.md`에 기록해 리뷰받는다.

## 종합 확인

- [ ] T014 정식 명세의 `validation.md`에 실서버·접근성 미검증, 캐시/새 실행, PR 분리 결과와 복구 방법을 최종 정리한다.

## 의존성과 실행 방식

준비 → 공통 기반 → US1 검증·리뷰 → US2 검증·리뷰 → 종합 확인 순서다.
MVP는 US1이다. 같은 홈·Activity 파일을 수정하므로 두 사용자 흐름을 병렬 구현하지 않는다.
각 흐름 내부에서는 입력 검증 테스트와 화면 경로 조사만 독립적으로 진행할 수 있다.
650줄에서 분리를 검토하고 800줄 이상이면 후속 구현 전에 검토 가능한 목적별 PR 분리 계획을 제출한다.
