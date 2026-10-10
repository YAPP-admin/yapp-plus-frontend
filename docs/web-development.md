# 웹 작업 가이드

`apps/web`에서 화면을 작성하는 디자이너·개발자·AI를 위한 가이드입니다. 제품 목적과 대상은
[제품 맥락](./mission.md), 설치·실행과 기술 구성은 [README](../README.md)를 참고합니다.

## 적용 상태

현재는 **폴더 규칙 검토 단계**입니다. 아래는 적용할 목표 구조이며 아직 파일을 이동하지
않았습니다. 현재 홈·문서 레이아웃·스타일·테스트는 `apps/web/src/app`에 있습니다.
다음 단계에서 기존 홈을 정리한 뒤 이 절과 예시를 실제 구조에 맞게 갱신합니다.

적용 대상은 사용자 웹 앱입니다. 관리자·모바일 앱의 폴더 구조를 이 문서에 맞춰 변경하지
않습니다.

## 선택적으로 적용하는 FSD

FSD의 `app`, `pages`, `features`, `shared`를 사용합니다. 화면 단위로 작업을 시작하고 실제
재사용이 확인되면 분리합니다. `widgets`, `entities`는 도입하지 않습니다.

| 위치                           | 역할                                                           |
| ------------------------------ | -------------------------------------------------------------- |
| `apps/web/app`                 | Next.js 라우트, 문서 레이아웃, 메타데이터 등 프레임워크 진입점 |
| `apps/web/src/app`             | Provider, 전역 초기화와 스타일 연결                            |
| `apps/web/src/pages/<화면>`    | 화면과 해당 화면에서만 사용하는 코드                           |
| `apps/web/src/features/<기능>` | 여러 화면에서 재사용하는 사용자 행동                           |
| `apps/web/src/shared`          | 웹 내부에서 공유하는 도메인 비의존 코드                        |
| `packages/ui`                  | SEED 기반 공용 UI와 스타일·폰트·테마 계약                      |
| `packages/api`                 | 공용 API 계약과 클라이언트                                     |
| `packages/app-bridge`          | WebView와 네이티브 사이의 브리지 계약                          |

`pages/home`처럼 하나의 화면이나 기능을 묶는 폴더를 **슬라이스**라고 합니다.
슬라이스 안에서는 `ui`, `model`처럼 코드의 역할에 따라 폴더를 나눕니다.
`app`과 `shared`는 화면별 슬라이스를 만들지 않고 역할별로 구성합니다.

### 목표 구조

```text
apps/web/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── pages/
│   └── README.md
└── src/
    ├── app/
    │   ├── providers.tsx
    │   └── global.css.ts
    └── pages/
        └── home/
            ├── index.ts
            └── ui/
                ├── home-page.tsx
                ├── home-page.css.ts
                └── home-page.test.tsx
```

루트의 `app`은 Next.js가 URL과 연결하는 위치이고, `src/app`은 앱의 전역 구성을 담당합니다.
라우트의 `page.tsx`는 `src/pages`의 화면을 연결하고 화면 구현은 해당 슬라이스에 둡니다.

`apps/web/pages/README.md`는 Next.js가 `src/pages`를 Pages Router로 인식하지 않도록 루트
`pages` 폴더를 유지하는 이유를 설명합니다. 이 폴더에는 Pages Router 라우트를 추가하지 않습니다.

`features`와 `shared`는 실제 사용처가 생길 때 생성합니다. 빈 레이어·역할별 폴더·슬라이스 그룹을
미리 만들지 않습니다.

## 파일을 어디에 둘지 결정하기

새 화면은 `pages/<화면>/ui`에서 시작합니다. 화면 전용 카드·섹션·폼도 같은 `ui`에 둡니다.
화면이 길어져 컴포넌트 파일을 나누는 것만으로 새 feature가 필요해지지는 않습니다.

| 작성할 코드                            | 배치 기준                                        |
| -------------------------------------- | ------------------------------------------------ |
| 화면과 화면 전용 컴포넌트              | 해당 페이지의 `ui`                               |
| 컴포넌트 스타일                        | 컴포넌트 옆의 `.css.ts`                          |
| 컴포넌트 테스트                        | 대상 파일 옆의 `.test.tsx`                       |
| 화면·기능 전용 상태, 타입, 샘플 데이터 | 해당 슬라이스의 `model`                          |
| 순수 계산·변환 함수                    | 해당 슬라이스의 `lib`                            |
| 화면·기능 전용 API 연결                | 해당 슬라이스의 `api`, 기존 공용 클라이언트 사용 |
| 슬라이스 전용 설정                     | 필요한 경우 해당 슬라이스의 `config`             |

다른 화면에서도 같은 사용자 행동을 재사용하면 `features/<기능>`으로 분리합니다. 예를 들어
사전 출결보고를 여러 화면에서 같은 흐름으로 사용하게 되면 feature로 분리할 수 있습니다.
이는 배치 판단을 위한 예시이며 해당 기능을 지금 추가한다는 뜻은 아닙니다.

도메인에 의존하지 않는 코드가 웹 내부에서 반복되면 `shared/ui`, `shared/lib` 등 해당 역할에
배치합니다. 특정 화면이나 사용자 행동을 알아야 동작하는 코드를 단지 여러 곳에서 쓴다는 이유로
`shared`에 넣지 않습니다.

앱을 넘어 공유하는 코드는 루트 [작업 지침](../AGENTS.md#모노레포-경계)의 공용화 기준을 따릅니다.
기존 SEED 컴포넌트와 공용 API·브리지 코드는 각 패키지의 공개 진입점으로 사용하고 웹의
`shared`에 복제하지 않습니다.

## import와 공개 진입점

의존성은 `app → pages → features → shared` 방향으로 흐릅니다. 상위 레이어는 필요한 하위
레이어를 직접 사용할 수 있습니다. 페이지에서 `shared`를 쓰기 위해 빈 feature를 만들 필요는
없습니다. 루트 Next.js 라우트는 `src/app`의 전역 구성과 `src/pages`의 화면을 연결합니다.

- `pages`·`features`에서 같은 레이어의 다른 슬라이스를 직접 import하지 않습니다.
  서로 다른 슬라이스를 조합해야 하면 상위 레이어에서 조합합니다.
- 슬라이스 외부에서는 해당 슬라이스의 `index.ts`를 사용합니다. `ui`·`model` 내부 파일을
  직접 import하지 않습니다.
- 같은 슬라이스 안에서는 상대 경로를 사용합니다. 자신의 `index.ts`를 거쳐 다시 가져오지 않습니다.
- `index.ts`는 외부에서 필요한 컴포넌트·타입만 명시적으로 export합니다. `export *`로 내부를
  모두 공개하지 않습니다.
- 클라이언트에서 사용하는 진입점에 서버 전용 모듈을 섞지 않습니다. 둘을 함께 제공해야 할 때만
  서버 전용 진입점을 분리합니다.
- `app`·`shared`의 역할별 모듈은 순환 참조 없이 조합할 수 있습니다. `shared` 전체를 묶는 배럴은
  만들지 않고 필요한 모듈 경로로 가져옵니다.
- 다른 앱의 코드를 직접 import하지 않습니다. 패키지는 `@yapp-plus/ui`처럼 공개 진입점을 사용합니다.

다음은 홈을 이동한 뒤의 연결 예시입니다. 기존 `@/*` alias는 `apps/web/src/*`를 가리킵니다.

```tsx
// apps/web/app/page.tsx
export { HomePage as default } from '@/pages/home';
```

```ts
// apps/web/src/pages/home/index.ts
export { HomePage } from './ui/home-page';
```

슬라이스 내부의 `home-page.tsx`에서는 인접한 스타일을 `./home-page.css`로 가져옵니다.

## 명명과 스타일

- 파일·폴더는 `home-page.tsx`, `report-attendance`처럼 kebab-case로 작성합니다.
- 컴포넌트는 `HomePage`처럼 PascalCase, 훅은 `use` 접두사로 작성합니다.
- 일반 컴포넌트는 named export를 사용합니다. Next.js가 요구하는 라우트 진입점에서는
  프레임워크 규칙에 따라 default export를 사용합니다.
- 스타일은 기존 vanilla-extract와 SEED 토큰을 사용합니다. 새 스타일 도구나 자체 디자인 토큰
  체계를 추가하지 않습니다.

## 참고 자료

- [선택적 FSD 구성 참고 저장소](https://github.com/YAPP-Github/28th-Web-Team-4-FE/blob/main/docs/architecture.md)
- [FSD의 Next.js 연동 가이드](https://fsd.how/kr/docs/guides/tech/with-nextjs/)

위 자료를 바탕으로 이 저장소의 모노레포와 SEED 구성에 맞춰 규칙을 정했습니다.
참고 저장소의 공용 UI·API 배치를 그대로 복사하지 않습니다.
