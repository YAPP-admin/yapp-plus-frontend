# 공용 UI와 소비 앱 계약

**관련 명세**: [spec.md](../spec.md)  
**적용 시점**: 5단계에서 새 API를 추가하고 6단계에서 기존 API를 제거한다.

## 1. 패키지 공개 진입점

| 진입점                     | 최종 계약                                                             |
| -------------------------- | --------------------------------------------------------------------- |
| `@yapp-plus/ui`            | 공식 스니펫의 `ActionButton`, `ActionButtonProps`를 공개한다.         |
| `@yapp-plus/ui/seed-theme` | web·admin이 공유하는 공식 Manual의 `seedThemeScript`를 공개한다.      |
| `@yapp-plus/ui/styles`     | Seed 토큰을 사용하는 앱 공통 기본 스타일. 앱이 명시적으로 import한다. |
| `@yapp-plus/ui/theme`      | 6단계에서 제거한다. 소비자는 Seed 공개 vars를 직접 사용한다.          |

앱은 공용 UI의 내부 파일에 접근하지 않는다. CSS vars나 테마 초기화가 필요한 앱은
`@seed-design/css`를 직접 의존성으로 선언한다. 공용 UI의 일반 export를 가져오는 것으로 전역
base.css를 로드하지 않는다.

### ActionButton

- props는 `ComponentProps<typeof SeedActionButton>`으로 공식 컴포넌트에서 가져온다.
  React 19에 맞게 ref를 일반 prop으로 전달하며 자체 size·variant 매핑을 추가하지 않는다.
- 기존 primary 사례는 `brandSolid`, secondary 사례는 `neutralWeak`로 전환한다.
- size는 기존 `small`·`medium` 리터럴을 그대로 사용한다. 공식 기본 size는 `medium`이다.
- children, className, HTML 버튼 속성, 이벤트와 ref는 공식 컴포넌트 계약을 따른다.
- 공식 버튼은 type 기본값을 지정하지 않는다. 비제출 소비처와 Storybook args에는 `type="button"`을 명시해
  기존 버튼의 비제출 동작을 유지한다. 래퍼에 새로운 기본값을 추가하지 않는다.
- loading은 disabled를 포함하지 않는다. 클릭을 막아야 하는 사례는 disabled도 설정한다.
- `asChild`를 기존 단순 버튼 사례에 도입하지 않는다. 기존 Button·ButtonProps는 최종적으로 제거한다.

## 2. 의존성과 스니펫 소유권

| 소유자        | 선언                                                      |
| ------------- | --------------------------------------------------------- |
| pnpm catalog  | React 2.5.0, CSS 2.8.3, Vite plugin 2.1.0 정확 버전       |
| `packages/ui` | React `^2.5.0`·CSS `^2.8.3` peer, 개발 설치는 catalog     |
| web·admin     | Seed React·CSS를 catalog 직접 의존성으로 설치             |
| Storybook     | Seed React·CSS·Vite plugin을 catalog 개발 의존성으로 설치 |

`packages/ui/seed-design.json`:

```json
{
  "framework": "react",
  "tsx": true,
  "rsc": true,
  "path": "./src/seed-design",
  "telemetry": false
}
```

CLI가 생성한 ActionButton·loading-indicator·progress-circle은 `src/seed-design/ui`가 소유한다.
상대 import를 유지하고 새로운 경로 alias를 만들지 않는다. use client와 @requires 헤더를 보존한다.
원본의 출처·요구 버전 헤더와 안내는 보존한다. 공식 스니펫은 확장을 허용하며 사용자 리뷰 요청에 따라
세 컴포넌트의 forwardRef를 제거하고 ref prop 전달과 type 별칭을 사용한다. 저장소 포맷·lint 예외는 두지 않는다.
향후 CLI로 다시 생성할 때 이 수정 사항을 비교·보존한다.

## 3. CSS와 디자인 토큰

앱 entry에서 `@seed-design/css/base.css`를 한 번 가져온 뒤 `@yapp-plus/ui/styles`를 연결한다.
컴포넌트 recipe가 자동으로 포함하는 CSS와 all.css를 중복 import하지 않는다. 기존 공통 전역 스타일은
높이, margin, box-sizing, 기존 font-family, 배경·전경 같은 앱 기본값만 소유한다.

Seed 컴포넌트의 폰트·상태 스타일을 덮는 전역 `button, input, textarea, select` 규칙은 제거한다.
컴포넌트 내부 변수는 참조하지 않는다. 아래 경로는 CSS 2.8.3의 실제 공개 타입으로 확인했다.

```ts
import { vars } from '@seed-design/css/vars';
```

| 기존 용도           | 전환 값                                        |
| ------------------- | ---------------------------------------------- |
| canvas              | `vars.$color.bg.layerBasement`                 |
| surface             | `vars.$color.bg.layerDefault`                  |
| foreground          | `vars.$color.fg.neutral`                       |
| muted               | `vars.$color.fg.neutralMuted`                  |
| line                | `vars.$color.stroke.neutralMuted`              |
| 화면 강조선         | `vars.$color.bg.brandSolid`                    |
| 링크 포커스         | `vars.$color.fg.brand`                         |
| 공간 2·3·4·6·8·12   | `vars.$dimension.x2`·`x3`·`x4`·`x6`·`x8`·`x12` |
| 제목·본문 글자 크기 | `vars.$fontSize.t1`~`t10`                      |
| 대응 행간           | `vars.$lineHeight.t1`~`t10`                    |
| 글자 굵기           | `vars.$fontWeight.regular`·`medium`·`bold`     |

기존 accentHover·surfaceHover·radius.control은 자체 버튼 제거와 함께 없앤다.
버튼의 반경과 상호작용 스타일은 Seed ActionButton이 소유한다.

타이포그래피 매핑은 다음을 기본으로 한다. 각각 대응하는 Seed 행간을 함께 사용한다.

- 웹 제목: 작은 화면 t9/bold, 기존 48rem 이상 분기에서는 t10/bold.
- 웹 설명: t5/regular. 웹·관리자 로고: t3/bold.
- 관리자 제목: t8/bold. 소개: t4/regular. 빈 상태 제목: t4/bold. 빈 상태 설명: t3/regular.
- 관리자 내비게이션: t3/medium. 링크 hover는 fg.neutral, 평소에는 fg.neutralMuted.

화면 폭·grid 구조·최대 너비·safe-area·반응형 분기는 유지한다. 새로운 폰트 파일·토큰 복제는 없다.

## 4. 시스템 테마 계약

- 앱 문서 루트는 `data-seed`, `data-seed-color-mode="system"`, 초기 `data-seed-user-color-scheme="light"`를 갖는다.
- web과 admin은 `@yapp-plus/ui/seed-theme`이 제공하는 공식 Manual의 시스템 테마 스크립트를 문서
  head에 넣고 `color-scheme: light dark` 메타를 선언한다. Next.js와 TanStack Start SSR 문서는 Vite의
  `transformIndexHtml` 대상이 아니다.
- Storybook은 Vite builder의 `viteFinal`에 `seedDesignPlugin()`을 연결한다. 플러그인이 preview iframe
  head에 시스템 테마 스크립트와 `color-scheme` 메타를 주입한다.
- Manual 스크립트와 플러그인 생성 코드는 시스템 light/dark의 초기 감지와 change 구독, 구형
  addListener를 처리한다. 감지 실패 시 문서에 선언한 초기 light 값을 유지한다.
- 공용 UI 패키지는 두 SSR 앱이 함께 사용하는 Manual 문자열만 공개한다. Vite 플러그인은 재공개하지 않는다.
- 초기 스크립트가 수정하는 문서 루트 속성 차이만 hydration 예외로 처리한다.
- 문서당 한 번 실행하고 클라이언트 라우트 이동 시 재등록하지 않는다. 별도 React state·저장소는 없다.

## 5. 테스트 경계

버튼은 공개 API에서 직접 렌더링하고 `userEvent`로 클릭·키보드·disabled 동작을 검증한다.
loading 표시는 disabled와 독립적으로 확인한다. React 19 ref 전달과 명시한 비제출 type은
최소한의 폼·포커스 이동 구성으로 확인한다. 가상 저장 컴포넌트·상태 메시지·비동기 저장 로직은 만들지 않는다.
소비 앱 테스트는 기존 화면 의미 구조를 보존하는지 확인한다. 공식 Manual 스크립트와 Vite 플러그인의
내부 구현을 프로젝트 단위 테스트로 복제하지 않는다. CSS 로딩·초기 표시·시스템 테마 변경·hydration·접근성은 web·admin·Storybook
실제 실행 환경에서 확인한다. 스니펫 내부 구현 자체를 복제하는 테스트는 없다.
