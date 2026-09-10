# Research: Storybook GitHub Pages 자동 배포

## Decision 1: GitHub 공식 Pages Actions 사용

**Decision**: `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`를 사용합니다.

**Rationale**: GitHub Pages의 공식 artifact 형식과 `github-pages` environment, `pages: write`, `id-token: write` 권한을 지원하며 별도 Secret이나 `gh-pages` 브랜치 관리가 필요하지 않습니다.

**Alternatives considered**:

- `gh-pages` 브랜치 직접 push: 배포 브랜치와 소스 브랜치를 별도로 관리해야 하고 GitHub Pages 공식 배포 흐름과 권한 모델이 분리됩니다.
- 서드파티 Storybook Pages action: 빌드와 배포가 한 액션에 결합되고 공급망·권한 범위를 추가로 검토해야 합니다.

## Decision 2: `main` push와 수동 실행만 지원

**Decision**: 자동 배포는 `main` push에 한정하고 `workflow_dispatch`를 함께 제공합니다. PR별 Pages Preview는 추가하지 않습니다.

**Rationale**: Storybook은 공용 UI 문서이므로 안정된 기본 브랜치 결과를 하나의 공개 URL로 제공하는 것이 목적입니다. PR마다 Pages를 생성하면 유지할 URL과 배포 실행 수가 불필요하게 늘어납니다.

**Alternatives considered**:

- 모든 PR에 Pages Preview: 검토 편의는 높지만 project site 하나를 공유할 수 없고 Preview 관리·정리 정책이 추가로 필요합니다.
- `gh-pages` branch push: workflow가 Pages artifact와 deployment 상태를 직접 관리하지 못합니다.

## Decision 3: 변경 경로 필터와 단일 Pages 동시성 그룹

**Decision**: Storybook, 공용 UI, Storybook이 사용하는 공용 설정·의존성, Pages workflow 변경에만 자동 실행하고 `pages` 단일 동시성 그룹으로 배포합니다.

**Rationale**: 무관한 앱 변경으로 문서를 다시 빌드하지 않고, 최신 `main` 결과만 공개하도록 합니다. Pages 공식 예시처럼 진행 중인 배포를 취소하지 않고 순차 완료시켜 Pages 환경의 중간 상태를 피합니다.

**Alternatives considered**:

- 모든 `main` push에서 실행: 설정이 단순하지만 불필요한 빌드와 Pages 배포가 발생합니다.
- `cancel-in-progress: true`: 빠른 push에서 오래된 빌드를 줄이지만, 이미 Pages 배포 중인 결과를 취소해 운영 상태를 불안정하게 만들 수 있습니다.

## Decision 4: Storybook의 기본 상대 경로를 유지

**Decision**: Storybook Vite 설정에 별도 base path를 주입하지 않고, Storybook이 생성하는 상대 asset 경로를 그대로 사용합니다.

**Rationale**: 현재 정적 산출물의 manager, iframe과 asset 참조가 `./` 상대 경로로 생성되어 project site 하위 경로에서도 동작합니다. 별도 base path를 주입하면 저장소명이나 hosting 방식이 바뀔 때 불필요한 설정 동기화가 생깁니다.

**Alternatives considered**:

- `/yapp-plus-frontend/`를 설정 파일에 고정: 현재 URL에는 맞지만 저장소명·호스팅 방식 변경에 취약합니다.
- `configure-pages`의 `base_path`를 빌드에 주입: 현재 Storybook 출력과 차이가 없고, 추가 환경 변수와 설정을 유지해야 합니다.

## References

- [GitHub Docs: Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Docs: Configuring a publishing source for GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [actions/deploy-pages](https://github.com/actions/deploy-pages)
- [Storybook Docs: Publish Storybook](https://storybook.js.org/docs/9/sharing/publish-storybook)
- [Storybook Tutorial: Deploy Storybook](https://storybook.js.org/tutorials/intro-to-storybook/react/en/deploy/)
