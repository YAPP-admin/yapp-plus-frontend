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

연결 이슈: [#87](https://github.com/YAPP-admin/yapp-plus-frontend/issues/87). 리뷰·머지 완료.

검증: 네 대상·제출 직군·시간 경계·읽음 교집합 보존을 UI 없이 검증한다.

- [x] T007 `feature/model/notice.test.ts`에 제목·본문·제출 입력과 대상·마감·읽음 경계 테스트를 작성한다.
- [x] T008 `feature/model/notice.ts`에 Zod 저장/입력 스키마와 `notice-audience.ts`, `notice-summary.ts`에 대상·집계·마감 계산을 구현한다.

## 5b — 공통 모의 CRUD·Query

사용자 승인으로 이슈 없이 로컬 구현했다. 사용자 리뷰 후 `DongjaJ/notice-mock-query`에 구현·검증 문서를 나누어 커밋했다.

검증: 성공·실패·없는 id·대상 변경·환경 차단·모듈 초기화를 검증한다.

- [x] T009 `feature/model/notices.mock.ts`에 합성 명단·예시 공지·원자적 CRUD와 읽음 보존을 구현하고 `notices.mock.test.ts`로 검증한다.
- [x] T010 `feature/model/notices.ts`에 개발 브라우저 가드·동적 import·입출력 검증을 구현하고 `notices.test.ts`로 DEV/SSR/window 차단을 검증한다.
- [x] T011 `feature/model/notice-queries.ts`에 hydration 조회·변경 훅·캐시 갱신을 구현하고 인접 테스트 및 `feature/index.ts` 공개 진입점을 추가한다.

## 6 — US1 목록

독립 검증: 모의 공지를 필터링하고 URL·집계·상태 화면을 확인한다.

`DongjaJ/notice-list`에서 구현과 자동 검증을 완료했다. 사용자 리뷰를 반영하고 다음 단계 진행을 승인받았다. 2026-10-24 Chrome 데스크톱·375px·키보드 필터를 확인했다. 스크린 리더·실제 터치 검증은 남아 있다.

- [x] T012 [US1] `apps/admin/src/pages/notices/ui/notices-page.tsx`에 목록 조회·필터·로딩·오류·빈 상태·개수를 연결한다.
- [x] T013 [US1] `apps/admin/src/pages/notices/ui/notice-card.tsx`와 `.css.ts`에 제목 링크·집계·마감·관리 메뉴를 구현한다.
- [x] T014 [US1] `apps/admin/src/pages/notices/ui/notices-page.test.tsx`와 `apps/admin/src/router.test.tsx`에서 최신순·필터·뒤로가기·잘못된 검색값을 검증한다.

## 7 — US4 상세·읽음

연결 이슈: [#94](https://github.com/YAPP-admin/yapp-plus-frontend/issues/94). 구현·검증 후 사용자 리뷰 대기.

독립 검증: 목록과 같은 집계·전체 회원 기본/컬럼 정렬·없는 공지·질문 준비 중 안내를 확인한다.

- [x] T015 [US4] `apps/admin/src/pages/notice-detail/ui/notice-detail-page.tsx`에 메타·본문·읽음 집계·오류/없는 공지·질문 탭을 연결한다.
- [x] T016 [US4] `apps/admin/src/pages/notice-detail/ui/notice-readers.tsx`와 `.css.ts`에 TanStack Table 기반 전체 대상 표·미열람 표시·좁은 화면 스크롤을 구현한다. 해당 단계에서 의존성을 catalog에 추가하고, 헤더 클릭/키보드 조작으로 컬럼 정렬·방향 표시·정렬 해제 시 기본 순서 복원을 연결한다.
- [x] T017 [US4] `apps/admin/src/pages/notice-detail/ui/notice-detail-page.test.tsx`에 집계 일치·기본 정렬·컬럼별 오름차순/내림차순·정렬 해제·동률/미열람 시각·키보드 및 aria-sort·0명·조회 실패와 없는 공지 구분을 검증한다.

## 8a — US2 공통 폼

연결 이슈: [#95](https://github.com/YAPP-admin/yapp-plus-frontend/issues/95). 구현·검증 완료, 사용자 리뷰 대기.

독립 검증: 일반 네 대상·제출 배타 선택·한국 마감·선택 제출 방법의 검증을 확인한다.

- [x] T018 [US2] `feature/ui/notice-form.tsx`와 `.css.ts`에 TanStack Form 입력·오류 연결·제출 조건부 입력을 구현한다.
- [x] T019 [US2] `feature/ui/notice-form.test.tsx`에서 제목·대상·마감·방법·일반 종류 전환 시 제출 필드 제거를 검증한다.

## 8b — US2·US5 초기값과 본문

독립 검증: 새 입력 기본값·수정 마지막 저장값·백그라운드 조회 중 입력 보존을 확인한다.

- [x] T020 [US2] `apps/admin/src/pages/notice-editor/ui/notice-editor-page.tsx`에 작성 초기값·편집기·공통 폼을 연결한다.
- [x] T021 [US5] `apps/admin/src/pages/notice-editor/ui/notice-editor-page.test.tsx`에 수정 초기값·없는 id·재조회 시 입력 보존을 검증하고 페이지에 반영한다.

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

### 8b 단계 구현 — #100

- 작성·수정 화면에 공통 폼과 본문 편집기를 연결했다. 저장·첨부·이탈 방지는 후속 단계다.
- 최초 조회값을 편집 시작값으로 고정하고, 재조회 성공·오류·삭제 결과에도 입력을 유지한다.
  다른 공지 ID로 이동하면 편집 세션을 초기화한다.
- UTC 마감은 한국 시간 날짜·시각으로 복원한다. 조회 중·실패/재시도·없는 공지를 구분한다.
- Chrome에서 제출 공지 초기값과 입력 확인을 검증했다. 화면 근거:
  `.context/notice-editor-integration.png`.
- #98 이후 변경은 별도 PR 대상으로 유지하며, 사용자 리뷰 후 다음 단계를 진행한다.

- 8b 리뷰 반영: 관리자 탐색 영역은 SEED `Box`의 반응형 표시로 서버 HTML부터 유지한다.
  너비 훅은 데스크톱 전환 시 모바일 패널을 해제하는 동작에만 남겼다.
- 공지 목록·수정 조회와 편집기 초기화에는 SEED `Skeleton`으로 공간을 확보했다.
  실제 데이터 길이에 따른 세로 높이 변화까지 고정하지는 않는다.
- `node --run check`(관리자 324개 테스트)와 `node --run build` 통과.
  Chrome 375px·1440px에서 표시 전환, 메뉴 키보드 조작·닫기 후 포커스 복귀를 확인했다.
  화면 근거: `.context/notice-layout-desktop.png`, `.context/notice-layout-mobile.png`.
- 8b 리뷰 반영: 조회 훅·화면의 `useHydrated`와 `enabled` 분기를 제거하고,
  `NoticeQueryBoundary`에서 개발 환경·`ClientOnly`·Suspense·오류 재시도를 처리한다.
  수정 조회는 `useSuspenseQuery`, 목록·상세의 공지/명단 병렬 조회는 `useSuspenseQueries`를 사용한다.
- 제목·작성 링크·필터는 데이터 경계 밖에서 유지하여 로딩 완료 때 포커스가 사라지지 않는다.
  전체 게시 개수는 필터 결과 개수와 함께 조회 결과 영역에 표시한다.
- 서버 렌더링 중 조회 방지, 오류 재시도, 수정 입력 보존, 키보드 탐색을 포함해
  `node --run check`(관리자 322개 테스트)·`node --run build` 통과.
  Chrome에서 필터와 수정 입력을 확인했다. 화면 근거: `.context/notice-suspense-edit.png`.
- #98 이후 변경은 650줄을 넘어 분리를 검토했다. 현재 8b와 그 리뷰 수정은 800줄 미만이며,
  추가 구현은 이 단계의 리뷰·커밋·PR 분리 후 진행한다.

- 8b 리뷰 정리: 저장과 연결되지 않은 입력 확인 버튼·본문 검증 상태·성공 문구를 제거했다.
  `NoticeEditorForm`은 초기값 전달과 화면 조합만 담당한다. 본문 필수 검증은 저장 연결 시 적용한다.
- 수정·상세 페이지의 공통 경계 중복 검증 4개와 대시보드 정적 문구 테스트 1개를 제거했다.
  공통 경계는 공지 목록에서, 수정 고유 동작은 기본값·입력 보존/ID 전환·재시도/없는 공지로 검증한다.
- `node --run check`(관리자 315개 테스트)·`node --run build` 통과.
  Chrome 화면 근거: `.context/notice-editor-simplified.png`.
