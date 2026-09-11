---
description: 'Preview 배포 생략 시 PR 댓글을 작성하지 않는 작업 목록'
---

# Tasks: Preview 배포 생략 댓글 정책

**Input**: `/specs/003-preview-comment-policy/`의 설계 문서

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`

**Tests**: workflow lint, 저장소 품질 게이트와 GitHub Actions 시나리오로 검증합니다.

## Phase 1: Setup

- [x] T001 [P] `.github/workflows/deploy-preview.yml`의 영향 판정·댓글 단계 조건 확인
- [x] T002 [P] `README.md`와 `specs/001-deployment-triggers-cache/quickstart.md`의 Preview 댓글 정책 확인

## Phase 2: Foundational

- [x] T003 `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`로 댓글 정책과 검증 범위 정리

## Phase 3: User Story 1 - 필요한 Preview 결과만 PR에 표시 (Priority: P1) 🎯 MVP

**Goal**: 실제 Preview 배포가 실행된 경우에만 성공·실패 댓글을 작성하고, 생략 시 새 댓글을 작성하지 않습니다.

**Independent Test**: 영향 없는 PR에서 Job Summary만 갱신되고 새 댓글이 작성되지 않는지, 영향 있는 PR에서 성공·실패 댓글이 유지되는지 확인합니다.

### Implementation for User Story 1

- [x] T004 [US1] `.github/workflows/deploy-preview.yml`의 sticky 댓글 단계 조건을 `steps.affected.outputs.affected == 'true'`로 변경
- [x] T005 [US1] `.github/workflows/deploy-preview.yml`의 생략 Job Summary와 성공·실패 댓글 동작을 유지

## Phase 4: User Story 2 - 기존 Preview 댓글 보존 (Priority: P2)

**Goal**: 생략 실행에서 기존 Web/Admin sticky 댓글을 삭제하거나 수정하지 않습니다.

**Independent Test**: Preview 댓글이 있는 PR에 영향 없는 후속 커밋을 올리고 기존 댓글이 그대로 남는지 확인합니다.

### Implementation for User Story 2

- [x] T006 [US2] `.github/workflows/deploy-preview.yml`에 sticky 댓글 삭제·수정 단계를 추가하지 않고 기존 댓글 보존 정책 확인
- [x] T007 [US2] `README.md`와 `specs/001-deployment-triggers-cache/quickstart.md`에 생략 시 댓글 미작성 및 기존 댓글 보존 정책 문서화

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T008 [P] `actionlint`로 `.github/workflows/deploy-preview.yml` 검증
- [x] T009 [P] `node --run check` 실행
- [x] T010 [P] `node --run build` 실행
- [ ] T011 `specs/003-preview-comment-policy/quickstart.md`의 영향 있음·없음 시나리오 검증 결과 기록

## Dependencies & Execution Order

- Setup (Phase 1) → Foundational (Phase 2) → User Story 1 (Phase 3) → User Story 2 (Phase 4) → Polish (Phase 5)
- User Story 1은 User Story 2와 독립적이지만 동일 workflow 파일을 수정하므로 순차 실행합니다.
- T008~T010은 구현 완료 후 서로 다른 검증 명령으로 병렬 실행할 수 있습니다.

## Implementation Strategy

1. T004에서 댓글 생성 조건만 최소 수정합니다.
2. T005~T007에서 Job Summary와 기존 댓글 보존 동작 및 문서를 확인합니다.
3. T008~T011로 로컬 품질 게이트와 실제 PR 시나리오를 검증합니다.
