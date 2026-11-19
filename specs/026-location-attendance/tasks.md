# 작업 목록: 위치 기반 코드 출석

**입력**: [명세](./spec.md), [계획](./plan.md), [계약](./contracts/location-attendance.md)
**검증**: 사용자와 합의한 경계·회귀 테스트를 구현 작업에 포함한다. 실패를 재현한 뒤 구현으로 통과시킨다.
**현재 범위**: 5단계 통합·출시 준비 검증. 실기기 결과와 PR 분리 전에는 출시 준비 완료로 판단하지 않는다.

## 1단계 — 준비와 문서

- [x] T001 `specs/026-location-attendance/spec.md`에 사용자 결정과 US1~US3·FR·성공 기준·제외 범위를 작성한다.
- [x] T002 `specs/026-location-attendance/plan.md`, `research.md`, `data-model.md`, `contracts/location-attendance.md`, `quickstart.md`에 구현·검증 경계를 작성한다.
- [x] T003 `specs/026-location-attendance/tasks.md`, `checklists/requirements.md`, `issue-draft.md`에 후속 작업·품질 점검·이슈 초안을 작성한다.
- [x] T004 `specs/026-location-attendance/validation.md`에 문서 리뷰, 승인 후 생성한 이슈 번호, 2단계 진행 확인을 기록한다.

**리뷰 지점**: T004 전 제품 구현을 시작하지 않는다. GitHub 생성 승인과 단계 진행 승인을 혼동하지 않는다.

## 2단계 — 판정 기반과 US1 (P1)

**독립 검증**: 합성 표본·좌표로 허용/차단만 확인한다. 아직 기존 제출 흐름에 연결하지 않는다.

- [x] T005 `pnpm-workspace.yaml`, `apps/web/package.json`, `pnpm-lock.yaml`에 geolib 4.0.2를 catalog로 고정한다.
- [x] T006 [US1] `apps/web/src/pages/home/model/location-attendance.test.ts`에 거리·오차 경계, 정밀 권한, 좌표·계산 오류 테스트를 작성한다.
- [x] T007 [US1] `apps/web/src/pages/home/model/location-attendance.ts`에 반올림 없는 거리 계산·정규화된 판정을 구현한다.

**리뷰 지점**: 판정 결과와 테스트·변경량을 제출하고 3단계 진행 확인을 받는다.

## 3단계 — 제출 US1·수명 US3 (P1)

**독립 검증**: MSW 요청 횟수와 지연 응답으로 조건 통과·계정 변경의 전송을 확인한다.

- [x] T008 [US1] `apps/web/src/pages/home/ui/attendance-code.test.tsx`에 위치 검사 전 POST 0회, 성공 1회, 실패·미지원·오프라인 차단과 재시도 표본 교체를 검증한다.
- [x] T009 [US1] `apps/web/src/pages/home/model/code-attendance.ts`에 메서드 지원 검사·위치 판정 후 SDK 제출을 연결하고 verify mutation key/context·조회 무효화를 보존한다.
- [x] T010 [US3] `apps/web/src/pages/home/ui/attendance-code.test.tsx`에 동기 연속 제출과 pending 전체 잠금 회귀를 추가한다.
- [x] T011 [US3] `apps/web/src/pages/home/model/code-attendance.ts`, `ui/home-demo-sheets.tsx`에 위치·출석 순차 mutation과 시트 open 제출 제한을 구현한다.
- [x] T012 [US3] `apps/web/stackflow/src/account-boundary.test.tsx`에 계정 변경 후 위치 응답의 전송 0회와 기존 계정 캐시 정리를 검증한다.
- [x] T013 [US3] 기존 성공 완료 탐색을 유지하고 별도의 Activity 수명 관리는 범위에 추가하지 않는다.

**리뷰 지점**: US1·US3 수명 검증과 기존 완료 표시 회귀를 제출한다. 이 단계만으로 출시하지 않는다.

## 4단계 — 오류 복구 US2 (P2)

**독립 검증**: 각 실패 사유를 주입해 코드 유지·올바른 복구 버튼·복귀 자동 제출 금지를 확인한다.

- [x] T014 [US2] `apps/web/src/pages/home/ui/attendance-code.test.tsx`에 권한·오차·거리·좌표·설정 실패와 키보드/접근성 이름 검증을 추가한다.
- [x] T015 [US2] `apps/web/src/pages/home/ui/home-demo-sheets.tsx`에 목적·진행 상태·사유별 안내와 복구 버튼, 코드 오류와 위치 오류의 시맨틱 구분을 구현한다.
- [x] T016 [US2] `apps/web/src/pages/home/model/code-attendance.ts`에 출석 mutation과 분리한 설정 열기·지원 확인·실패 처리를 연결한다. 복귀는 자동 제출하지 않는다.
- [x] T017 [US2] `apps/web/src/pages/home/ui/home-page.css.ts`에서 기존 토큰으로 필요한 안내·액션 배치를 조정하고 작은 화면의 스크롤을 자동 검증한다. 실제 WebView 키보드는 5단계에서 확인한다.

**리뷰 지점**: 화면 근거와 접근성·복구 시나리오 결과를 제출하고 통합 검증 진행을 확인받는다.

## 5단계 — 통합과 출시 준비

- [x] T018 `specs/026-location-attendance/validation.md`에 루트 check·build 결과를 새 실행/캐시/실패/미실행으로 구분해 기록한다.
- [ ] T019 `specs/026-location-attendance/quickstart.md`에 따라 브라우저·미지원 환경·위치 원문 비보존을 확인하고 `validation.md`에 결과를 기록한다.
- [ ] T020 `specs/026-location-attendance/validation.md`에 iOS 실기기·실제 장소·권한·설정·VoiceOver 결과와 출시 전 남은 위험을 기록한다.
- [x] T021 `specs/026-location-attendance/contracts/location-attendance.md`의 Android 공통 사례를 검토하고 `validation.md`에 별도 전달·적용·검증 상태를 구분해 기록한다. 메시지 발송·Android 수정은 포함하지 않는다.
- [x] T022 `specs/026-location-attendance/validation.md`에 최종 실제 base 변경량, PR 분리, 지원 앱 확인과 웹 복구 절차 검토 결과를 기록한다. 배포는 실행하지 않는다.

## 의존성과 실행 순서

`T001–T004` → `T005` → `T006–T007` → 리뷰 → `T008–T013` → 리뷰 → `T014–T017` → 리뷰 → `T018–T022`.
US1의 순수 판정은 기반 검증이며 사용자 흐름의 최소 완성 단위는 US1+US3이다. 오류 복구 US2·실기기 검증까지 마쳐야 출시 준비를 판단한다.
스토리별 독립 테스트는 가능하지만 같은 훅·시트를 편집하므로 구현은 순서대로 진행한다.

## 병렬 검토 기회

- US1: 판정 단위 테스트 통과 후 고정 좌표 사례와 제출 API 본문 계약을 읽기 전용으로 함께 검토할 수 있다.
- US3: 코드가 안정된 뒤 stack·account-boundary 테스트 실행은 독립적이다. 같은 테스트 파일의 동시 편집은 피한다.
- US2: 복구 상태별 문구와 작은 화면 레이아웃 검토는 분담 가능하다. 실제 추가 에이전트는 해당 실행의 지침을 따른다.

## 구현 전략

요청한 최소 변화부터 단계별로 검증한다. 같은 실패를 순수 함수·화면·탐색에 반복하지 않고 소유 경계에서 확인한다.
모든 단계에 사용자 리뷰를 두며 원격 작업과 출시를 자동으로 수행하지 않는다.
