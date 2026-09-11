# Implementation Plan: Preview 배포 생략 댓글 정책

**Branch**: `ci/preview-comment-policy` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

## Summary

Preview 영향 판정 결과가 `false`인 앱은 PR 댓글 단계를 실행하지 않도록 변경합니다. 실제 배포가 성공하거나 실패한 경우에만 기존 Web/Admin sticky 댓글을 작성·갱신하고, 생략 결과는 Job Summary에 유지합니다. 기존 sticky 댓글을 삭제하거나 수정하는 동작은 추가하지 않습니다.

## Technical Context

**Language/Version**: YAML workflow, GitHub Actions

**Primary Dependencies**: `marocchino/sticky-pull-request-comment@v3.0.5`, 기존 로컬 composite actions

**Storage**: GitHub Pull Request comments and Actions Job Summary

**Testing**: `actionlint`, `node --run check`, `node --run build`, GitHub Actions scenario verification

**Target Platform**: GitHub Actions `ubuntu-latest`, GitHub Pull Requests

**Project Type**: Monorepo CI/CD workflow

**Performance Goals**: 영향이 없는 앱에서 댓글 API 호출 0회

**Constraints**: 성공·실패 댓글은 유지하고, 기존 sticky 댓글은 삭제하지 않으며, Web/Admin 동작을 독립적으로 처리

**Scale/Scope**: `.github/workflows/deploy-preview.yml` 및 Preview 운영 문서

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- 외부 GitHub Action은 기존 고정 commit SHA를 유지합니다.
- PR 댓글 권한은 성공·실패 댓글 작성에 필요하므로 최소 범위인 `pull-requests: write`를 유지합니다.
- 배포 생략은 Job Summary에서 확인할 수 있도록 하며 로그와 댓글에 비밀 값을 기록하지 않습니다.
- 변경 범위를 Preview workflow와 관련 문서로 제한하고 새 의존성을 추가하지 않습니다.
- `actionlint`, `node --run check`, `node --run build`를 품질 게이트로 실행합니다.

## Project Structure

### Documentation (this feature)

```text
specs/003-preview-comment-policy/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
.github/workflows/deploy-preview.yml  # Preview 댓글 실행 조건
README.md                             # Preview 댓글 운영 정책
specs/001-deployment-triggers-cache/quickstart.md  # 기존 검증 절차
```

**Structure Decision**: 기존 Preview workflow의 영향 판정과 sticky 댓글 단계를 최소 수정합니다. 댓글 삭제 단계를 새로 추가하지 않고, 기존 Job Summary와 성공·실패 댓글 흐름을 재사용합니다.

## Complexity Tracking

추가적인 복잡성 위반은 없습니다.
