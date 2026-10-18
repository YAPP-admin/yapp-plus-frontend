# 작업 목록: 관리자 세션 관리

**상태**: 7단계 구현·자동 검증 완료 — 사용자 리뷰 대기 (스크린샷 미완료)
**기준**: [spec.md](spec.md), [plan.md](plan.md), [data-model.md](data-model.md), [UI 계약](contracts/session-ui.md)

## 실행 규칙과 현재 상태

- 1단계: 명세·기본값 승인 완료. issue #68 생성 완료.
- 2단계: 사용자 “다음 단계 진행해” 지시로 승인 완료. 3단계 T005~T007을 수행했다.
- 한 번에 한 단계만 실행한다. 단계 안의 체크가 끝나도 사용자 확인 없이 다음 단계에 진입하지 않는다.
- 매 리뷰에 변경 파일, 화면 근거, 실행한 검증, 미검증 사항, 누적 diff 크기를 전달한다.
- 각 UI 작업은 먼저 현재 SEED 버전의 공개 컴포넌트·호환 snippet을 확인하고 사용한다. 와이어프레임의 픽셀 일치는 요구하지 않는다.
- 아래 경로는 저장소 루트 기준이다. 각 UI의 스타일은 같은 이름의 `.css.ts`에 둔다.
- 단계별 테스트는 해당 동작과 함께 작성한다. mock 반환값만 따라가는 테스트 대신 사용자의 결과를 검증한다.
- GitHub 외부 변경과 브랜치·commit 작업은 별도 승인된 범위에서만 수행한다.

## 단계 1~2 — 준비와 명세 (PR 1)

- [x] T001 `specs/008-admin-sessions/spec.md`에 요구사항·제외 범위·기본값과 승인 근거를 기록한다.
- [x] T002 `.context/admin-sessions-issue-draft.md`를 검토받고 승인된 issue #68을 명세에 연결한다.
- [x] T003 `specs/008-admin-sessions/plan.md`와 보조 문서에 구현 구조·계약·검증·PR 분리를 작성한다.
- [x] T004 `specs/008-admin-sessions/tasks.md`에 단계별 구현·검증·리뷰 중단점을 작성한다.

**중단점**: 2단계 승인 완료.

## 단계 3 — US4 데스크톱 관리자 셸 (PR 2)

독립 검증: 기존 관리자 경로를 이동하며 사이드바·헤더·활성 메뉴를 확인한다.

- [x] T005 [US4] `apps/admin/src/app/ui/admin-shell.tsx`와 스타일에 데스크톱 사이드바·헤더·본문 배치를 구현한다.
- [x] T006 [US4] `apps/admin/src/router.test.tsx`에서 메뉴 링크·출석 상세 활성 상태·로그인과 404의 셸 분리를 검증한다.
- [x] T007 [US4] `.context/sessions-step-03.jpg`에 데스크톱 화면을 저장하고 레이아웃·정보 위계·SEED 일관성을 검토해 리뷰를 요청한다.

**중단점**: 사용자 “다음 단계 진행해” 지시로 단계 3 승인 완료.

## 단계 4 — US4 좁은 화면과 셸 회귀 (PR 2)

독립 검증: 1024px·390px에서 메뉴를 열고 닫으며 모든 기존 화면에 접근한다.

- [x] T008 [US4] `apps/admin/src/app/ui/admin-shell.tsx`와 스타일에 좁은 화면 메뉴·닫기·포커스 복귀를 구현한다.
- [x] T009 [US4] `apps/admin/src/app/ui/admin-shell.test.tsx`에서 메뉴 조작·경로 변경 후 닫힘을 검증하고 router 회귀를 실행한다.
- [ ] T010 [US4] `.context/sessions-step-04.png`에 좁은 화면을 기록하고 check/build 결과와 함께 리뷰를 요청한다.

**중단점**: 사용자 “그러면 다음 단계 진행해” 지시로 단계 4 승인 완료. 미완료 시각 검증은 T010에 유지한다.

- SEED `lg`(1280px) 미만은 Side Panel 메뉴를 사용하고, 그 이상은 데스크톱 사이드바를 표시한다.
- 메뉴 열기·닫기·포커스 복귀·키보드 순환·경로 이동·넓은 화면 전환을 자동 검증했다.
- 브라우저 연결 정책 로드 실패와 네이티브 화면 캡처 오류(-10005)로 390px·1024px 스크린샷,
  실제 화면 넘침·터치·스크린 리더 검증은 미완료다. T010은 완료 처리하지 않는다.

## 단계 5 — 공통 데이터 기반 (PR 3)

독립 검증: UI 없이 입력 스키마·정렬·독립 저장소의 생성·조회·삭제를 검증한다.

- [x] T011 `apps/admin/src/pages/sessions/model/session.ts`에 생성·조회 스키마와 추론 타입, 정렬 함수를 구현한다.
- [x] T012 `apps/admin/src/pages/sessions/model/sessions.mock.ts`에 익명 fixture·독립 저장소 factory·브라우저 인스턴스를 구현한다.
- [x] T013 `apps/admin/src/pages/sessions/model/sessions.ts`에 DEV·브라우저 가드와 list/create/delete 함수를 구현한다.
- [x] T014 `apps/admin/src/pages/sessions/model/session.test.ts`와 `sessions.mock.test.ts`, `sessions.test.ts`에서 날짜·시간·공백·집계·상태 격리·환경 가드를 검증한다.

**중단점**: 사용자 “이해했어. 그렇게 진행해” 지시로 단계 5 승인 완료. 출석 화면의 기존 직군 모델은 수정하지 않았다.

- 입력·조회 스키마, 날짜·시간 정렬, 독립 메모리 저장소 및 DEV·브라우저 전용 서비스를 구현했다.
- 추가 29개를 포함한 관리자 207개 테스트와 `node --run check`, `node --run build`가 통과했다.
- 저장소는 동기 메모리 연산이고, UI에 제공할 서비스는 Promise 기반이다. 환경 가드 테스트 외에 서비스 mock은 사용하지 않았다.
- 운영 빌드에서 fixture 식별자·저장소 오류 문구가 검색되지 않았다. 현재 UI 미연결 상태이므로 목록 연결 후에도 재확인한다.
- 새로고침 초기화는 모듈 재시작 테스트로 검증했다. 실제 화면 이동·새로고침 검증은 목록 연결 후 수행한다.
- 화면 변경과 새 스크린샷은 없다. 수정 서비스는 T037에서 구현한다.
- 5단계 변경은 앞선 레이아웃·Select 변경과 분리해 데이터 기반 PR로 제출한다. 5~6단계는 목적별 로컬 커밋으로 분리하며 push·PR 변경은 수행하지 않는다.

## 단계 6 — US1 필터와 URL (PR 3)

독립 검증: 유형 URL 직접 진입과 뒤로 가기·앞으로 가기를 기존 페이지에서 확인한다.

- [x] T015 [US1] `apps/admin/src/pages/sessions/model/session-search.ts`와 공개 진입점에 type 검색 스키마·라벨을 정의한다.
- [x] T016 [US1] `apps/admin/src/routes/_dashboard/sessions.tsx`와 `pages/sessions/ui/sessions-page.tsx`를 유형 필터 계약으로 교체한다.
- [x] T017 [US1] `apps/admin/src/pages/sessions/model/session-search.test.ts`와 `apps/admin/src/router.test.tsx`에서 유효·잘못된·구형 검색값과 history를 검증한다.

**중단점**: 사용자 “확인 했어. 여기까지 나눠서 커밋해봐.” 지시로 단계 6 승인 완료. 현재 목록 준비 안내는 다음 단계까지 유지한다.

- 설치된 SEED 2.x의 Chip과 RadioGroup primitive를 조합해 전체·오프라인·팀 세션 단일 선택 칩을 제공한다.
- `type` URL 복원·잘못된 값·구형 `part` 무시·필터 변경 시 구형 검색값 제거·history·키보드 선택을 검증했다.
- `node --run check`, `node --run build` 통과. 관리자 204개 테스트 통과(기존 직군 경우를 유형 경우로 교체).
- 브라우저에서 URL 진입은 시도했으나 개발자 도구가 열린 상태와 사용자 탭 전환으로 시각 검증을 완료하지 못했다. 스크린샷·실제 터치·스크린 리더 검증은 미완료다.
- 7단계 카드·목록·Query 연결은 시작하지 않았다. 사용자 승인에 따라 여기까지 로컬 커밋하며 push는 수행하지 않는다.

## 단계 7 — US1 카드와 목록 (PR 4)

독립 검증: 모든 예시 세션이 정렬되고 필터·개수·카드 정보가 일치하는지 확인한다.

- [x] T018 [US1] `apps/admin/src/pages/sessions/model/session-queries.ts`에 전체 목록 Query와 클라이언트 조회 활성화를 구현한다.
- [x] T019 [US1] `apps/admin/src/pages/sessions/ui/session-card.tsx`와 스타일에 1열 목록의 세션·집계 표시를 구현하고 카드 본문은 비대화형으로 둔다.
- [x] T020 [US1] `apps/admin/src/pages/sessions/ui/sessions-page.tsx`에 필터 칩·목록·개수·정렬을 연결한다. 미연결 생성·메뉴 작업은 노출하지 않는다.
- [ ] T021 [US1] `apps/admin/src/router.test.tsx`와 `pages/sessions/ui/session-card.test.tsx`에서 필터·정렬·카드 클릭 시 화면 유지를 검증하고 `.context/sessions-step-07.png`를 기록한다.

**중단점**: 단계 7 사용자 리뷰 대기. 8단계 상태 UI는 시작하지 않는다.

- 전체 목록 Query 하나를 사용하며 `useHydrated` 이후 DEV 브라우저에서만 조회한다.
- 유형 필터·최신순 정렬·결과 개수·정보 표시용 세션 카드를 연결했다. 사용자 리뷰에 따라 1열 배치와 본문 클릭 시 화면 유지 정책을 적용했다. 생성·수정·삭제 메뉴는 노출하지 않는다.
- 카드의 정보·다섯 출석 집계는 독립 테스트로, 목록·필터·카드 클릭 시 화면 유지는 기존 router 테스트에서 검증했다. 서비스 mock이나 루트 mock을 추가하지 않았다.
- `node --run check`, `node --run build` 통과. 관련 자동 테스트 통과.
- 실제 브라우저의 오프라인 카드·1개 표시를 접근성 트리에서 확인했다. 이후 캡처 도구가 실패·시간 초과하여 스크린샷은 저장하지 못했다. T021은 캡처 완료 전까지 미완료로 유지한다.
- 좁은 화면·스크린 리더·실제 터치·많은 항목의 스크롤은 아직 수동 검증하지 않았다.
- 기존 제출한 데이터·필터 PR #73 위에 후속 목록 PR로 분리한다. 카드, 목록 연결, 명세, 모델 테스트 정리를 각각 독립 커밋으로 구성한다.

## 단계 8 — US1 목록 상태 (PR 4)

독립 검증: 조회 지연·실패·전체 빈 목록·필터 빈 결과를 각각 재현한다.

- [ ] T022 [US1] `apps/admin/src/pages/sessions/ui/sessions-page.tsx`에 로딩·재시도·두 빈 상태·프로덕션 준비 안내를 구현한다.
- [ ] T023 [US1] `apps/admin/src/pages/sessions/ui/sessions-page.test.tsx`에서 서비스 대역으로 상태 전환·재시도·생성 기능 비노출을 검증한다.
- [ ] T024 [US1] `.context/sessions-step-08.png`에 빈 화면을 기록하고 check/build와 목록 검증 결과를 리뷰받는다.

**중단점**: 단계 8 승인 대기. 여기까지가 목록 조회 MVP다.

## 단계 9 — US2 생성 모달과 입력 (PR 5)

독립 검증: 아직 페이지에 연결하지 않은 폼을 컴포넌트 테스트에서 열고 입력·취소한다.

- [ ] T025 [US2] `apps/admin/src/pages/sessions/ui/session-create-dialog.tsx`와 스타일에 SEED 기반 여섯 입력·모달·저장·취소 및 submit 콜백을 구현한다.
- [ ] T026 [US2] `apps/admin/src/pages/sessions/ui/session-create-dialog.test.tsx`에서 레이블·입력·취소 초기화·Esc와 배경 클릭 정책을 검증한다.

**중단점**: 단계 9 승인 대기. 임시 개발용 렌더링으로 `.context/sessions-step-09.png`를 기록한다.
페이지의 생성 버튼은 단계 11에서 노출하며 임시 확인용 코드는 제품에 포함하지 않는다.

## 단계 10 — US2 폼 검증과 제출 상태 (PR 5)

독립 검증: 제출 콜백을 제어하여 필드 오류·pending·서버 오류 표시를 검증한다.

- [ ] T027 [US2] `apps/admin/src/pages/sessions/ui/session-create-dialog.tsx`에 Form 검증·첫 오류 포커스·오류 연결을 구현한다.
- [ ] T028 [US2] `apps/admin/src/pages/sessions/ui/session-create-dialog.tsx`에서 pending/error 입력을 받아 중복 제출·닫기를 차단하고 실패 시 입력을 보존한다.
- [ ] T029 [US2] `apps/admin/src/pages/sessions/ui/session-create-dialog.test.tsx`에서 검증 시점·시간 비교·실패 후 수정·재시도를 검증한다.

**중단점**: 단계 10 승인 대기. 임시 개발용 렌더링의 오류 상태를 `.context/sessions-step-10.png`에 기록한다.
실제 페이지 연결 후 접근성 최종 확인은 단계 11에서 수행한다.

## 단계 11 — US2 생성 연결 (PR 6)

독립 검증: 실제 페이지의 버튼으로 생성하여 목록 반영·필터 초기화·완료 안내를 확인한다.

- [ ] T030 [US2] `apps/admin/src/pages/sessions/model/session-queries.ts`에 생성 Mutation과 조회 취소·성공 캐시 갱신을 연결한다.
- [ ] T031 [US2] `apps/admin/src/pages/sessions/ui/sessions-page.tsx`에 생성 버튼·모달·전체 필터 전환·완료 안내를 연결한다.
- [ ] T032 [US2] `apps/admin/src/pages/sessions/ui/sessions-page.test.tsx`에서 생성 성공·실패·필터 전환·목록 갱신을 검증한다.
- [ ] T033 [US2] `.context/sessions-step-11.png`에 생성 화면을 기록하고 실제 모달 포커스·터치·낮은 높이 및 check/build를 확인한다.

**중단점**: 단계 11 승인 대기.

## 단계 12-1 — US3 수정 폼과 초기값 (PR 7)

독립 검증: 기존 세션의 여섯 항목을 편집할 수 있고 취소·다시 열기 및 대상 전환 시 마지막 저장값을 표시한다.

- [ ] T034 [US3] `apps/admin/src/pages/sessions/ui/session-form-dialog.tsx`로 생성 폼의 공통 입력·검증을 추출하고 기존 생성 동작을 유지한다.
- [ ] T035 [US3] `apps/admin/src/pages/sessions/ui/session-edit-dialog.tsx`에 초기값·저장·취소·pending·error를 연결한다. 페이지 메뉴는 저장 연결 후 노출한다.
- [ ] T036 [US3] `apps/admin/src/pages/sessions/ui/session-edit-dialog.test.tsx`에서 초기값·검증·취소 초기화·다른 대상 전환을 검증하고 생성 폼 회귀를 실행한다.

**중단점**: 단계 12-1 승인 대기. 임시 개발용 렌더링을 `.context/sessions-step-12-1.png`에 기록한다.

## 단계 12-2 — US3 수정 저장과 목록 반영 (PR 7)

독립 검증: `세션 정보`에서 수정해 저장하고 실패·재시도·필터·정렬·집계 보존을 확인한다.

- [ ] T037 [US3] `apps/admin/src/pages/sessions/model/session.ts`, `sessions.ts`, `sessions.mock.ts`에 수정 입력·updateSession을 구현하고 id·집계 보존·없는 id 오류를 모델 테스트에서 검증한다.
- [ ] T038 [US3] `apps/admin/src/pages/sessions/model/session-queries.ts`에 수정 Mutation·조회 취소·성공 캐시 교체를 연결한다.
- [ ] T039 [US3] `apps/admin/src/pages/sessions/ui/session-card.tsx`와 `sessions-page.tsx`에 세션 정보 메뉴·수정 폼·완료 안내·포커스 복귀를 연결한다.
- [ ] T040 [US3] `apps/admin/src/pages/sessions/ui/sessions-page.test.tsx`에서 성공·실패·취소·없는 id·유형 변경에 따른 카드 제거·정렬·집계 보존을 검증한다.

**중단점**: 단계 12-2 승인 대기. `.context/sessions-step-12-2.png`와 check/build 결과로 리뷰받는다.

## 단계 13 — US3 삭제 (PR 8)

독립 검증: 삭제 취소·성공·실패·마지막 항목 삭제를 각각 확인한다.

- [ ] T041 [US3] `apps/admin/src/pages/sessions/ui/session-delete-dialog.tsx`와 스타일에 대상명·확인·pending·error·재시도를 구현한다.
- [ ] T042 [US3] `apps/admin/src/pages/sessions/model/session-queries.ts`와 `apps/admin/src/pages/sessions/ui/sessions-page.tsx`에 삭제 Mutation·캐시 갱신·필터 유지·포커스 복구를 연결한다.
- [ ] T043 [US3] `apps/admin/src/pages/sessions/ui/sessions-page.test.tsx`에서 삭제 취소·실패 보존·성공 개수·마지막 항목·없는 ID를 검증한다.
- [ ] T044 [US3] `.context/sessions-step-13.png`에 삭제 화면을 기록하고 사용자 리뷰를 요청한다.

**중단점**: 단계 13 승인 대기.

## 단계 14 — 전체 검증과 전달 (PR 8 또는 수정 PR)

- [ ] T045 `specs/008-admin-sessions/quickstart.md`의 시나리오를 수행하고 필요 시 해당 admin 파일에서 발견한 결함만 수정한다.
- [ ] T046 `specs/008-admin-sessions/validation.md`에 check/build, production mock 제외, 실제 환경별 검증과 미검증 사항을 기록한다.
- [ ] T047 `.context/`에 최종 데스크톱·좁은 화면·모달 이미지를 저장하고 PR별 변경량 및 남은 위험과 함께 최종 리뷰를 요청한다.

**중단점**: 단계 14 승인 대기. 최종 리뷰가 merge 승인을 의미하지 않는다.

## 의존성과 실행 전략

`1 승인 → 2 승인 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12-1 → 12-2 → 13 → 14` 순서이며,
각 화살표는 앞 단계의 사용자 확인을 전제로 한다. 기반 모델은 US1·US2·US3가 공유하고 US4가 화면 접근을 제공한다.
목록 MVP는 단계 8, 생성 흐름은 단계 11, 전체 관리 흐름은 단계 13에서 완성된다.

일반적으로 모델 테스트와 독립 UI 스타일 조사는 병렬 가능하지만 이번 작업에서는 사용자 요청에 따라
단계 간 병렬 실행과 승인 전 선행 구현을 하지 않는다. 따라서 작업에 병렬 실행 표시는 부여하지 않는다.
