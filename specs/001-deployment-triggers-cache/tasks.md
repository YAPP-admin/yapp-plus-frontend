---
description: '배포 트리거 및 원격 캐시 개선 작업 목록'
---

# Tasks: 배포 트리거 및 원격 캐시 개선

**Input**: `/specs/001-deployment-triggers-cache/`의 설계 문서

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: 별도 테스트 파일은 추가하지 않습니다. GitHub Actions YAML과 복합 액션 변경은 `actionlint`,
`node --run check`, `node --run build`, 실제 GitHub Actions 실행으로 검증합니다.

**Organization**: 사용자 시나리오별로 독립 검증 가능한 단위로 나누고, PR 1은 US1/US2, PR 2는 US3에
집중합니다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 서로 다른 파일을 수정하거나 선행 작업에 의존하지 않아 병렬 처리 가능
- **[Story]**: 사용자 시나리오 매핑
- 모든 작업은 관련 파일 경로를 포함합니다.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 현재 배포 자동화 기준선을 확인하고 PR 1에서 분리할 경계를 고정합니다.

- [x] T001 Inspect current Preview deployment job in `.github/workflows/ci.yml`
- [x] T002 [P] Inspect current Production deployment job in `.github/workflows/cd.yml`
- [x] T003 [P] Inspect affected detection contract in `.github/actions/turbo-affected/action.yml`
- [x] T004 [P] Inspect shared Vercel deploy contract in `.github/actions/vercel-deploy/action.yml`
- [x] T005 [P] Inspect deployment documentation baseline in `README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 배포 경로가 공유할 영향 판정 계약을 먼저 정리합니다.

**CRITICAL**: 이 단계가 끝나야 Preview, Production, 수동 배포가 같은 기준으로 동작합니다.

- [x] T006 Add deployment config path input and detection output to `.github/actions/turbo-affected/action.yml`
- [x] T007 Update affected detection comments and failure behavior in `.github/actions/turbo-affected/action.yml`
- [x] T008 Verify affected detection with deployment workflow path changes against `.github/actions/turbo-affected/action.yml`

**Checkpoint**: 배포 설정 변경과 Turbo build 영향이 하나의 `affected` 결과로 합쳐집니다.

---

## Phase 3: User Story 1 - 배포 설정 변경 검증 (Priority: P1) MVP

**Goal**: 배포 workflow 또는 배포 액션만 변경해도 Web/Admin Preview와 Production 배포 절차를 검증합니다.

**Independent Test**: `.github/workflows/deploy-preview.yml` 또는 `.github/actions/vercel-deploy/action.yml`
변경만 포함한 PR에서 Web/Admin Preview가 실행되고, `main` 반영 후 Web/Admin Production이 실행되는지 확인합니다.

### Implementation for User Story 1

- [x] T009 [US1] Move Preview deploy job from `.github/workflows/ci.yml` to `.github/workflows/deploy-preview.yml`
- [x] T010 [US1] Keep `.github/workflows/ci.yml` limited to verification jobs
- [x] T011 [US1] Add deployment config path forcing to Preview jobs in `.github/workflows/deploy-preview.yml`
- [x] T012 [US1] Add deployment config path forcing to Production jobs in `.github/workflows/cd.yml`
- [x] T013 [US1] Preserve independent Web/Admin matrix execution in `.github/workflows/deploy-preview.yml`
- [x] T014 [US1] Preserve independent Web/Admin matrix execution in `.github/workflows/cd.yml`
- [x] T015 [US1] Preserve external fork and Dependabot Secret guard in `.github/workflows/deploy-preview.yml`
- [x] T016 [US1] Update Preview deployment documentation in `README.md`
- [x] T017 [US1] Update Production deployment documentation in `README.md`
- [x] T018 [US1] Run `actionlint` against `.github/workflows/ci.yml`, `.github/workflows/deploy-preview.yml`, and `.github/workflows/cd.yml`
- [x] T019 [US1] Run `node --run check` and `node --run build` for repository-level deployment workflow changes in `package.json`

**Checkpoint**: PR 1의 자동 Preview/Production 배포 트리거가 검증 가능합니다.

---

## Phase 4: User Story 2 - 수동 배포 실행 (Priority: P1)

**Goal**: 저장소 관리자가 앱과 환경을 선택해 필요한 배포만 수동 실행할 수 있습니다.

**Independent Test**: GitHub Actions에서 `app=web`, `environment=preview`를 실행하면 Web Preview만
배포되고, `app=all`, `environment=production`은 `main` 기준 Web/Admin Production만 실행되는지 확인합니다.

### Implementation for User Story 2

- [x] T020 [P] [US2] Add workflow_dispatch inputs to `.github/workflows/deploy-manual.yml`
- [x] T021 [US2] Add selected app matrix generation to `.github/workflows/deploy-manual.yml`
- [x] T022 [US2] Add Preview checkout and Vercel deploy path to `.github/workflows/deploy-manual.yml`
- [x] T023 [US2] Add Production checkout from `main` and `environment: production` to `.github/workflows/deploy-manual.yml`
- [x] T024 [US2] Add deployment URL, commit, and skipped target summaries to `.github/workflows/deploy-manual.yml`
- [x] T025 [US2] Document manual deployment and `production` Environment main branch policy in `README.md`
- [x] T026 [US2] Add GitHub Environment verification steps to `specs/001-deployment-triggers-cache/quickstart.md`
- [x] T027 [US2] Run `actionlint` against `.github/workflows/deploy-manual.yml`
- [ ] T028 [US2] Verify manual deployment scenarios from `specs/001-deployment-triggers-cache/quickstart.md`

**Checkpoint**: PR 1은 배포 설정 변경 검증과 수동 배포 진입점을 함께 제공합니다.

---

## Phase 5: User Story 3 - CI/CD 원격 캐시 공유 (Priority: P2)

**Goal**: GitHub Actions의 검증·Preview·Production 빌드가 Vercel 팀 원격 캐시를 공유합니다.

**Independent Test**: 동일 commit에서 CI 또는 배포 workflow를 두 번 실행해 두 번째 실행에서 Turbo remote
cache hit을 확인하고, 인증 정보가 없는 환경에서도 로컬 빌드가 실패하지 않는지 확인합니다.

### Implementation for User Story 3

- [ ] T029 [P] [US3] Add `TURBO_TOKEN` and `TURBO_TEAM` env wiring to verify job in `.github/workflows/ci.yml`
- [ ] T030 [P] [US3] Add `TURBO_TOKEN` and `TURBO_TEAM` env wiring to Preview deploy job in `.github/workflows/deploy-preview.yml`
- [ ] T031 [P] [US3] Add `TURBO_TOKEN` and `TURBO_TEAM` env wiring to Production deploy job in `.github/workflows/cd.yml`
- [ ] T032 [P] [US3] Add `TURBO_TOKEN` and `TURBO_TEAM` env wiring to manual deploy job in `.github/workflows/deploy-manual.yml`
- [ ] T033 [US3] Document `TURBO_TEAM=yapp-plus` and Vercel remote cache behavior in `README.md`
- [ ] T034 [US3] Verify repeated workflow cache behavior from `specs/001-deployment-triggers-cache/quickstart.md`
- [ ] T035 [US3] Check workflow logs for secret exposure after remote cache execution in `.github/workflows/ci.yml`
- [ ] T036 [US3] Run `node --run check` and `node --run build` for remote cache workflow changes in `package.json`

**Checkpoint**: PR 2는 원격 캐시 연결만 변경하며 배포 트리거 정책을 다시 바꾸지 않습니다.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Spec Kit 산출물과 실제 구현이 같은 내용을 말하는지 검증합니다.

- [x] T037 [P] Update verification notes in `specs/001-deployment-triggers-cache/quickstart.md`
- [x] T038 [P] Update implementation sequence in `specs/001-deployment-triggers-cache/plan.md`
- [x] T039 Run cross-artifact consistency review for `specs/001-deployment-triggers-cache/spec.md`, `specs/001-deployment-triggers-cache/plan.md`, and `specs/001-deployment-triggers-cache/tasks.md`
- [x] T040 Run `pnpm exec oxfmt --check specs/001-deployment-triggers-cache`
- [x] T041 Run `git diff --check` for all changed workflow and Spec Kit files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 이후 진행하며 모든 story 구현을 차단
- **User Story 1 (Phase 3)**: Foundational 이후 진행, PR 1 MVP
- **User Story 2 (Phase 4)**: Foundational 이후 진행 가능하지만 PR 1에서 US1과 함께 검토
- **User Story 3 (Phase 5)**: PR 1 merge 이후 진행
- **Polish**: 선택한 PR 범위 구현 후 실행

### User Story Dependencies

- **US1 (P1)**: US2 없이 독립 검증 가능
- **US2 (P1)**: US1과 같은 `vercel-deploy` 계약을 쓰지만 수동 workflow 자체는 독립 검증 가능
- **US3 (P2)**: US1/US2의 workflow 분리 이후 적용해야 파일 충돌과 검증 범위가 작아짐

### Parallel Opportunities

- T002-T005는 서로 다른 파일의 기준선 확인이므로 병렬 가능
- T020은 새 파일 입력 정의라 수동 배포 내부 로직 작업 전에 독립 진행 가능
- T029-T032는 서로 다른 workflow의 원격 캐시 환경 변수 연결이므로 병렬 가능
- T037-T038은 서로 다른 Spec Kit 문서 갱신이므로 병렬 가능

---

## Parallel Example: User Story 3

```text
Task: "Add `TURBO_TOKEN` and `TURBO_TEAM` env wiring to verify job in `.github/workflows/ci.yml`"
Task: "Add `TURBO_TOKEN` and `TURBO_TEAM` env wiring to Preview deploy job in `.github/workflows/deploy-preview.yml`"
Task: "Add `TURBO_TOKEN` and `TURBO_TEAM` env wiring to Production deploy job in `.github/workflows/cd.yml`"
Task: "Add `TURBO_TOKEN` and `TURBO_TEAM` env wiring to manual deploy job in `.github/workflows/deploy-manual.yml`"
```

---

## Implementation Strategy

### MVP First (PR 1)

1. Complete Phase 1 and Phase 2.
2. Complete US1 to split Preview from CI and force deployment on deployment config changes.
3. Complete US2 to add manual deployment.
4. Validate PR 1 with `actionlint`, `node --run check`, `node --run build`, Preview deployment, and manual Preview.
5. Merge PR 1 before changing remote cache wiring.

### Incremental Delivery

1. PR 1: 배포 트리거와 수동 배포를 먼저 안정화합니다.
2. PR 2: 같은 workflow 경계 위에 원격 캐시 환경 변수와 문서를 추가합니다.
3. PR 2 검증 후 동일 commit 재실행으로 cache hit을 확인합니다.

### Solo Operator Strategy

1. Required reviewer는 설정하지 않습니다.
2. `production` Environment에는 `main` 배포 브랜치 정책을 적용합니다.
3. 팀원이 추가되면 Required reviewer를 별도 정책 변경 PR로 검토합니다.
