# YAPP Plus Frontend

YAPP Plus의 웹, 모바일 셸, 관리자 앱을 관리하는 Turborepo 기반 모노레포입니다.

## 사전 준비

[mise](https://mise.jdx.dev/)를 설치합니다. 이 저장소는 `mise.toml`에서 Node.js 버전을
고정하고 `package.json`에서 정확한 pnpm 버전을 읽습니다. Corepack은 사용하지 않습니다.

```sh
mise install
pnpm install
```

## 워크스페이스

| 경로                  | 역할                                       |
| --------------------- | ------------------------------------------ |
| `apps/web`            | 모바일 WebView에서 렌더링되는 Next.js 앱   |
| `apps/mobile`         | Expo/React Native 기반 WebView 셸          |
| `apps/admin`          | TanStack Start 기반 관리자 앱              |
| `apps/storybook`      | 공용 UI를 독립적으로 확인하는 Storybook    |
| `packages/ui`         | vanilla-extract로 구현한 웹/관리자 공용 UI |
| `packages/api`        | Hey API, Ky, Zod, TanStack Query 연동      |
| `packages/app-bridge` | 타입이 지정된 WebView 브리지 계약          |
| `packages/config`     | 공용 TypeScript 및 Oxlint 설정             |

앱과 내부 패키지의 관계는 각 `package.json`의 `workspace:*` 의존성으로 정의합니다. Turbo의
`^build`, `^lint`, `^test`, `^typecheck`가 이 관계를 따라 의존 패키지의 태스크를 먼저
처리합니다. 공통 외부 의존성 버전은 `pnpm-workspace.yaml`의 catalog에서 관리합니다.

## 명령어

| 명령어             | 설명                                           |
| ------------------ | ---------------------------------------------- |
| `pnpm dev`         | 웹, 관리자, 모바일 개발 서버 시작              |
| `pnpm build`       | 워크스페이스 패키지와 배포 가능한 앱 빌드      |
| `pnpm commitlint`  | 커밋 메시지 규칙 검사                          |
| `pnpm format`      | Oxfmt가 지원하는 파일 포맷팅                   |
| `pnpm lint`        | Oxlint로 앱과 패키지 검사                      |
| `pnpm typecheck`   | 워크스페이스 TypeScript 타입 검사              |
| `pnpm test`        | 워크스페이스 테스트 실행                       |
| `pnpm expo:doctor` | Expo 앱 설정 검증                              |
| `pnpm storybook`   | 공용 UI Storybook 개발 서버 시작               |
| `pnpm check`       | 포맷, 린트, 타입 검사, 테스트 품질 게이트 실행 |

Lefthook은 커밋 전에 스테이징된 소스 파일을 포맷팅하고 린트합니다. 커밋 메시지는
`<type>(<scope>): <subject>` 형식으로 검사하며 scope는 생략할 수 있습니다. 예를 들어
`feat(web): 로그인 화면 추가`, `ci: GitHub Actions 설치 안정화`처럼 작성합니다. 타입 검사와
테스트는 푸시 전에 실행합니다.

커밋 메시지 검사는 로컬 `commit-msg` 훅에서만 실행됩니다. `--no-verify`를 사용하거나 Git
훅이 설치되지 않은 환경에서 만든 커밋은 자동으로 검사되지 않습니다.

Oxlint는 `oxlint-tsgolint`의 type-aware 규칙과 React Compiler 검증 규칙을 함께 사용합니다.
Next.js 규칙은 웹 앱에만 적용하고, 프레임워크가 default export를 요구하는 파일은 별도
예외로 관리합니다.

Storybook은 `packages/ui`의 웹 컴포넌트만 다룹니다. 제품 앱 개발 서버와 항상 함께 실행하지
않도록 `pnpm dev`와 분리했으며, 정적 Storybook 빌드는 `pnpm build`에 포함합니다.

기본 디자인 토큰과 전역 reset은 `packages/ui`에서 관리합니다. 패키지의 일반 진입점을
가져오는 것만으로 전역 스타일이 적용되지는 않으며, 각 앱이 루트에서
`@yapp-plus/ui/styles`를 명시적으로 가져옵니다. 웹의 `global.css.ts`는 스타일을 다시
선언하는 파일이 아니라 Turbopack이 이 외부 스타일 진입점을 추적하게 하는 한 줄짜리
연결 파일입니다.

웹 앱은 Next.js의 React Compiler와 Turbopack Rust 구현을 사용합니다. Rust 구현은 아직
실험 기능이므로 Next.js를 올릴 때 관련 변경 사항과 빌드 결과를 함께 확인합니다.

## 배포

웹과 관리자 앱은 `yapp-plus` Vercel scope의 서로 다른 프로젝트로 배포합니다.

| 앱      | Vercel 프로젝트   | Root Directory | Framework      |
| ------- | ----------------- | -------------- | -------------- |
| `web`   | `yapp-plus-web`   | `apps/web`     | Next.js        |
| `admin` | `yapp-plus-admin` | `apps/admin`   | TanStack Start |

`.github/workflows/ci.yml`은 Pull Request와 `main` push의 품질 검증만 담당합니다.
`.github/workflows/deploy-preview.yml`은 내부 브랜치 Pull Request의 `CI`가 성공한 뒤 검증된
commit을 Preview 환경으로 배포합니다. 외부 fork와 Dependabot Pull Request에서는 배포용 Secret을
사용하지 않습니다. `.github/workflows/cd.yml`은 `main`의 CI가 성공하면 검증된 commit을
Production 환경으로 배포합니다. `.github/workflows/deploy-manual.yml`은 GitHub Actions
`Run workflow`에서 앱과 환경을 선택해 같은 Vercel 배포 절차를 수동 실행합니다. 각 앱은 독립된
matrix job으로 배포되므로 한 앱의 실패가 다른 앱의 실행을 취소하지 않습니다. 배포 workflow는
`.github/actions/vercel-deploy` 복합 액션을 사용해 같은 Vercel CLI 버전과 배포 절차를 공유합니다.

배포 전에 `turbo query affected`가 각 앱의 `build` task와 workspace 의존성 그래프를 기준으로
변경 영향을 계산합니다. 앱 또는 앱이 의존하는 내부 패키지가 영향을 받지 않았다면 해당 앱의
Vercel build와 배포를 생략합니다. 배포 절차 자체를 바꾸는 다음 파일은 앱 그래프와 무관하게
Web/Admin 배포를 모두 실행해 workflow 회귀를 검증합니다.

- `.github/workflows/deploy-preview.yml`
- `.github/workflows/cd.yml`
- `.github/workflows/deploy-manual.yml`
- `.github/actions/deployment-config-changed/action.yml`
- `.github/actions/turbo-affected/action.yml`
- `.github/actions/vercel-deploy/action.yml`

자동 배포 workflow는 `.github/actions/deployment-config-changed` 복합 액션으로 배포 설정 변경을
먼저 확인하고, `.github/actions/turbo-affected` 복합 액션으로 앱별 Turbo build 영향 범위를
계산합니다. 배포 설정이 바뀌면 `turbo-affected`의 `force-all` 입력으로 Web/Admin 배포를 모두
검증하고, 그렇지 않으면 앱별 build 입력이 바뀐 경우에만 배포합니다. Preview 결과는 Pull Request의
Web 및 Admin 댓글에 각각 표시하며, 새 commit이 올라오면 기존 댓글을 갱신합니다.

workflow를 사용하려면 저장소의 GitHub Actions 설정에 다음 값을 등록합니다.

| 종류     | 이름                      | 값                                   |
| -------- | ------------------------- | ------------------------------------ |
| Secret   | `VERCEL_TOKEN`            | `yapp-plus` scope에 접근 가능한 토큰 |
| Variable | `VERCEL_ORG_ID`           | `yapp-plus` scope ID                 |
| Variable | `VERCEL_WEB_PROJECT_ID`   | `yapp-plus-web` 프로젝트 ID          |
| Variable | `VERCEL_ADMIN_PROJECT_ID` | `yapp-plus-admin` 프로젝트 ID        |

`VERCEL_TOKEN`은 [Vercel Account Tokens](https://vercel.com/account/settings/tokens)에서 만들고
GitHub 저장소에만 Secret으로 등록합니다. 이 토큰은 Vercel 배포와 Turbo 원격 캐시 인증에 함께
사용하며, workflow는 `TURBO_TOKEN`에 `VERCEL_TOKEN` Secret을 전달하고 `TURBO_TEAM`에는
`yapp-plus` 팀 slug를 사용합니다. GitHub Actions에 Secret이 없는 fork Pull Request나 로컬
실행에서는 원격 캐시 없이 로컬 Turbo 캐시로 동작해야 합니다. 로컬 Vercel 인증 토큰이나
`.vercel/`, `.env.local`은 커밋하지 않습니다. 앱이 사용하는 환경 변수는 GitHub Actions가 아니라
각 Vercel 프로젝트의 Environment Variables에 Preview와 Production 환경별로 등록합니다.

Vercel GitHub App의 `YAPP-admin/yapp-plus-frontend` 접근 승인이 완료되면 장기 토큰 대신 OIDC 기반
Turbo 원격 캐시 인증으로 전환할 수 있습니다. OIDC 전환 전까지는 workflow 로그, 실행 요약과 캐시
artifact에 `VERCEL_TOKEN` 또는 `TURBO_TOKEN` 값을 출력하지 않습니다.

Production 수동 배포를 사용하려면 GitHub 저장소 Settings의 Environments에서 `production`
Environment를 만들고 deployment branches를 `main`으로 제한합니다. 1인 운영 중에는 Required
reviewer를 설정하지 않습니다. Required reviewer를 켜면 본인이 실행한 배포를 본인이 승인할 수 없어
workflow가 대기 상태로 멈출 수 있습니다.

같은 commit으로 새 배포가 필요하거나 영향 범위 판정을 우회해야 한다면 `Deploy Manual` workflow를
실행합니다. `app`은 `web`, `admin`, `all` 중 하나를 고르고 `environment`는 `preview` 또는
`production`을 선택합니다. Preview는 선택한 ref를 배포하고, Production은 항상 `main`을 checkout한
뒤 해당 commit에 성공한 `CI` push 실행이 있을 때만 배포합니다.

Preview 배포가 실패하면 GitHub Actions의 `Deploy Preview`, Production 배포가 실패하면 `CD` 또는
`Deploy Manual` 실행에서 실패한 job을 재실행합니다.

### Admin Preview가 성공했지만 `404 NOT_FOUND`일 때

Admin은 TanStack Start와 Nitro를 사용하므로 Vercel Functions용 `vercel` preset으로 빌드되어야
합니다. 현재 배포는 GitHub Actions runner에서 `vercel build`를 실행한 뒤
`vercel deploy --prebuilt`로 결과를 업로드하므로, Vercel이 제공하는 시스템 환경 변수가 자동으로
주입되지 않습니다. 다음 로그가 함께 나타나면 Nitro가 `node-server` preset으로 빌드된 것입니다.

- `WARNING! Build not running on Vercel`
- `[nitro] ... (preset: \`node-server\`)`
- `.output/public` 또는 `.output/server`만 생성되고 `.vercel/output/functions/__server.func`가 없음

이 상태에서는 배포가 성공으로 표시되어도 실행할 Vercel Function이 없어 Preview URL이
플랫폼의 `404 NOT_FOUND`를 반환합니다. `.github/actions/vercel-deploy/action.yml`에서
`vercel build`를 호출할 때만 다음 환경 변수를 주입해 Nitro가 Vercel preset을 선택하도록 합니다.

```sh
VERCEL=1 VERCEL_ENV="$DEPLOYMENT_ENVIRONMENT" vercel build --token="$VERCEL_TOKEN"
```

정상 빌드에서는 `[nitro:vercel]` 로그와 `.vercel/output/functions/__server.func`가 생성되어야
합니다. Vercel 프로젝트 설정은 Framework Preset을 `TanStack Start`, Root Directory를
`apps/admin`으로 두고 Output Directory override는 비워 둡니다. `.output`을 Output Directory로
지정하면 정적 출력으로 처리되어 같은 문제가 재발할 수 있습니다. 자세한 preset 자동 감지
동작은 [Vercel의 TanStack Start 배포 문서](https://vercel.com/docs/frameworks/full-stack/tanstack-start)를
참고합니다.

## 모바일 셸

Expo 앱은 WebView 셸입니다. 기기에서 불러올 웹 주소를 `MOBILE_WEB_URL`로 설정합니다.
로컬 개발 환경에서는 Metro 호스트의 `3000` 포트를 기본값으로 사용합니다. 네이티브 셸은
타입이 지정된 앱 브리지를 통해 현재 안전 영역 여백을 주입하며, 웹 앱은 이를
`--safe-area-inset-*` CSS 변수로 제공합니다.

네이티브 `ios` 및 `android` 디렉터리는 의도적으로 커밋하지 않습니다. 네이티브 빌드가
필요할 때만 다음 명령으로 생성합니다.

```sh
pnpm --filter @yapp-plus/mobile prebuild
```

Kakao 로그인, 푸시 알림, 운영 앱 식별자, URL scheme, EAS 프로젝트 설정은 이후 작업으로
미뤄 두었습니다.

## API 생성

임시 OpenAPI 문서는 커밋하지 않습니다. 백엔드가 OpenAPI 문서를 제공하면 다음 명령으로
Ky 2 클라이언트, TypeScript SDK, Zod 4 스키마, TanStack Query 헬퍼를 생성합니다.

```sh
OPENAPI_INPUT=https://api.example.com/openapi.json \
  pnpm --filter @yapp-plus/api generate
```

SDK 요청 및 응답 검증은 기본적으로 비활성화되어 있습니다. Hey API의 Zod validator 연동을
활성화하려면 같은 명령에 `HEY_API_SDK_VALIDATION=true`를 설정합니다.

## Spec Kit

Spec Kit `1.0.4`는 저장소 루트에 Codex 스킬과 함께 한 번 초기화되어 있습니다. Git 확장
기능은 설치하지 않았으므로 Spec Kit은 Conductor 워크스페이스 브랜치를 관리하지 않습니다.
