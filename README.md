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
