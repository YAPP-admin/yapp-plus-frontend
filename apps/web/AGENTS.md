# 웹 앱 작업 지침

이 문서는 `apps/web`에서 사용자 웹 화면을 작성할 때 적용합니다. 루트 [작업 지침](../../AGENTS.md)의
언어, 모노레포 경계, 생성 코드, 검증과 Git 규칙을 먼저 따릅니다.

## 시작 전 확인

- 제품 목적과 대상 사용자는 [제품 맥락](../../docs/mission.md)에서 확인합니다.
- 화면 배치와 import 방향은 [웹 작업 가이드](../../docs/web-development.md)에서 확인합니다.
- 화면 정책·상태·출시 범위는 제품 원문과 해당 기능 명세에서 확인합니다.
- `packages/ui`, `packages/api`, `packages/app-bridge`의 공개 진입점을 먼저 확인합니다.

확인되지 않은 제품 정책이나 API를 화면 코드에서 추측하지 않습니다. 현재 작업에 필요하지 않은
레이어와 빈 폴더를 만들지 않습니다.

## 구조와 import

```text
apps/web/
├── app/                 # Next.js App Router 진입점
├── pages/               # Pages Router 탐색 경계를 설명하는 README만 유지
└── src/
    ├── app/             # Provider, 전역 스타일과 초기화
    ├── pages/<화면>/    # 화면 슬라이스
    ├── features/<기능>/ # 실제로 여러 화면에서 재사용하는 사용자 행동
    └── shared/          # 웹 내부의 도메인 비의존 코드
```

새 화면은 `src/pages/<화면>/ui`에서 시작합니다. Next.js 라우트의 `app/<경로>/page.tsx`는
화면 슬라이스의 `index.ts`만 가져옵니다. 화면 전용 스타일·테스트·상태는 해당 슬라이스에
두고, 실제 재사용이 생겼을 때만 `features`나 `shared`로 이동합니다.

의존성 방향은 `app → pages → features → shared`입니다. 페이지와 feature 슬라이스끼리 직접
가져오지 않으며, 슬라이스 외부에서는 공개 `index.ts`를 사용합니다. 다른 앱의 내부 파일을
가져오지 않고 패키지 공개 진입점만 사용합니다.

## UI와 실행 환경

공용 UI는 `@yapp-plus/ui`, API는 `@yapp-plus/api`, WebView 기능은
`@yapp-plus/app-bridge/web`의 공개 API를 사용합니다. SEED 토큰과 vanilla-extract 스타일을
사용하고 화면 안에 공용 컴포넌트나 토큰을 복제하지 않습니다.

웹 앱은 일반 브라우저와 모바일 WebView에서 함께 실행됩니다. 브라우저 전용 전역 객체를
렌더링 중 바로 읽지 않고, safe-area·터치·키보드·라이트/다크 모드를 확인합니다. 서버 컴포넌트와
클라이언트 컴포넌트의 경계를 유지하고, 클라이언트 모듈에 서버 전용 코드를 섞지 않습니다.

## 실행과 검증

저장소 루트에서 웹만 실행합니다.

```sh
mise exec -- node --run dev:web
```

변경 후 기본 품질 게이트를 실행합니다.

```sh
mise exec -- node --run check
```

웹 라우팅·빌드 설정·배포 가능한 화면을 변경하면 빌드도 실행합니다.

```sh
mise exec -- node --run build
```

브라우저에서 핵심 문구와 접근성 이름, 가로 스크롤, safe-area와 테마를 확인하고, 화면 동작을
변경했다면 인접 테스트를 갱신합니다. `app` 라우트, `.next` 산출물과 도구 생성 파일은 직접
수정하지 않습니다.
