# 관리자 앱 작업 가이드

`apps/admin`에서 관리자 화면을 작성할 때 적용하는 선택적 FSD 가이드입니다. 제품 목적과
운영진의 역할은 [제품 맥락](./mission.md), 저장소 전체 규칙은 [루트 작업 지침](../AGENTS.md),
사용자 웹 앱의 규칙은 [웹 작업 가이드](./web-development.md)를 참고합니다.

## 적용 범위

관리자 앱은 TanStack Start의 파일 기반 라우팅을 사용합니다. `src/routes`는 라우터가
탐색하고 생성 파일이 참조하는 프레임워크 경계이므로 라우트 파일을 FSD 레이어로 옮기지
않습니다. 라우트 파일은 URL·head·레이아웃을 연결하고, 화면 UI는 FSD 슬라이스에서 가져옵니다.

이번 적용 대상은 기존 로그인과 대시보드입니다. API·인증 정책·관리자 기능의 동작은 변경하지
않습니다. `entities`와 `widgets`는 도입하지 않으며, `features`와 `shared`는 실제 사용처가
생겼을 때만 만듭니다.

로그인과 대시보드의 화면 구현·스타일·테스트를 `pages`로 옮겼습니다. route 파일은 URL·head와
라우터 연결만 담당합니다.

## 현재 구조와 목표 구조

```text
apps/admin/src/
├── providers.tsx              # TanStack Start 앱 Provider 진입점
├── router.tsx                 # routeTree 연결 진입점
├── routes/                    # TanStack Router 진입점·레이아웃 어댑터
│   ├── __root.tsx
│   ├── _dashboard.tsx
│   ├── _dashboard.index.tsx
│   └── login.tsx
├── pages/
│   ├── dashboard/
│   │   ├── index.ts
│   │   └── ui/
│   └── login/
│       ├── index.ts
│       └── ui/
├── features/
│   └── login/                 # 로그인 폼·검증·로그인 동작
└── shared/                    # 도메인 비의존 코드가 반복될 때만 생성
```

현재 `routes/_dashboard.index.tsx`의 화면 구현과 스타일·테스트는 `pages/dashboard`,
`routes/login.tsx`의 화면 연결은 `pages/login`으로 옮겼습니다. `routes/_dashboard.tsx`의
레이아웃은 여러 관리자 route에서 실제로 공유할 때 `app/ui`로 분리합니다.

`providers.tsx`와 `router.tsx`는 TanStack Start와 생성된 `routeTree.gen.ts`가 기대하는 앱
진입점이므로 현재 위치를 유지합니다. 공통 관리자 셸이 생기면 `app/ui`를 만들고 route
레이아웃 어댑터에서 조합합니다.

## 레이어와 배치 기준

| 위치              | 역할                                                   |
| ----------------- | ------------------------------------------------------ |
| `app`             | Provider, Router 연결, 여러 route가 공유하는 관리자 셸 |
| `pages/<화면>`    | 한 관리자 화면의 조합과 화면 전용 UI                   |
| `features/<기능>` | 여러 화면에서 재사용하는 사용자 행동과 상태            |
| `shared`          | 관리자 도메인에 의존하지 않는 UI·유틸리티              |
| `routes`          | TanStack Router의 경로·head·Outlet 연결만 담당         |

화면 전용 카드·섹션·스타일·테스트는 해당 `pages/<화면>`에 둡니다. 로그인 입력과 제출,
검증, 오류 표현처럼 여러 로그인 화면에서 재사용할 사용자 행동은 `features/login`에 둡니다.
단순히 파일이 길다는 이유로 feature를 만들지 않습니다.

의존성 방향은 `app → pages → features → shared`입니다. `pages`와 `features`의 다른
슬라이스를 직접 import하지 않으며, 슬라이스 외부에서는 `index.ts`의 공개 export를 사용합니다.
TanStack Router의 생성 파일인 `src/routeTree.gen.ts`는 직접 수정하지 않습니다.

## 공용 패키지와 UI

공용 UI는 `@yapp-plus/ui`, API는 `@yapp-plus/api`의 공개 진입점만 사용합니다. SEED 토큰과
기존 vanilla-extract 스타일을 사용하고 관리자 화면에 공용 컴포넌트나 토큰을 복제하지 않습니다.
새 공용 컴포넌트는 실제 소비자가 둘 이상인지 확인한 뒤 `packages/ui` 작업으로 분리합니다.

TanStack Router의 route 파일에서 페이지 슬라이스를 연결할 때는 별칭 `~/*`를 사용하고,
페이지 내부에서는 인접 파일에 상대 경로를 사용합니다.

```tsx
// apps/admin/src/routes/_dashboard.index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '~/pages/dashboard';

export const Route = createFileRoute('/_dashboard/')({ component: DashboardPage });
```

## 실행과 검증

저장소 루트에서 관리자 앱만 실행합니다.

```sh
mise exec -- pnpm --filter @yapp-plus/admin dev
```

화면 구조를 옮긴 뒤에는 다음을 실행하고 기존 로그인·대시보드의 의미 구조와 라우팅을 확인합니다.

```sh
mise exec -- pnpm --filter @yapp-plus/admin test
mise exec -- node --run check
mise exec -- node --run build
```

로그인 입력의 키보드 포커스·오류·비밀번호 필드와 대시보드의 제목·빈 상태·메뉴 링크를
브라우저에서 확인합니다. 구조 변경만으로 새로운 제품 상태나 API를 추가하지 않습니다.
