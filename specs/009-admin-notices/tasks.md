# 구현 작업: 관리자 공지 관리

[계획](plan.md)의 단계 순서가 사용자 스토리 우선순위보다 우선한다. 각 소단계 종료 시 검증을
제출하고 사용자 리뷰·다음 진행 확인을 기다린다. 아래 체크는 구현 완료 시에만 갱신한다.
경로의 `feature/`는 `apps/admin/src/features/notice-management/`를 뜻한다.

## 3 — 의존성 기반

검증: 같은 버전·React peer 호환, lockfile 일치, check·build 성공. 초과 변경량은 먼저 보고한다.

- [x] T001 `pnpm-workspace.yaml`, `apps/admin/package.json`, `pnpm-lock.yaml`에 Tiptap 5개 패키지를 같은 버전으로 반영하고 변경량·호환성을 검증한다.

## 4a — US2 JSON 기반

독립 검증: 지원 서식 JSON 왕복·빈 본문 판정·위험 URL 차단·SSR 렌더가 통과한다.

- [x] T002 [US2] `feature/ui/notice-editor.test.tsx`와 확장 테스트에 초기값 보존·JSON 전달·링크 회귀 검사를 작성한다.
- [x] T003 [US2] `feature/ui/notice-editor-extensions.ts`에 지원 확장을 구성하고 에디터에서 Tiptap JSON을 직접 입출력한다.
- [x] T004 [US2] `feature/ui/notice-editor.tsx`에 SSR 초기화 방지·uncontrolled 초기값·변경 콜백을 구현하고 인접 테스트를 추가한다.

## 4b — US2 편집 도구

독립 검증: 한글 입력·실행 취소·링크·툴바 선택 상태와 외부 변경 콜백이 올바르다.

- [ ] T005 [US2] `feature/ui/notice-editor-toolbar.tsx`와 `.css.ts`에 서식·링크 입력·접근 가능한 툴바를 구현한다.
- [ ] T006 [US2] `feature/ui/notice-editor.test.tsx`에 변경·초기값·재렌더 보존 회귀를 추가하고 실제 브라우저 한글 조합·붙여넣기·실행 취소를 검증한다.

2026-10-23 사용자 리뷰: 기본 툴바를 현재 수준으로 수용하고 5a 진행을 승인했다. T005·T006의 남은 접근성·실제 입력 검증은 후속 고도화로 보류하며 완료 체크하지 않는다.

## 5a — 공통 데이터 기반

검증: 네 대상·제출 직군·시간 경계·읽음 교집합 보존을 UI 없이 검증한다.

- [ ] T007 `feature/model/notice.test.ts`에 제목·본문·제출 입력과 대상·마감·읽음 경계 테스트를 작성한다.
- [ ] T008 `feature/model/notice.ts`에 Zod 저장/입력 스키마와 `notice-audience.ts`, `notice-summary.ts`에 대상·집계·마감 계산을 구현한다.

## 5b — 공통 모의 CRUD·Query

검증: 성공·실패·없는 id·대상 변경·환경 차단·모듈 초기화를 검증한다.

- [ ] T009 `feature/model/notices.mock.ts`에 합성 명단·예시 공지·원자적 CRUD와 읽음 보존을 구현하고 `notices.mock.test.ts`로 검증한다.
- [ ] T010 `feature/model/notices.ts`에 개발 브라우저 가드·동적 import·입출력 검증을 구현하고 `notices.test.ts`로 DEV/SSR/window 차단을 검증한다.
- [ ] T011 `feature/model/notice-queries.ts`에 hydration 조회·변경 훅·캐시 갱신을 구현하고 인접 테스트 및 `feature/index.ts` 공개 진입점을 추가한다.

## 6 — US1 목록

독립 검증: 모의 공지를 필터링하고 URL·집계·상태 화면을 확인한다.

- [ ] T012 [US1] `apps/admin/src/pages/notices/ui/notices-page.tsx`에 목록 조회·필터·로딩·오류·빈 상태·개수를 연결한다.
- [ ] T013 [US1] `apps/admin/src/pages/notices/ui/notice-card.tsx`와 `.css.ts`에 제목 링크·집계·마감·관리 메뉴를 구현한다.
- [ ] T014 [US1] `apps/admin/src/pages/notices/ui/notices-page.test.tsx`와 `apps/admin/src/router.test.tsx`에서 최신순·필터·뒤로가기·잘못된 검색값을 검증한다.

## 7 — US4 상세·읽음

독립 검증: 목록과 같은 집계·전체 회원 정렬·없는 공지·질문 준비 중 안내를 확인한다.

- [ ] T015 [US4] `apps/admin/src/pages/notice-detail/ui/notice-detail-page.tsx`에 메타·본문·읽음 집계·오류/없는 공지·질문 탭을 연결한다.
- [ ] T016 [US4] `apps/admin/src/pages/notice-detail/ui/notice-readers.tsx`와 `.css.ts`에 전체 대상 표·미열람 표시·좁은 화면 스크롤을 구현한다.
- [ ] T017 [US4] `apps/admin/src/pages/notice-detail/ui/notice-detail-page.test.tsx`에 집계 일치·정렬·0명·조회 실패와 없는 공지 구분을 검증한다.

## 8a — US2 공통 폼

독립 검증: 일반 네 대상·제출 배타 선택·한국 마감·선택 제출 방법의 검증을 확인한다.

- [ ] T018 [US2] `feature/ui/notice-form.tsx`와 `.css.ts`에 TanStack Form 입력·오류 연결·제출 조건부 입력을 구현한다.
- [ ] T019 [US2] `feature/ui/notice-form.test.tsx`에서 제목·대상·마감·방법·일반 종류 전환 시 제출 필드 제거를 검증한다.

## 8b — US2·US5 초기값과 본문

독립 검증: 새 입력 기본값·수정 마지막 저장값·백그라운드 조회 중 입력 보존을 확인한다.

- [ ] T020 [US2] `apps/admin/src/pages/notice-editor/ui/notice-editor-page.tsx`에 작성 초기값·편집기·공통 폼을 연결한다.
- [ ] T021 [US5] `apps/admin/src/pages/notice-editor/ui/notice-editor-page.test.tsx`에 수정 초기값·없는 id·재조회 시 입력 보존을 검증하고 페이지에 반영한다.

## 9a — US3 이미지 검증과 수명

독립 검증: 5/6개·기존 4+2·10MiB·각 형식·디코딩 실패와 객체 URL 해제를 확인한다.

- [ ] T022 [US3] `feature/model/notice-attachments.ts`와 `.test.ts`에 JPG·PNG·WebP 검증·초과 묶음 거절·파일별 오류를 구현한다.
- [ ] T023 [US3] `feature/ui/use-attachment-previews.ts`와 `.test.ts`에 Blob 미리보기 생성·교체·제거·unmount 해제를 구현한다.

## 9b — US3 첨부 UI

독립 검증: 정상 파일 유지·항목별 오류·5개 버튼 제한·취소 후 기존 첨부 복원을 확인한다.

- [ ] T024 [US3] `feature/ui/notice-attachment-input.tsx`와 `.css.ts`에 파일 선택·미리보기·제거를 구현하고 폼·상세에 연결한다.
- [ ] T025 [US3] `feature/ui/notice-attachment-input.test.tsx`에 재선택·선택 취소·제거 후 추가·저장 실패/수정 취소 시 원본 보존 회귀를 추가한다.

## 10a — US5 관리 흐름

독립 검증: 생성·수정 성공 이동, 삭제 필터 유지, 실패 복구·중복 방지와 캐시 일치를 확인한다.

- [ ] T026 [US5] `apps/admin/src/pages/notice-editor/ui/notice-editor-page.tsx`에 저장 mutation·진행/실패 상태·성공 이동을 연결한다.
- [ ] T027 [US5] `feature/ui/notice-delete-dialog.tsx`에 제목 포함 삭제 확인·재시도·포커스 복귀를 구현하고 목록 메뉴에 연결한다.
- [ ] T028 [US5] `apps/admin/src/pages/notice-editor/ui/notice-editor-page.test.tsx`와 `feature/ui/notice-delete-dialog.test.tsx`에 CRUD 성공/실패·중복 요청·마지막 카드 삭제 회귀를 추가한다.

## 10b — US5 이탈 확인

독립 검증: 변경 없음은 즉시 이동, 변경 있음은 취소/앱 이동/뒤로가기 확인·입력 유지가 동작한다.

- [ ] T029 [US5] `feature/ui/use-notice-leave-guard.ts`에 정규화 dirty·Router blocker·beforeunload·저장 성공 해제를 구현한다.
- [ ] T030 [US5] `feature/ui/use-notice-leave-guard.test.tsx`와 `apps/admin/src/router.test.tsx`에서 이탈 취소/확정·성공 이동·포커스 복귀를 검증한다.

## 11a — US6 UI 사례

독립 검증: 앱 간 import 없이 편집기·폼·첨부·확인 창의 주요 상태를 재현한다.

- [ ] T031 [US6] `apps/admin/.storybook/main.ts`, `preview.tsx`, `apps/admin/package.json`에 기존 catalog를 활용한 admin 내부 Storybook 실행 구성을 추가하고 빌드한다.
- [ ] T032 [US6] `feature/ui/notice-management.stories.tsx`에 편집기·오류·제출·첨부 한도·저장 중·확인 창 사례를 추가한다.

## 11b — US6 종합 검증

독립 검증: quickstart 전체·프로덕션 비활성화·375px·보조 기술 확인 결과를 기록한다.

- [ ] T033 [US6] `apps/admin/src/router.test.tsx`에 공지 경로 회귀를 보강하고 환경 가드·모의 새로고침 초기화를 재확인한다.
- [ ] T034 [US6] `specs/009-admin-notices/quickstart.md`에 check/build·브라우저·키보드/스크린 리더/터치 검증 결과·화면 근거·남은 제한을 기록한다.

## 의존성과 실행 전략

3 → 4a → 4b → 5a → 5b → 6 → 7 → 8a → 8b → 9a → 9b → 10a → 10b → 11a → 11b.
US1은 6에서 먼저 목록을 검토하고, US4는 7, US2는 8b, US3은 9b, US5는 10b에서 통합 완료한다.
US6의 환경 차단은 5b부터 적용하고 최종 검증은 11b다. 단계 간 병렬 구현은 하지 않는다.
같은 리뷰 단위에서도 공유 파일 충돌을 피한다. US1 카드/검색 테스트, US4 표/집계 테스트,
US2 툴바 수동 검증/변환 테스트, US3 디코딩 수동 검증/용량 테스트, US5 삭제/이탈 테스트,
US6 키보드/화면 크기 검증은 구현 확정 후 독립적으로 수행할 수 있다.
현재 범위에 별도 병렬 구현 작업은 없으므로 [P] 표시는 사용하지 않는다.
