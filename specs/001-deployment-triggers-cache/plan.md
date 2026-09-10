# Implementation Plan: 배포 트리거 및 원격 캐시 개선

**Branch**: `001-deployment-triggers-cache` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)

## Summary

배포에 직접 영향을 주는 workflow와 복합 액션 변경은 일반 앱 영향도 판정과 분리해 Web/Admin 배포를 강제합니다. 별도의 수동 배포 workflow로 앱·환경을 선택한 재배포 진입점을 제공하고, 기존 Vercel Access Token을 Turbo 원격 캐시 인증에 재사용해 독립 runner 사이에서 빌드 산출물을 공유합니다.

구현은 두 개의 순차 PR로 나눕니다.

1. **PR 1 — 배포 트리거 개선**: 배포 설정 변경 감지, 앱별 영향 판정과 수동 배포 workflow
2. **PR 2 — 원격 캐시 활성화**: `TURBO_TOKEN`·`TURBO_TEAM` 연결과 캐시 검증·문서

## Technical Context

**Language/Version**: GitHub Actions YAML, Bash, JSON; Node.js `>=24.20.0`; pnpm `12.3.4`

**Primary Dependencies**: Turborepo `2.10.12`, Vercel CLI `59.13.1`, `jq`, `actions/checkout`, `jdx/mise-action`

**Storage**: 저장소 파일과 GitHub Actions 실행 요약; 배포 산출물은 Vercel에 저장

**Testing**: `node --run check`, `node --run build`, `actionlint`, GitHub Actions 실행 검증, Turbo 영향 판정 시나리오

**Target Platform**: GitHub Actions `ubuntu-latest`, Vercel Web/Admin 프로젝트

**Project Type**: 두 개의 독립 배포 앱을 포함한 pnpm/Turborepo 모노레포의 CI/CD 자동화

**Performance Goals**: 동일 task 재실행 시 원격 캐시 hit을 사용하고, 영향이 없는 앱은 빌드·배포를 실행하지 않음

**Constraints**: Production은 `main`의 검증된 commit만 사용; 외부 fork에는 Secret을 전달하지 않음; 외부 Action과 CLI는 commit 또는 고정 버전으로 사용; 토큰과 개인정보를 로그·캐시 산출물에 기록하지 않음

**Scale/Scope**: Web/Admin 두 앱, Preview/Production 두 환경, 단일 저장소 관리자 운영; OIDC와 모바일 배포는 후속 범위

## Constitution Check

_GATE: 계획 전·후에 저장소 작업 지침(AGENTS.md)과 보안·검증 규칙을 확인합니다._

- **최소 변경**: 기존 `turbo-affected`와 `vercel-deploy` 복합 액션을 재사용하고 새 third-party path filter를 추가하지 않습니다.
- **모노레포 경계**: 앱 간 직접 import를 추가하지 않고, workspace 이름과 Turbo 의존성 그래프만 사용합니다.
- **보안**: `VERCEL_TOKEN`은 Secret으로만 전달하고, 외부 fork Preview는 기존 조건으로 차단합니다. Production 수동 실행은 GitHub Actions 권한 범위로 제한합니다.
- **재현성**: mise lock, Turbo·Vercel CLI 버전과 외부 Action commit SHA를 고정합니다.
- **검증**: workflow 설정 변경 후 `actionlint`, `node --run check`, `node --run build`를 실행하고, GitHub에서 Preview·Production 및 수동 배포 시나리오를 확인합니다.

**결과**: 위 원칙을 위반하는 항목이 없으므로 게이트를 통과합니다.

## Research Summary

세부 결정은 [research.md](./research.md)에 기록했습니다.

- Turbo `globalDependencies`에 `.github/**`를 넣으면 모든 task가 영향받아 과도한 재빌드가 발생하므로 배포 전용 path 판정을 사용합니다.
- `vercel build`는 CI에서 로컬 빌드를 수행하고 `vercel deploy --prebuilt`는 결과를 업로드하므로 Turbo 환경 변수는 build job에 주입해야 합니다.
- 외부 CI 원격 캐시는 `TURBO_TOKEN`과 `TURBO_TEAM`으로 연결하며, 기존 Vercel Secret을 토큰으로 재사용합니다.
- 수동 실행은 `workflow_run`과 event 구조가 다른 별도 workflow로 분리해 Production checkout·권한 조건을 단순하게 유지합니다.

## Project Structure

### Documentation (this feature)

```text
specs/001-deployment-triggers-cache/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
.github/
├── actions/
│   ├── deployment-config-changed/action.yml
│   ├── turbo-affected/action.yml
│   └── vercel-deploy/action.yml
└── workflows/
    ├── ci.yml
    ├── deploy-preview.yml        # PR 1에서 ci.yml에서 분리
    ├── cd.yml
    └── deploy-manual.yml          # PR 1에서 추가

turbo.json                         # 필요할 때만 전역 입력 검토
README.md                          # PR 1·PR 2 운영 절차 갱신
```

**Structure Decision**: 기존 GitHub Actions 복합 액션을 유지합니다. CI 검증은 `ci.yml`, PR Preview 배포는 `deploy-preview.yml`, Production 자동 배포는 `cd.yml`로 분리합니다. 배포 설정 변경 판정은 `deployment-config-changed`, Turbo build 영향 판정은 `turbo-affected`, 실제 Vercel 배포는 `vercel-deploy`가 담당합니다. 수동 실행은 `deploy-manual.yml`로 분리합니다. 원격 캐시는 workflow job 환경 변수만 변경하며 앱·패키지 코드는 수정하지 않습니다.

## Implementation Sequence

### PR 1 — 배포 트리거 개선

1. `ci.yml`의 Preview 배포 job을 `deploy-preview.yml`로 이동하고, `ci.yml`은 검증 job만 담당하도록 분리합니다.
2. 배포에 직접 영향을 주는 파일 목록을 정의합니다: `deploy-preview.yml`, `cd.yml`, `deploy-manual.yml`, `deployment-config-changed/action.yml`, `turbo-affected/action.yml`, `vercel-deploy/action.yml`.
3. `deployment-config-changed`가 base/head 범위에서 해당 path가 변경됐는지 판정하고, 변경된 경우 `turbo-affected`의 `force-all` 입력으로 Web/Admin 배포를 모두 실행합니다. 앱 코드 변경은 기존 Turbo query 결과를 그대로 사용합니다.
4. `deploy-manual.yml`을 추가합니다.
   - `workflow_dispatch` 입력으로 `app`(`web`, `admin`, `all`)과 `environment`(`preview`, `production`)을 받습니다.
   - Production은 `main`의 검증된 commit을 checkout하고 `production` Environment의 배포 브랜치 정책을 적용합니다. 1인 운영이므로 Required reviewer는 설정하지 않습니다.
   - Preview는 수동 실행 ref를 사용합니다.
   - 선택된 대상만 matrix job으로 실행하고, 결과 URL·commit·실패 원인을 요약합니다.
   - 토큰 값은 입력·출력·요약에 기록하지 않습니다.
5. README에 배포 설정 변경 시 강제 배포, 수동 실행 절차와 `production` Environment의 `main` 배포 브랜치 정책 확인 절차를 추가합니다.
6. PR 단위 검증: `actionlint`, `node --run check`, `node --run build`, 설정 변경 path 판정, 수동 Preview 실행, `main` 기준 수동 Production 실행을 확인합니다. Production 실행은 실제 서비스에 영향을 주므로 Environment와 승인 없는 1인 운영 정책을 확인한 뒤 수행합니다.

### PR 2 — Turbo 원격 캐시

1. Vercel 팀 Remote Cache가 활성화되어 있는지 확인합니다. UI에 토글이 없어도 외부 CI 환경 변수 방식으로 진행할 수 있습니다.
2. `verify`, `deploy-preview`, `deploy-production` job에 다음 환경 변수를 연결합니다.
   - `TURBO_TOKEN: ${{ secrets.VERCEL_TOKEN }}`
   - `TURBO_TEAM: ${{ vars.TURBO_TEAM }}`
3. GitHub Variable `TURBO_TEAM`에 `yapp-plus` 팀 slug를 등록하고, README의 설정 표를 갱신합니다.
4. 동일 commit의 재실행에서 원격 cache hit을 확인하고, 인증 정보가 없는 실행도 로컬 빌드로 실패 없이 진행되는지 확인합니다.
5. PR 단위 검증: 캐시 hit/miss, 원격 캐시 장애 fallback, 로그 민감 정보 점검, `node --run check`, `node --run build`를 실행합니다.

### Post-implementation review

- Web/Admin 코드 변경에서 Preview 댓글 URL이 생성되는지 확인합니다.
- `main` 반영 후 CD가 검증된 SHA를 사용하고 대상별 독립 실행을 유지하는지 확인합니다.
- 수동 Production 배포가 권한 없는 실행이나 외부 fork에서 Secret을 노출하지 않는지 확인합니다.
- Turbo 원격 캐시 산출물과 `turbo.json`의 env/input 설정을 재검토합니다.

## Complexity Tracking

복잡성 증가를 정당화해야 하는 헌법 위반 항목이 없습니다.
