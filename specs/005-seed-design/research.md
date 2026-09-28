# 연구 기록: 공식 Seed 스킬을 적용한 설계 결정

**확인일**: 2026-09-28  
**입력**: 설치된 `.agents/skills/seed-design/SKILL.md`, 사용자 확정 사항, 현재 저장소 구조

## 1. 플랫폼과 대상

- **결정**: 플랫폼 구현 요청으로 분류하고 React를 적용한다. 대상은 공용 UI와 web·admin·Storybook이다.
- **근거**: 사용자가 웹 전체 적용을 선택했고 세 소비자는 React 기반이다. 설치된 스킬의 플랫폼 판별과
  공용 라이브러리·프로젝트 설정 규칙을 검토했다.
- **비교**: Lynx·Expo 네이티브는 이번 요청 대상이 아니다. 루트에 하나의 스니펫 설정을 두는 대신
  실제 스니펫 소유자인 `packages/ui`에 설정을 둔다.
- **조회 시작점**: [전체 인덱스](https://seed-design.io/llms.txt),
  [React 인덱스](https://seed-design.io/react/llms.txt),
  [Foundations 인덱스](https://seed-design.io/foundations/llms.txt).

## 2. 패키지 버전과 소유권

- **결정**: React 2.5.0 / CSS 2.8.3 / CLI 1.7.0을 사용한다. UI는 React `^2.5.0`, CSS `^2.8.3`을
  peer로 선언하고 개발 설치는 catalog 정확 버전을 사용한다. 소비 앱도 catalog 버전을 설치한다.
- **근거**: React 2.5.0의 실제 CSS peer는 `^2.8.0`, React/ReactDOM peer는 `>=18.0.0`이다.
  CSS 2.8.3과 현재 React 19.2.8은 이 조건에 맞는다. 공용 UI peer 하한은 이번에 검증할 버전으로 제한한다.
- **비교**: UI runtime dependency에 Seed를 중복 소유하거나 검증하지 않은 1.x를 허용하지 않는다.
  소스 제공 패키지이므로 새로운 library dist·external 설정은 추가하지 않는다.
- **근거 링크**: [React 2.5.0 metadata](https://registry.npmjs.org/@seed-design/react/2.5.0),
  [CSS 2.8.3 metadata](https://registry.npmjs.org/@seed-design/css/2.8.3),
  [CLI 1.7.0 metadata](https://registry.npmjs.org/@seed-design/cli/1.7.0),
  [Library Authors](https://seed-design.io/react/getting-started/library-authors).

## 3. CSS 로딩

- **결정**: 각 앱에서 `@seed-design/css/base.css`만 전역 Seed CSS로 한 번 import한다.
- **근거**: 실제 CSS 2.8.3의 `recipes/action-button.mjs`는 `./action-button.css`를 import한다.
  React 2.5.0 ActionButton이 해당 recipe를 사용하므로 컴포넌트 CSS는 함께 포함된다.
- **비교**: Manual 문서의 all.css 예제는 전체 스타일을 가져오는 선택지다. 이번 버전에서는
  base.css와 recipe 자동 로딩을 사용하므로 all.css·개별 컴포넌트 CSS·Seed 플러그인을 중복 추가하지 않는다.
  Next.js의 Turbopack을 Webpack으로 전환하지 않는다.
- **근거 링크**: [Manual](https://seed-design.io/llms/react/getting-started/installation/manual.txt),
  [Library Authors](https://seed-design.io/react/getting-started/library-authors), 위 패키지 배포본.

## 4. 공식 스니펫과 RSC

- **결정**: 설정은 `framework: react`, `tsx: true`, `rsc: true`, `path: ./src/seed-design`,
  `telemetry: false`다. ActionButton, loading-indicator, progress-circle 세 스니펫을 사용한다.
- **근거**: 레지스트리에서 ActionButton→loading-indicator→progress-circle 의존 관계를 확인했다.
  세 파일은 React/CSS `^2.0.0`을 요구하고 서로 상대 import한다. RSC 설정은 기존 use client를 보존한다.
- **비교**: 앱마다 스니펫을 복제하거나 사용하지 않는 컴포넌트를 add-all로 설치하지 않는다.
  이 구성은 별도 alias가 필요 없고 앱은 `@yapp-plus/ui` 공개 진입점을 사용한다.
- **근거 링크**: [Configuration](https://seed-design.io/llms/react/getting-started/cli/configuration.txt),
  [ActionButton registry](https://seed-design.io/__registry__/react/ui/action-button.json),
  [LoadingIndicator registry](https://seed-design.io/__registry__/react/ui/loading-indicator.json),
  [ProgressCircle registry](https://seed-design.io/__registry__/react/ui/progress-circle.json).

CLI 1.7.0의 문서와 실제 소스에서 다음 명령을 확인했다. compat의 `-c`는 cwd가 아니므로 긴 옵션을 쓴다.

```sh
pnpm dlx @seed-design/cli@1.7.0 add ui:action-button --cwd packages/ui
pnpm dlx @seed-design/cli@1.7.0 compat --cwd packages/ui
```

[Commands](https://seed-design.io/llms/react/getting-started/cli/commands.txt)에 따라 compat는
설치된 스니펫 호환 문제에 실패 코드를 반환한다. 이 연구 단계에서는 설치나 compat를 실행하지 않았다.

## 5. 시스템 테마와 서버 렌더링

- **결정**: 공용 스크립트 문자열을 각 문서 head에서 최초 표시 전에 실행한다. 시스템 설정을 읽고
  Seed의 사용자 색상 속성을 갱신하며 변경 이벤트도 반영한다. 감지 실패 시 light를 사용한다.
- **근거**: 공식 테마는 HTML의 정책과 사용자 색상 속성으로 제어된다. SSR은 시스템 설정을 모르므로
  브라우저 초기화가 필요하다. 문서마다 같은 자체 완결 스크립트를 사용해 동작 차이를 줄인다.
- **비교**: useEffect로 늦게 적용하는 방식, 별도 ThemeProvider, localStorage와 테마 선택 UI는 추가하지 않는다.
  폰트·테마 초기화에 새로운 원격 요청을 만들지 않는다.
- **근거 링크**: [Theming](https://seed-design.io/llms/react/getting-started/styling/theming.txt),
  [Manual](https://seed-design.io/llms/react/getting-started/installation/manual.txt).

## 6. 공개 토큰과 기존 API 전환

- **결정**: `@seed-design/css/vars`의 `vars.$color`, `vars.$dimension`, `vars.$fontSize`,
  `vars.$lineHeight`, `vars.$fontWeight`를 사용한다. 자체 theme 계약을 제거한다.
- **근거**: CSS 2.8.3의 exports와 타입 선언에서 공개 경로 및 토큰 존재를 확인했다.
  기존 Button의 실제 소비자는 Storybook이고 기존 theme은 web·admin 스타일이 사용한다.
- **비교**: Seed 내부 component vars를 새 공용 API로 노출하지 않는다. 토큰 값을 복제하거나
  광범위한 재export 계층을 만들지 않는다. 자세한 사용처 매핑은 [계약](./contracts/ui.md)에 기록한다.
- **근거 링크**: [Typography](https://seed-design.io/llms/foundations/typography.txt),
  [Spacing](https://seed-design.io/llms/foundations/spacing.txt), 위 CSS 배포본과 Library Authors.

공식 React 2.5.0·primitive 2.0.1 배포본에는 기본 `type="button"` 지정이 없다. 기존 자체 버튼은
기본값을 지정했으므로 비제출 소비처와 Storybook args에서 이를 명시해 동작을 유지한다.
CSS 2.8.3의 size 타입은 xsmall·small·medium·large이며 기본 medium이다. 기존 small·medium을 그대로 쓴다.

## 7. 단계별 리뷰와 이전 순서

- **결정**: 5단계는 새 API 추가와 단위 검증, 6단계는 소비자 전환·기존 API 제거를 함께 한다.
- **근거**: 사용자가 단계마다 리뷰 후 진행을 요청했다. 공용 export를 먼저 제거하면 다음 단계 승인 전
  기존 Storybook과 앱을 빌드할 수 없게 된다.
- **비교**: 장기 호환 래퍼나 예전 API 유지는 필요 없다. 6단계 종료 시 완전히 제거한다.

## 조회 제한과 연구 완료

공식 library-authors의 인덱스 txt 링크는 일부 조회에서 403을 반환해 같은 문서의 HTML로 확인했다.
레지스트리도 일반 HTTP 조회로 본문을 확인했다. npm 배포본은 메모리에서 읽어 분석했으며
이번 단계에서 Seed runtime 패키지는 설치하지 않았다. 현재 설계에 남은 미확정 계약은 없다.
