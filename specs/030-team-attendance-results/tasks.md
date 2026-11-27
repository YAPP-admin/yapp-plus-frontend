# 작업 목록: 팀 세션 출석 결과 안내

입력: [명세](spec.md), [계획](plan.md), [조사](research.md), [데이터 모델](data-model.md),
[계약](contracts/team-attendance-results.md), [검증 안내](quickstart.md).
테스트는 승인한 계획과 저장소 검증 규칙에 포함한다. 체크 완료는 실제 수행한 항목만 표시한다.

## 1단계 — 명세 정리와 준비

- [x] T001 `specs/030-team-attendance-results/spec.md`에 사용자 스토리·표시 시점·시작 전 제외 범위와 #622를 기록한다.
- [x] T002 `specs/030-team-attendance-results/plan.md`, `research.md`, `data-model.md`, `contracts/team-attendance-results.md`에 기존 조회·표시 이력·복구 계약을 작성한다.
- [x] T003 `specs/030-team-attendance-results/tasks.md`, `quickstart.md`, `checklists/requirements.md`에 단계·검증·품질 기준을 작성한다.
- [x] T004 `specs/030-team-attendance-results/validation.md`에 문서 검증·기본 게이트·변경량을 기록한다.
- [x] T005 `specs/030-team-attendance-results/validation.md`에 1단계 사용자 리뷰와 2단계 진행 확인을 기록한다.

## 2단계 — 조회·결과 모델과 표시 이력

목표: UI 연결 전에 US1·US2의 정책을 독립 검증한다. 본인 결과는 fixture, 표시는 독립 저장소로 검증한다.

### US1 — 본인 결과 판정 (P1)

- [x] T006 [US1] `apps/web/src/pages/home/model/team-attendance-result.test.ts`에 본인 확정 우선·미선택·공결·반려 불일치·photo:null·imageUrl:null 테스트를 작성한다.
- [x] T007 [US1] `apps/web/src/pages/home/model/team-attendance-result.ts`에 기존 생성 타입을 받는 표시 모델·기한·제출 가능 판정을 구현한다. 우선순위는 T011의 조회 훅에서 소유한다.

### US2 — 같은 결과 생략과 새 사진 구분 (P1)

- [x] T008 [US2] `apps/web/src/pages/home/model/team-attendance-result-storage.test.ts`에 같은 제출자의 재제출을 보는 B, 사용자·기수 구분, 손상 JSON·저장 실패를 검증한다.
- [x] T009 [US2] `apps/web/src/pages/home/model/team-attendance-result-storage.ts`에 검증된 localStorage 접근과 현재 실행의 메모리 대체를 구현한다. 재제출 삭제 API는 만들지 않는다.
- [x] T010 [US2] `apps/web/src/pages/home/model/use-team-attendance-result.test.tsx`에 커서 탐색·우선순위·첫 미표시 결과에서 중단·조회 실패·시작 전 제외를 검증한다.
- [x] T011 [US2] `apps/web/src/pages/home/model/use-team-attendance-result.ts`에 find7·find8Infinite·find1·find6 생성 옵션 조합을 구현한다. 타 페이지 내부 import·직접 HTTP·가짜 Mutation은 추가하지 않는다.
- [x] T012 `specs/030-team-attendance-results/validation.md`에 관련 테스트·check·변경량과 2단계 리뷰·3단계 진행 확인을 기록한다.

## 3단계 — 완료 일러스트 공용화

목표: 기존 그래픽을 동일하게 재사용할 기반을 마련한다. 새로운 애니메이션을 설계하지 않는다.

- [x] T013 `apps/web/src/pages/signup-complete/ui/complete-illustration.tsx`와 `.css.ts`를 `apps/web/src/shared/ui/complete-illustration.tsx`와 `.css.ts`로 옮기고 공개 책임 주석을 정리한다.
- [x] T014 `apps/web/src/pages/signup-complete/ui/signup-complete-page.tsx`, `apps/web/src/pages/attendance-complete/ui/attendance-complete-page.tsx`, `apps/web/src/pages/team-attendance-complete/ui/team-attendance-complete-page.tsx`의 import를 갱신한다.
- [x] T015 `specs/030-team-attendance-results/validation.md`에 기존 완료 화면·모션·reduced motion, check·build·파일 이동 변경량과 3단계 리뷰·4단계 진행 확인을 기록한다.

## 4단계 — 시트 UI와 후속 행동 계약

목표: API 연결 없이 UI 입력과 callback으로 US1·US3를 독립 검증한다.

### US1 — 결과 시트 (P1)

- [x] T016 [US1] `apps/web/src/pages/home/ui/team-attendance-result-sheet.test.tsx`에 세 결과의 문구·접근성 이름·반려·결석 고정 사유·과거 세션 표시를 검증한다.
- [x] T017 [US1] `apps/web/src/pages/home/ui/team-attendance-result-sheet.tsx`와 `.css.ts`에 기존 BottomSheet·토큰·공용 완료 일러스트로 표시 전용 UI를 구현한다.

### US3 — 확인·재업로드·문의 (P2)

- [x] T018 [US3] `apps/web/src/pages/home/ui/team-attendance-result-sheet.test.tsx`에 기한 종료·제출 불가·재업로드·문의·확인의 callback과 닫기 동작을 검증한다.
- [x] T019 [US3] `apps/web/src/pages/home/ui/team-attendance-result-sheet.tsx`에 CTA·기한·문의 연결 계약과 포커스 복귀를 적용한다.
- [x] T020 [US3] `apps/web/src/pages/home/model/team-attendance-result-fixtures.ts`에 읽기 전용 UI 입력을 두고 테스트·기존 개발 전용 진입에서 사용한다. 운영 홈에 fixture를 공급하지 않는다.
- [ ] T021 `specs/030-team-attendance-results/validation.md`에 Figma·작은 화면·safe-area·접근성·다크 모드, check·build와 4단계 리뷰·5단계 진행 확인을 기록한다.

## 5단계 — 홈 연결과 통합 검증

### US1·US2 — 활성 홈에서 실제 표시

- [x] T022 [US1] `apps/web/src/pages/home/ui/home-result.test.tsx`에 홈 진입·복귀·과거 결과 한 건·조회 실패 유지 흐름을 추가한다.
- [x] T023 [US1] `apps/web/src/pages/home/ui/home-page.tsx`에 결과 조회와 시트를 연결하고 활성 홈만 열리게 한다. 기존 API 조회 키와 화면 활성 경계를 사용한다.
- [x] T024 [US2] `apps/web/src/pages/home/ui/home-result.test.tsx`에 실제 열린 뒤 기록·숨은 홈·계정 전환·재진입·늦은 응답·단순 닫기 후 중복 없음 흐름을 검증한다.
- [x] T025 [US2] `apps/web/src/pages/home/model/use-team-attendance-result.ts`에 진입 수명·실제 표시 기록·복귀 갱신을 연결한다. 서버 결과를 중복 state에 복사하지 않는다.

### US3 — 제출·문의 연결

- [x] T026 [US3] `apps/web/src/features/team-attendance/model/use-photo-submission.test.tsx`에 접수 성공 시 본인 내역 무효화·실패 시 무효화 없음 회귀 검증을 추가한다.
- [x] T027 [US3] `apps/web/src/features/team-attendance/model/use-photo-submission.ts`에 실제 사용하는 find8Infinite Query key 무효화를 추가하고 최신 main의 인증 오류 전파를 보존한다.
- [x] T028 [US3] `apps/web/stackflow/src/stack.test.tsx`에 결과 시트 → 해당 세션 안내 → 사진 선택 취소·재제출 → 홈 복귀의 대표 흐름을 검증하고 `home-result.test.tsx`에서 문의 링크 동작을 검증한다.

### 전체 검증과 리뷰

- [ ] T029 `specs/030-team-attendance-results/quickstart.md`에 따른 두 팀원·기한 경과·접근성 흐름과 node --run check·build를 수행하고 `validation.md`에 새 실행·캐시·미실행을 구분한다.
- [ ] T030 `specs/030-team-attendance-results/validation.md`에 전체 변경량·PR 분리·실기기 미검증과 최종 사용자 리뷰를 기록한다.

## 의존성·구현 전략

리뷰 순서는 1 → 2 → 3 → 4 → 5다. 단계별 검토가 끝나기 전 다음 단계 파일을 구현하지 않는다.
US1의 순수 판정과 US2의 저장소 검증은 2단계에서, US1·US3의 UI는 4단계 fixture에서 독립 실행한다.
실제 기능 최소 완료 범위는 세 스토리가 홈에 연결되는 5단계다. 일부 UI를 운영 완료로 보고하지 않는다.

논리적 병렬 후보는 2단계의 T006·T008, 4단계의 fixture 초안과 UI 테스트다. 같은 테스트 파일을
수정하는 US1·US3 작업은 순차 수행한다. 이 설명은 단계 리뷰 생략이나 자동 에이전트 분업 승인이 아니다.
