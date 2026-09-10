# Research: 배포 트리거 및 원격 캐시 개선

## 1. CI 설정 변경을 영향 범위에 포함하는 방법

**Decision**: 배포 전용 path 판정은 별도 `deployment-config-changed` 복합 액션으로 분리하고, 기존 `turbo-affected` 액션은 Turbo workspace의 `build` 영향 판정만 담당합니다. Preview 배포를 CI 검증 workflow에서 분리해 검증 절차 변경이 불필요한 Preview 배포를 유발하지 않도록 하며, 다음 파일만 배포 설정 변경으로 취급합니다.

```text
.github/workflows/deploy-preview.yml
.github/workflows/cd.yml
.github/workflows/deploy-manual.yml
.github/actions/deployment-config-changed/action.yml
.github/actions/turbo-affected/action.yml
.github/actions/vercel-deploy/action.yml
```

**Rationale**: 현재 `turbo query affected --tasks build`는 앱과 내부 패키지 그래프를 기준으로 하므로 PR 라벨러·제목 검증·문서 변경은 앱 배포를 유발하지 않습니다. Preview 배포를 별도 workflow로 분리하면 `ci.yml`의 lint·test·typecheck 같은 검증 변경이 배포를 강제하지 않습니다. 배포 절차 자체가 변경된 경우에만 `deployment-config-changed`가 두 앱을 강제로 실행하도록 알려주면, Turbo 판정 액션을 범용으로 유지하면서 자동화 회귀를 검증할 수 있습니다.

**Alternatives considered**:

- `.github/**` 전체를 `globalDependencies`에 추가: 모든 task hash가 무효화되어 lint·test·typecheck까지 전체 재실행되므로 범위가 과도합니다.
- `dorny/paths-filter` 추가: 동작은 가능하지만 단순한 고정 파일 목록 판정만 필요해 third-party 의존성을 늘릴 필요가 없습니다.
- `turbo-affected`에 path 목록 input 유지: workflow 호출부마다 같은 배포 설정 목록을 넘겨야 하고, Turbo 그래프 판정과 배포 정책 판정 책임이 섞입니다.
- Preview job을 기존 `ci.yml`에 유지: CI 검증 변경과 Preview 배포 변경의 경계가 섞여 관련 없는 CI 변경도 배포를 강제할 수 있습니다.

참고: [Turborepo globalDependencies](https://turborepo.dev/docs/reference/configuration)

## 2. Vercel CLI와 Turbo 빌드 경계

**Decision**: `vercel build` 실행 환경에 Turbo 설정을 전달하고, `vercel deploy --prebuilt`는 업로드 단계로만 취급합니다.

**Rationale**: `vercel build`는 로컬 또는 자체 CI 환경에서 `.vercel/output`을 생성하며, 프로젝트의 build command가 `pnpm build`라면 그 안에서 Turbo가 실행됩니다. `deploy --prebuilt`는 앞 단계의 결과를 업로드하므로 Turbo 캐시는 사용하지 않습니다.

**Alternatives considered**:

- Vercel Git 연동에 빌드를 위임: 현재 요구사항은 고정된 GitHub CI/CD와 검증된 commit을 유지하는 것이므로 선택하지 않습니다.
- `vercel deploy`만 실행: 로컬 사전 빌드와 배포 결과 연결이 불가능하므로 선택하지 않습니다.

참고: [Vercel build](https://vercel.com/docs/cli/build), [Vercel deploy --prebuilt](https://vercel.com/docs/cli/deploy)

## 3. Vercel Remote Cache 인증

**Decision**: 기존 `VERCEL_TOKEN` Secret을 `TURBO_TOKEN`으로 재사용하고, `TURBO_TEAM`에는 `yapp-plus` 팀 slug를 사용합니다. OIDC는 후속 작업으로 미룹니다.

**Rationale**: Vercel은 외부 CI에서 Vercel Access Token과 팀 slug를 환경 변수로 제공하는 방식을 지원합니다. 동일한 팀 범위 토큰을 재사용하면 Secret 수를 늘리지 않고 배포와 원격 캐시의 권한 범위를 일치시킬 수 있습니다.

**Alternatives considered**:

- 별도의 `TURBO_TOKEN` Secret: 권한을 분리할 때는 유용하지만 현재 팀 단일 운영에서는 중복 Secret이 됩니다.
- OIDC: 장기 토큰을 없앨 수 있지만 GitHub·Vercel 신뢰 설정이 추가되어 현재 범위를 넘어섭니다.
- 로컬 `turbo link`만 사용: 개발자 환경에는 유효하지만 독립 runner인 GitHub CI/CD 인증을 해결하지 못합니다.

참고: [Vercel Remote Caching](https://vercel.com/docs/monorepos/remote-caching)

## 4. 수동 배포 workflow 경계

**Decision**: `workflow_run` 기반 CD에 수동 event를 섞지 않고 `deploy-manual.yml`을 별도 workflow로 추가합니다. Preview 배포도 검증 전용 `ci.yml`과 분리해 `deploy-preview.yml`에서 실행합니다.

**Rationale**: `workflow_run` payload와 `workflow_dispatch` payload의 commit·branch 필드가 달라 하나의 workflow에서 두 경로를 처리하면 checkout 및 Production 보호 조건이 복잡해집니다. 별도 workflow는 선택한 앱·환경만 실행하고 결과를 요약하기 쉽습니다.

**Alternatives considered**:

- 기존 `cd.yml`에 `workflow_dispatch` 추가: event별 조건과 checkout 분기가 복잡해지고 잘못된 ref로 Production을 배포할 위험이 커집니다.
- 로컬에서 Vercel CLI 수동 실행: 최초 배포에는 가능하지만 팀이 공유할 재현 가능한 운영 절차가 아닙니다.
- 빈 코드 commit으로 배포 유도: 변경 이력을 오염시키고 영향 판정 목적을 훼손합니다.

## 5. 보안·운영 결정

- 외부 fork Preview에는 기존처럼 Vercel Secret을 전달하지 않습니다.
- 수동 Production은 GitHub workflow 실행 권한과 `production` Environment의 `main` 배포 브랜치 정책을 모두 통과한 사용자만 호출할 수 있도록 합니다. 1인 운영에서는 Required reviewer를 설정하지 않습니다.
- 실행 요약에는 URL, 대상, 환경, commit만 기록하고 토큰·환경 변수 값은 기록하지 않습니다.
- 원격 캐시 로그도 artifact로 저장될 수 있으므로 Secret 출력 여부를 검증합니다.
