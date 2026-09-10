# Quickstart: 배포 트리거 및 원격 캐시 개선 검증

## 사전 조건

- `yapp-plus` Vercel 팀과 Web/Admin 프로젝트가 생성되어 있어야 합니다.
- GitHub Actions에 `VERCEL_TOKEN` Secret과 다음 Variables가 등록되어 있어야 합니다.
  - `VERCEL_ORG_ID`
  - `VERCEL_WEB_PROJECT_ID`
  - `VERCEL_ADMIN_PROJECT_ID`
- Vercel Token은 `yapp-plus` 팀에 접근할 수 있어야 합니다.
- Turbo 원격 캐시는 `VERCEL_TOKEN`을 `TURBO_TOKEN`으로 재사용하고 `TURBO_TEAM=yapp-plus`로 실행합니다.
- GitHub Environment `production`은 `main`만 배포 가능하도록 제한하고, 1인 운영 중에는 Required reviewer를 설정하지 않습니다.

## PR 1 — 배포 트리거

### 앱 변경 영향 판정 유지

1. 문서 또는 PR 관리 workflow만 변경한 Pull Request를 생성합니다.
2. `CI`가 성공하고 `Deploy Preview` workflow의 Web/Admin 배포가 `skipped` 요약으로 남는지 확인합니다.
3. Web 또는 Admin 소스, 또는 해당 앱이 의존하는 패키지를 변경한 Pull Request를 생성합니다.
4. 영향받은 앱의 Preview URL이 Pull Request 댓글에 생성되는지 확인합니다.

### 배포 설정 변경 강제 실행

1. `.github/actions/deployment-config-changed/action.yml`, `.github/actions/vercel-deploy/action.yml`, `.github/workflows/deploy-preview.yml`, `.github/workflows/cd.yml` 또는 `.github/workflows/deploy-manual.yml` 등 배포 workflow만 변경한 Pull Request를 생성합니다.
2. 앱 코드가 없어도 Web/Admin Preview 배포 단계가 실행되는지 확인합니다.
3. 같은 변경을 `main`에 반영한 뒤 CD에서 Web/Admin Production 배포 단계가 실행되는지 확인합니다.

### 수동 배포

1. GitHub Actions에서 `Deploy Manual` workflow를 선택하고 `Run workflow`를 실행합니다.
2. `app=web`, `environment=preview`를 선택해 Web만 배포되는지 확인합니다.
3. `app=all`, `environment=production`을 선택해 두 Production 배포가 독립적으로 실행되는지 확인합니다. 실행 전 `production` Environment가 `main`만 배포 가능하도록 설정되어 있고 Required reviewer가 없는지 확인합니다.
4. 실행 요약에서 commit과 URL을 확인하고 Token 값이 로그에 없는지 검색합니다.

## PR 2 — 원격 캐시

1. `VERCEL_TOKEN`이 `yapp-plus` 팀 scope에 접근 가능한지 확인합니다.
2. 동일 commit으로 CI 또는 수동 배포를 두 번 실행합니다.
3. 첫 실행은 원격 cache miss 또는 업로드, 두 번째 실행은 원격 cache hit인지 로그에서 확인합니다.
4. workflow 로그와 실행 요약에 `VERCEL_TOKEN` 또는 `TURBO_TOKEN` 값이 출력되지 않았는지 확인합니다.
5. Secret을 제거한 테스트 환경에서는 원격 캐시 없이 로컬 빌드가 계속 성공하는지 확인합니다.

## Admin Preview `404 NOT_FOUND` 진단

Admin Preview가 배포 성공으로 표시되지만 Vercel URL에서 `404 NOT_FOUND`를 반환하면
`Deploy Manual` 또는 `Deploy Preview`의 Admin job 로그를 확인합니다.

1. `WARNING! Build not running on Vercel`과 Nitro의 `preset: \`node-server\``가 함께 나타나는지 확인합니다.
2. `.vercel/output/functions/__server.func`가 생성되지 않았다면 Vercel Functions용 출력이 만들어지지 않은 상태입니다.
3. `.github/actions/vercel-deploy/action.yml`의 `vercel build` 호출에 다음 환경 변수를 주입합니다.

   ```sh
   VERCEL=1 VERCEL_ENV="$DEPLOYMENT_ENVIRONMENT" vercel build --token="$VERCEL_TOKEN"
   ```

4. 다시 빌드했을 때 `[nitro:vercel]` 로그와 `.vercel/output/functions/__server.func`가 생성되는지 확인합니다.
5. Vercel Admin 프로젝트의 Framework Preset은 `TanStack Start`, Root Directory는 `apps/admin`으로
   설정하고 Output Directory override는 비워 둡니다. `.output`을 직접 지정하지 않습니다.

## 로컬 정적 검증

저장소 루트에서 실행합니다.

```sh
node --run check
node --run build
mise x actionlint@1.7.12 -- actionlint .github/workflows/ci.yml .github/workflows/deploy-preview.yml .github/workflows/cd.yml .github/workflows/deploy-manual.yml
git diff --check
```

Turbo 영향 판정은 [data-model.md](./data-model.md)의 `영향 범위 판정` 규칙에 따라 Web/Admin 각각 확인합니다. 실제 Vercel 호출은 GitHub Secret과 팀 프로젝트 설정이 있는 CI 환경에서만 수행합니다.
