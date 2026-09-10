---
description: 'Storybook 정적 결과를 GitHub Pages에 자동 배포하는 작업 목록'
---

# Tasks: Storybook GitHub Pages 자동 배포

**Input**: `/specs/002-storybook-github-pages/`의 설계 문서

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: Storybook build, workflow lint, 저장소 품질 게이트와 실제 Pages workflow 실행으로 검증합니다.

## Phase 1: Setup

- [x] T001 [P] `apps/storybook/.storybook/main.ts`의 현재 Vite 설정과 정적 출력 경로 확인
- [x] T002 [P] `.github/workflows`의 기존 Actions 권한·SHA 고정 패턴 확인
- [x] T003 [P] `README.md`의 Storybook 명령어와 배포 문서 위치 확인

## Phase 2: Foundational

- [x] T004 Storybook 정적 산출물이 project site에서 동작하도록 기본 상대 asset 경로를 확인
- [x] T005 Storybook build가 `apps/storybook/storybook-static/index.html`을 생성하는 회귀 검증 명령을 `specs/002-storybook-github-pages/quickstart.md`에 정리

## Phase 3: User Story 1 - 공용 UI 문서 공개

**Independent Test**: 관련 변경을 `main`에 반영한 뒤 Pages URL에서 manager와 `UI/버튼` story를 확인합니다.

- [x] T006 [US1] `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`를 SHA로 고정한 `.github/workflows/deploy-storybook.yml` 추가
- [x] T007 [US1] `.github/workflows/deploy-storybook.yml`에서 `storybook-static`을 Pages artifact로 업로드하고 `github-pages` environment에 배포
- [x] T008 [US1] `.github/workflows/deploy-storybook.yml`에 최소 권한, deployment URL 출력, Pages 동시성 정책 추가
- [x] T009 [US1] `README.md`에 Storybook 공개 URL과 GitHub Pages 최초 설정 절차 추가

## Phase 4: User Story 2 - 변경 기반 자동 배포

**Independent Test**: 관련 `main` push는 workflow를 실행하고 무관한 파일 push는 실행하지 않는지 확인합니다.

- [x] T010 [US2] `.github/workflows/deploy-storybook.yml`에 Storybook·UI·공용 설정·lockfile·workflow 변경을 포함한 `paths` 필터 추가
- [x] T011 [US2] `.github/workflows/deploy-storybook.yml`에서 `main` push를 checkout·install·build하는 단계 구성
- [x] T012 [US2] `.github/workflows/deploy-storybook.yml`에서 Pages metadata를 초기화한 뒤 Storybook build를 실행

## Phase 5: User Story 3 - 수동 재배포

**Independent Test**: Actions 화면에서 `workflow_dispatch`를 실행해 코드 변경 없이 Pages 배포를 완료합니다.

- [x] T013 [US3] `.github/workflows/deploy-storybook.yml`에 `workflow_dispatch` 트리거 추가
- [x] T014 [US3] `specs/002-storybook-github-pages/quickstart.md`에 수동 재배포 검증 절차와 실패 진단 추가

## Final Phase: Polish & Cross-Cutting Concerns

- [x] T015 [P] `actionlint`로 `.github/workflows/deploy-storybook.yml` 검증
- [x] T016 [P] `pnpm --filter @yapp-plus/storybook build`로 Storybook 정적 빌드 검증
- [x] T017 `node --run check`, `node --run build`, `git diff --check` 실행
- [ ] T018 실제 관련 `main` push 또는 수동 실행으로 Pages URL·asset 경로·배포 권한 검증

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 → US3 → Polish 순서입니다.
- T006~~T009는 US1의 배포 경로를 구성하고, T010~~T012는 자동 실행 범위를 제한합니다.
- T013~T014는 자동 배포 경로와 독립적인 수동 진입점을 검증합니다.
- T015~T018은 구현 완료 후 실행합니다.

## Parallel Opportunities

- T001~T003은 서로 다른 기준선 확인 작업이므로 병렬로 수행할 수 있습니다.
- T015와 T016은 서로 다른 검증 명령이므로 병렬로 수행할 수 있습니다.

## Implementation Strategy

1. Storybook의 상대 asset 경로와 Pages workflow를 구성해 공개 URL을 먼저 만듭니다.
2. path filter와 수동 실행을 추가해 불필요한 배포를 줄입니다.
3. 로컬 품질 게이트와 실제 Pages 실행으로 마무리합니다.
