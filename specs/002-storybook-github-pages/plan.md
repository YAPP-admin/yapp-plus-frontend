# Implementation Plan: Storybook GitHub Pages 자동 배포

**Branch**: `ci/storybook-github-pages` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

## Summary

`apps/storybook`의 정적 빌드 결과를 GitHub Pages artifact로 업로드하고 `github-pages` environment에 배포합니다. `main`의 Storybook 관련 경로만 자동 실행하며, `workflow_dispatch`로 수동 재배포할 수 있습니다. Storybook이 생성하는 상대 asset 경로를 그대로 사용해 project site 하위 경로를 지원합니다.

## Technical Context

**Language/Version**: Node.js `mise.toml` 고정 버전(Node 24 계열), pnpm `12.3.4`

**Primary Dependencies**: Storybook `10.6.0`, Vite `8.2.2`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`

**Storage**: GitHub Pages artifact와 `github-pages` deployment environment

**Testing**: `node --run check`, `node --run build`, `pnpm --filter @yapp-plus/storybook build`, `actionlint`, 실제 Pages workflow 실행

**Target Platform**: GitHub Actions `ubuntu-latest`, GitHub Pages project site

**Project Type**: Turborepo monorepo의 정적 문서 사이트

**Performance Goals**: 관련 변경 push 후 10분 이내 Pages URL 게시

**Constraints**: Secret 없이 최소 권한으로 배포, project site 하위 경로 지원, 무관한 변경에서 workflow 생략

**Scale/Scope**: 단일 Storybook 사이트, `packages/ui`의 공용 웹 컴포넌트 stories

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- 저장소의 외부 Actions SHA 고정 규칙을 지킵니다.
- Pages 배포에 필요한 `contents: read`, `pages: write`, `id-token: write`만 부여합니다.
- 기존 Storybook 앱과 `packages/ui` 공개 진입점을 재사용하고 새 패키지를 추가하지 않습니다.
- 변경에 가장 가까운 계층인 Storybook build와 workflow lint를 검증합니다.
- 공개 Pages에는 비밀 값이나 런타임 인증 정보를 포함하지 않습니다.

## Project Structure

### Documentation (this feature)

```text
specs/002-storybook-github-pages/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/storybook/
├── .storybook/
│   └── main.ts                 # Storybook Vite 설정
├── stories/
└── storybook-static/           # Storybook 정적 빌드 출력

.github/workflows/
└── deploy-storybook.yml        # GitHub Pages build/deploy workflow

README.md                       # 공개 URL과 최초 Pages 설정
```

**Structure Decision**: 기존 Storybook workspace의 빌드 출력은 유지하고, Pages 전용 workflow를 별도 파일로 추가합니다. 배포 artifact와 실제 Pages deployment를 별도 job으로 나눠 GitHub의 표준 권한·environment 계약을 따릅니다.

## Complexity Tracking

추가적인 복잡성 위반은 없습니다.
