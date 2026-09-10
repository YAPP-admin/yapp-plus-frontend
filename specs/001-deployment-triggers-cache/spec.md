# Feature Specification: 배포 트리거 및 원격 캐시 개선

**Feature Branch**: `001-deployment-triggers-cache`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "배포 설정 변경 시 Web과 Admin 배포를 자동으로 실행하고, 수동 배포와 Turborepo 원격 캐시를 추가합니다."

## Clarifications

### Session 2026-09-10

- Q: `deploy-manual.yml` 변경도 “배포 설정 변경”으로 보고 Web/Admin 자동 Preview와 Production 배포를 강제할까요? → A: 포함한다. `deploy-manual.yml` 변경도 Web/Admin Preview와 Production 배포를 강제한다.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 배포 설정 변경 검증 (Priority: P1)

저장소 관리자는 배포 workflow 또는 배포 액션을 변경했을 때 앱 코드 변경이 없어도 변경된 배포 절차를 Preview와 Production에서 검증할 수 있습니다.

**Why this priority**: 배포 자동화 자체가 변경되면 일반적인 앱 영향도 판정만으로는 새 절차를 실행하지 않아 회귀를 놓칠 수 있습니다.

**Independent Test**: 배포에 직접 영향을 주는 설정 파일만 변경한 Pull Request를 열고, 검증 성공 후 Web과 Admin Preview 배포 단계가 실행되는지 확인합니다. 해당 변경을 `main`에 반영한 뒤 두 Production 배포 단계가 실행되는지 확인합니다.

**Acceptance Scenarios**:

1. **Given** 배포 workflow 또는 배포 액션만 변경된 내부 Pull Request가 검증을 통과했을 때, **When** `deploy-preview.yml` workflow가 시작되면, **Then** Web과 Admin의 Preview 배포를 모두 시도합니다.
2. **Given** 배포와 무관한 문서 또는 PR 관리 설정만 변경되었을 때, **When** 영향 범위를 계산하면, **Then** Web과 Admin 배포를 실행하지 않습니다.
3. **Given** 자동 또는 수동 배포 설정 변경이 `main`에 반영되고 CI가 성공했을 때, **When** Production workflow가 시작되면, **Then** Web과 Admin의 Production 배포를 모두 시도합니다.

### User Story 2 - 수동 배포 실행 (Priority: P1)

저장소 관리자는 앱 코드 변경 없이도 필요한 앱과 환경을 선택해 Vercel 배포를 수동으로 실행할 수 있습니다.

**Why this priority**: 최초 배포, 긴급 재배포, 영향 범위 판정 오류 복구에 자동화된 수동 진입점이 필요합니다.

**Independent Test**: GitHub Actions의 수동 실행 화면에서 Web 또는 Admin과 Preview 또는 Production을 선택해 실행하고, 선택한 대상만 배포되며 실행 요약에 URL 또는 실패 원인이 표시되는지 확인합니다.

**Acceptance Scenarios**:

1. **Given** 인증된 저장소 관리자가 수동 실행을 요청했을 때, **When** 앱과 환경을 선택하면, **Then** 선택한 대상에 한해 배포를 실행합니다.
2. **Given** 수동 Production 배포가 실행될 때, **When** 배포가 완료되면, **Then** 해당 commit과 배포 URL을 실행 요약에 표시합니다.
3. **Given** 필수 Vercel 설정이 없거나 배포가 실패했을 때, **When** 수동 실행이 종료되면, **Then** workflow가 실패하고 Secret 값은 로그에 노출하지 않습니다.

### User Story 3 - CI/CD 원격 캐시 공유 (Priority: P2)

개발자와 CI/CD는 동일한 빌드 결과를 팀 단위 원격 캐시에서 재사용해 반복 빌드 시간을 줄일 수 있습니다.

**Why this priority**: Preview와 Production이 독립 runner에서 실행되므로 로컬 캐시만으로는 반복 작업을 줄일 수 없습니다.

**Independent Test**: 동일한 commit에 대해 CI 또는 CD 빌드를 두 번 실행하고, 두 번째 실행에서 변경 없는 Turbo task가 원격 캐시에서 복원되는지 확인합니다.

**Acceptance Scenarios**:

1. **Given** 유효한 Vercel 원격 캐시 인증 정보가 CI/CD에 제공되었을 때, **When** Turbo 빌드가 실행되면, **Then** 팀 원격 캐시에서 기존 결과를 조회하거나 새 결과를 저장합니다.
2. **Given** 원격 캐시 인증 정보가 제공되지 않거나 원격 캐시가 일시적으로 unavailable일 때, **When** 빌드가 실행되면, **Then** 로컬 빌드로 계속 진행하고 배포 정확성을 유지합니다.
3. **Given** 빌드 로그와 결과가 원격 캐시에 저장될 때, **When** 로그를 검토하면, **Then** Secret 또는 개인정보가 캐시 산출물에 포함되지 않습니다.

### Edge Cases

- 최초 commit처럼 비교 기준이 없으면 영향 범위를 안전하게 전체 영향으로 처리합니다.
- 수동 배포 workflow인 `deploy-manual.yml` 변경도 배포 직접 설정 변경으로 취급합니다.
- 배포 설정 파일 중 PR 관리용 설정만 변경하면 앱 배포를 강제하지 않습니다.
- Web과 Admin 중 한 대상의 배포가 실패해도 다른 대상의 실행 결과를 취소하지 않습니다.
- 수동 실행에서 허용되지 않은 앱·환경 조합은 시작 전에 거부합니다.
- 원격 캐시가 만료되거나 캐시 서버에 연결할 수 없으면 캐시 miss로 처리하고 빌드 결과를 새로 생성합니다.
- 외부 fork Pull Request에서는 Vercel Secret을 사용하지 않고 Preview 배포를 실행하지 않습니다.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 시스템은 배포에 직접 영향을 주는 자동 Preview, Production, 수동 배포 workflow와 배포 액션 변경을 앱 빌드 영향과 별도로 감지해야 합니다.
- **FR-002**: 시스템은 FR-001 변경이 검증을 통과하면 Web과 Admin의 Preview 배포를 각각 실행해야 합니다.
- **FR-003**: 시스템은 FR-001 변경이 `main`에 반영되고 CI가 성공하면 Web과 Admin의 Production 배포를 각각 실행해야 합니다.
- **FR-004**: 시스템은 배포와 무관한 문서·PR 관리 설정 변경에 대해 앱 배포를 실행하지 않아야 합니다.
- **FR-005**: 인증된 저장소 관리자는 앱(Web 또는 Admin)과 환경(Preview 또는 Production)을 선택해 수동 배포를 실행할 수 있어야 합니다.
- **FR-006**: Production 수동 배포는 저장소의 `production` Environment 배포 브랜치 정책을 통과한
  `main` 기준 실행만 허용해야 합니다. 1인 운영에서는 Required reviewer를 설정하지 않아 자기
  승인 대기로 workflow가 멈추지 않도록 합니다.
- **FR-007**: 모든 배포 실행은 대상 앱, 환경, 검증된 commit, 성공 여부와 배포 URL을 실행 요약에 남겨야 합니다.
- **FR-008**: 시스템은 Vercel 원격 캐시 인증 정보가 있을 때 CI/CD의 Turbo task 산출물을 팀 캐시와 공유해야 합니다.
- **FR-009**: 원격 캐시를 사용할 수 없어도 시스템은 로컬 캐시 또는 재실행으로 빌드와 배포를 완료할 수 있어야 합니다.
- **FR-010**: 시스템은 Secret, 개인정보와 인증 정보를 로그 또는 원격 캐시 산출물에 기록하지 않아야 합니다.
- **FR-011**: 외부 fork 및 허용되지 않은 자동화 주체에는 배포 Secret을 전달하지 않아야 합니다.
- **FR-012**: Web과 Admin 배포는 서로 독립적으로 실행되어 한 대상의 실패가 다른 대상의 실행을 취소하지 않아야 합니다.

### Key Entities _(include if feature involves data)_

- **배포 대상**: 앱(Web 또는 Admin)과 환경(Preview 또는 Production)의 조합입니다.
- **영향 범위 판정**: commit 범위와 배포 설정 변경 여부를 바탕으로 배포 실행 여부를 결정하는 결과입니다.
- **원격 캐시 자격 증명**: Vercel 팀 원격 캐시를 조회·저장하기 위한 Secret과 팀 식별자입니다.
- **배포 실행 기록**: 대상 앱, 환경, commit, 성공 여부, URL과 실패 원인을 포함하는 실행 요약입니다.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 배포 관련 설정 변경이 포함된 검증 성공 Pull Request에서 Web과 Admin Preview 배포 시도가 모두 발생합니다.
- **SC-002**: 배포 관련 설정 변경이 `main`에 반영된 뒤 Web과 Admin Production 배포 시도가 모두 발생합니다.
- **SC-003**: 관리자가 수동 실행 한 번으로 선택한 앱·환경의 배포를 요청하면 1분 이내에 배포 job 시작 또는 설정 오류를 확인할 수 있고, 배포 완료 후 실행 요약에서 URL 또는 실패 원인을 확인할 수 있습니다.
- **SC-004**: 동일한 commit과 동일한 task를 두 번째 실행할 때 원격 캐시가 활성화된 환경의 해당 task가 원격 결과를 재사용합니다.
- **SC-005**: 외부 fork Pull Request의 실행 로그와 산출물에 Vercel Token이 노출되는 사례가 0건입니다.
- **SC-006**: Web과 Admin 중 한 배포가 실패해도 다른 앱의 독립적인 배포 시도와 결과 확인이 가능합니다.

## Assumptions

- `yapp-plus` Vercel 팀과 Web/Admin 프로젝트가 생성되어 있고, 각 프로젝트의 환경 변수가 구성되어 있습니다.
- GitHub Actions Secret `VERCEL_TOKEN`은 해당 팀에 접근할 수 있는 Vercel Access Token입니다.
- 원격 캐시 1단계에서는 OIDC 대신 기존 Vercel Access Token을 사용합니다.
- Production 배포의 기준은 `main`의 CI가 성공한 commit이며, 자동 배포 대상은 Web과 Admin으로 제한합니다.
- 수동 배포는 GitHub Actions의 workflow 실행 권한과 `production` Environment의 `main` 배포 브랜치
  정책으로 제한합니다. 1인 운영이므로 Required reviewer는 추가하지 않습니다.
- 모바일 배포와 Vercel 프로젝트 외의 배포 대상은 이 기능 범위에 포함하지 않습니다.
