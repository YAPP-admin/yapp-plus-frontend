# Feature Specification: Storybook GitHub Pages 자동 배포

**Feature Branch**: `ci/storybook-github-pages`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Storybook을 GitHub Pages에 배포합니다."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 공용 UI 문서 공개 (Priority: P1)

개발자와 디자이너는 저장소의 공용 UI 컴포넌트와 Storybook 사례를 공개 URL에서 확인할 수 있습니다.

**Why this priority**: 로컬 환경을 설정하지 않아도 컴포넌트 상태와 접근성 사례를 공유할 수 있어 협업의 기준점이 됩니다.

**Independent Test**: `main`에 Storybook 또는 `packages/ui` 변경을 반영한 뒤 Pages URL에 접속해 Storybook 화면과 버튼 story가 표시되는지 확인합니다.

**Acceptance Scenarios**:

1. **Given** Storybook 빌드가 성공했을 때, **When** Pages 배포가 완료되면, **Then** 공개 URL에서 Storybook manager가 로드됩니다.
2. **Given** 공개 URL에 접속했을 때, **When** story를 선택하면, **Then** story iframe과 정적 asset이 project site 하위 경로에서 404 없이 로드됩니다.

### User Story 2 - 변경 기반 자동 배포 (Priority: P1)

저장소 관리자는 관련 변경이 `main`에 반영될 때만 최신 Storybook을 자동으로 배포할 수 있습니다.

**Why this priority**: 관련 없는 앱 변경으로 Pages 배포를 반복하지 않으면서 공개 문서를 최신 상태로 유지합니다.

**Independent Test**: 관련 파일을 변경한 `main` push와 무관한 파일만 변경한 `main` push를 각각 수행해 전자는 Pages workflow가 실행되고 후자는 실행되지 않는지 확인합니다.

**Acceptance Scenarios**:

1. **Given** `apps/storybook`, `packages/ui` 또는 빌드 입력이 변경되었을 때, **When** 변경이 `main`에 반영되면, **Then** Storybook build와 Pages deployment가 실행됩니다.
2. **Given** Storybook과 무관한 앱 코드만 변경되었을 때, **When** 변경이 `main`에 반영되면, **Then** Storybook Pages workflow가 시작되지 않습니다.
3. **Given** 새 배포가 진행 중일 때, **When** 더 최신 `main` push가 도착하면, **Then** 이전 실행과 최신 실행이 충돌하지 않고 Pages에는 최신 성공 산출물이 배포됩니다.

### User Story 3 - 수동 재배포 (Priority: P2)

저장소 관리자는 코드 변경 없이 GitHub Actions에서 Pages workflow를 수동 실행해 문서를 재배포할 수 있습니다.

**Why this priority**: Pages 설정 변경이나 일시적인 배포 실패를 새 커밋 없이 복구할 수 있습니다.

**Independent Test**: Actions 화면에서 workflow를 수동 실행하고, 빌드 산출물이 Pages에 다시 배포되는지 확인합니다.

**Acceptance Scenarios**:

1. **Given** 저장소 관리자가 workflow 실행 권한을 가졌을 때, **When** 수동 실행을 요청하면, **Then** Storybook을 빌드하고 Pages에 배포합니다.
2. **Given** Storybook 빌드가 실패했을 때, **When** workflow가 종료되면, **Then** Pages 배포 단계는 실행되지 않고 실패 원인이 로그에 남습니다.

## Edge Cases

- Storybook 또는 `packages/ui` 변경이 없으면 자동 workflow를 실행하지 않습니다.
- project site의 하위 경로에서도 manager, iframe, addon asset의 상대 경로가 유지되어야 합니다.
- 빌드 산출물이 없거나 빈 디렉터리이면 artifact 업로드 전에 workflow가 실패해야 합니다.
- 동시에 여러 배포가 요청되면 이전 실행이 Pages 환경을 덮어쓰지 않도록 하나의 배포만 진행합니다.
- 외부 Secret은 사용하지 않으며 GitHub Actions 기본 토큰의 최소 권한만 사용합니다.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 시스템은 Storybook을 정적 웹 산출물로 빌드해 GitHub Pages에 공개해야 합니다.
- **FR-002**: 시스템은 `main`의 Storybook 관련 변경을 감지하면 자동으로 Storybook Pages 배포를 실행해야 합니다.
- **FR-003**: 시스템은 `workflow_dispatch`로 코드 변경 없이 Storybook Pages를 수동 재배포할 수 있어야 합니다.
- **FR-004**: 시스템은 Storybook과 `packages/ui`, 공용 빌드 입력 또는 Pages workflow 변경이 없는 push에서 자동 배포를 실행하지 않아야 합니다.
- **FR-005**: 시스템은 project site 하위 경로에서 Storybook manager, stories, iframe과 정적 asset을 정상 제공해야 합니다.
- **FR-006**: 시스템은 Pages artifact 생성과 Pages deployment를 별도 단계로 수행하고, 배포 job에 필요한 Pages 및 OIDC 권한만 부여해야 합니다.
- **FR-007**: 시스템은 배포 환경을 `github-pages`로 연결하고 성공한 Pages URL을 workflow 결과에서 확인할 수 있어야 합니다.
- **FR-008**: 시스템은 동일한 Pages 배포가 중복 실행되지 않도록 동시 실행 정책을 적용해야 합니다.
- **FR-009**: 시스템은 외부 Secret을 저장하거나 출력하지 않고 GitHub Actions 기본 인증으로 Pages를 배포해야 합니다.
- **FR-010**: 시스템은 Storybook build 또는 artifact upload 실패 시 Pages deployment를 수행하지 않아야 합니다.

### Key Entities _(include if feature involves data)_

- **Storybook 정적 산출물**: `apps/storybook`과 공용 UI stories를 브라우저에서 제공하기 위해 생성한 파일 묶음입니다.
- **Pages artifact**: GitHub Pages deployment job으로 전달되는 압축된 정적 산출물입니다.
- **Pages 배포 실행**: 특정 `main` commit의 Storybook artifact를 `github-pages` 환경에 게시한 결과입니다.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 관련 변경이 `main`에 반영된 뒤 10분 이내에 공개 Pages URL에서 Storybook 첫 화면을 확인할 수 있습니다.
- **SC-002**: 공개 Pages URL의 첫 화면과 기본 story의 주요 JavaScript·CSS asset 요청이 404 없이 100% 성공합니다.
- **SC-003**: Storybook과 무관한 변경 10회에서 Pages workflow가 0회 실행됩니다.
- **SC-004**: 수동 workflow 실행 1회로 코드 변경 없이 최신 Storybook artifact가 Pages에 게시됩니다.
- **SC-005**: Pages workflow 로그와 artifact에 저장소 Secret 값이 0건 노출됩니다.
- **SC-006**: 동시에 여러 실행이 요청되어도 최종 Pages 사이트는 가장 최신 성공 `main` commit의 결과를 제공합니다.

## Assumptions

- 저장소의 GitHub Pages publishing source는 GitHub Actions로 설정합니다.
- Pages 사이트는 저장소 project site 경로를 사용하며, 기본 공개 URL은 `https://yapp-admin.github.io/yapp-plus-frontend/`입니다.
- PR별 Pages Preview는 범위에 포함하지 않고 `main`의 공개 Storybook만 관리합니다.
- Storybook은 현재의 `storybook build` 명령과 `storybook-static` 출력 디렉터리를 유지합니다.
- GitHub Pages 배포는 Vercel 배포와 독립된 정적 문서 배포로 운영합니다.
- 최초 Pages 환경 설정은 저장소 관리자 화면에서 한 번 수행합니다.
