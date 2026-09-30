# 구현 계획: Seed Design 기반 웹 UI 전환

**브랜치**: `feat/seed-design` | **작성일**: 2026-09-28 | **명세**: [spec.md](./spec.md)  
**이슈**: [#28](https://github.com/YAPP-admin/yapp-plus-frontend/issues/28)  
**상태**: 1~6단계 완료·승인. 7단계 결과 리뷰 승인·브라우저 수동 검증 미완료.
8단계 문서 정리 완료·최종 리뷰 대기.

## 요약

설치된 공식 `seed-design` 스킬을 기준으로 공용 ActionButton, Seed 토큰과 시스템 테마를
web·admin·Storybook에 적용한다. 화면 구조와 동작은 보존하고 vanilla-extract는 배치와
반응형 스타일에 유지한다. web·admin은 공용 Manual 스크립트를 사용하고 Storybook은 Vite plugin을
사용한다.

## 기술 맥락

| 항목           | 결정                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------- |
| 언어·실행 환경 | TypeScript 6.0.3, Node.js 24.20.0, pnpm 12.3.4                                                  |
| 앱             | React 19.2.8, Next.js 16.3.4/Turbopack, TanStack Start 1.168.50/Vite 8.2.2                      |
| UI 도구        | vanilla-extract, Storybook 10.6.0                                                               |
| 추가 버전      | Seed React 2.5.0, CSS 2.8.3, Vite plugin 2.1.0, CLI 1.7.0                                       |
| 검증           | Vitest 5, Testing Library, happy-dom, Oxfmt, Oxlint, TypeScript, Turbo                          |
| 저장 상태      | DB·API·브라우저 영속 저장소 변경 없음                                                           |
| 대상           | 일반 웹 브라우저, 기존 모바일 WebView의 웹 콘텐츠, Storybook preview                            |
| 성능 기준      | 앱별 base.css 1회 로딩, 사용 컴포넌트 recipe CSS 자동 포함, 최초 테마에 추가 네트워크 요청 없음 |
| 제약           | 공식 스니펫 기반 React 19 적용, 공용 진입점 사용, 단계별 리뷰, 기존 safe-area 보존              |

## 원칙 점검

`.specify/memory/constitution.md`는 아직 미작성 템플릿이다. 이를 프로젝트의 확정된 규칙으로
간주하거나 이번 작업에서 임의로 완성하지 않는다. 사용자 지침과 `AGENTS.md`를 적용한다.

- 연구 전·설계 후 모두 앱 간 import 없이 공용 패키지의 공개 진입점을 사용한다.
- 공통 외부 버전은 catalog에, 내부 의존성은 `workspace:*`에 선언한다.
- UI의 Seed 의존성은 peer+dev, 소비 앱의 설치와 CSS는 앱 책임이다.
- 요청한 ActionButton과 필수 종속 스니펫만 추가한다. 새 스타일 도구·테마 라이브러리는 없다.
- API·브리지·배포·네이티브 설정을 바꾸지 않는다. 공용 UI 복구 절차를 아래에 명시한다.
- 버튼 테스트는 userEvent를 사용해 공개 API를 직접 조작한다. 가상의 저장 기능이나 비동기 업무 흐름은 만들지 않는다.
  공식 테마 연결은 산출물과 실제 소비 환경에서 확인하며 외부 패키지 내부 로직을 복제해 단위 테스트하지 않는다.
- 이슈 #28이 생성되어 있다. 각 단계 종료 시 결과를 보고하고 다음 승인 전 멈춘다.

## 프로젝트 구조

### 설계 산출물

```text
specs/005-seed-design/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── validation.md
├── contracts/ui.md
├── checklists/requirements.md
└── tasks.md
```

### 제품 변경 위치

```text
pnpm-workspace.yaml                     # Seed 공통 버전
pnpm-lock.yaml                          # 설치 결과
packages/ui/
├── package.json                        # peer/dev, 공개 진입점
├── seed-design.json                    # 스니펫 설정
└── src/
    ├── seed-design/ui/                  # 공식 CLI 스니펫
    ├── action-button.test.tsx           # 새 공용 버튼 계약 검증
    ├── seed-theme.ts                    # web·admin 공용 Manual 테마 문자열
    ├── global.css.ts                   # Seed 토큰을 사용하는 앱 공통 기본 스타일
    └── index.ts                        # ActionButton 공개
apps/web/src/app/                       # HTML head, CSS 로딩, 홈 스타일
apps/admin/src/routes/                  # HTML head, CSS 로딩, 헤더·대시보드 스타일
apps/storybook/.storybook/              # preview CSS, Vite plugin 테마
apps/storybook/stories/                 # ActionButton 상태 사례
README.md                              # 개발자 사용법
```

`packages/ui`는 소스를 직접 export한다. 별도 dist 빌드를 추가하지 않는다. 사용하지 않게 되는
button 구현·CSS·기존 테스트와 theme 계약 파일은 소비자 이전이 완료된 6단계에서 제거한다.

## 단계별 구현과 리뷰 경계

| 사용자 단계 | 범위                             | 완료·검증                                     | 리뷰 상태      |
| ----------- | -------------------------------- | --------------------------------------------- | -------------- |
| 1           | 브랜치·도구·기존 설치            | Node/pnpm 버전, frozen lockfile 설치, check   | 완료·승인      |
| 2           | 이슈                             | #28 제목·본문·메타데이터 재조회               | 완료·승인      |
| 3           | 공식 스킬 설치                   | 설치 파일 18개, skills-lock.json, check       | 완료·승인      |
| 4           | 명세·연구·계약·작업 목록         | 문서 정합성·체크리스트·check                  | 완료·승인      |
| 5           | 의존성·스니펫·ActionButton 추가  | compat, 버튼 테스트, check·build              | 완료·승인      |
| 6           | 소비 앱·토큰·테마·Storybook 전환 | 공식 테마 연결, 기존 화면 테스트, check·build | 완료·승인      |
| 7           | 통합 검증                        | 품질 게이트·산출물 통과, 수동 제한 기록       | 결과 승인      |
| 8           | README·결과 문서                 | 문서 재현성·변경 범위 최종 확인               | 완료·리뷰 대기 |

### 5단계 — 공용 UI 구성

- catalog에 React 2.5.0, CSS 2.8.3을 고정하고 모든 소비 패키지의 의존성을 정렬한다.
- UI peer 범위는 React `^2.5.0`, CSS `^2.8.3`으로 제한하고 dev는 catalog를 사용한다.
- `seed-design.json`은 React, TSX, RSC, `./src/seed-design`, telemetry false로 설정한다.
- CLI 1.7.0으로 ActionButton과 loading-indicator·progress-circle 종속 스니펫을 생성한다.
- 새 ActionButton을 공개하고 동작 테스트를 추가한다. CLI 실행 후 peer/dev 의존성 선언이 유지되는지 확인한다.
- 단계 사이의 앱 파손을 막기 위해 기존 Button·theme·전역 스타일을 이 단계까지 유지한다.
  호환 래퍼는 새로 만들지 않으며 기존 API의 최종 제거 시점만 6단계로 정한다.

### 6단계 — 전체 소비자 전환

- 앱에서 `@seed-design/css/base.css`를 한 번 import하고 기존 앱 공통 기본 스타일을 뒤에 연결한다.
- 자체 테마를 Seed 공개 토큰으로 전환한다. 제품 레이아웃 크기·safe-area·반응형 구조는 유지한다.
- web·admin 문서 head에는 `@yapp-plus/ui/seed-theme`에서 가져온 공식 Manual의 시스템 테마 문자열을
  넣는다. Storybook은 `seedDesignPlugin()`이 preview iframe head에 스크립트와 color-scheme 메타를 주입한다.
- HTML의 `data-seed`, 시스템 모드, 초기 light 속성과 `color-scheme`을 설정한다. 실행 시 감지 결과와
  변경 이벤트로 light/dark를 갱신한다. 브라우저 기능의 존재를 확인하고 실패 시 light로 복구한다.
- 클라이언트 초기화 전용 React provider나 useEffect는 추가하지 않는다. HTML 속성의 의도된 차이만
  hydration 예외로 제한하며 하위 화면 전체의 경고를 숨기지 않는다.
- Storybook의 기존 버튼 사례를 새 API로 전환하고 테마·상태 사례를 갱신한다.
- 모든 소비자를 옮긴 뒤 Button·ButtonProps·기존 theme export와 불필요한 구현을 제거한다.

세부 인터페이스와 토큰 전환 기준은 [계약](./contracts/ui.md)을 따른다.

## 검증과 복구

[quickstart.md](./quickstart.md)의 시나리오와 명령을 실행한다. 검증 결과는 실제 실행 후에만
완료로 기록하며 캐시 활용과 수동 검증 제한을 구분한다. 모바일 변경이 없어 expo:doctor는 제외한다.

공용 UI·소비 앱·catalog·lockfile은 함께 적용·복구하는 단위다. 미커밋 단계에서는 이번 작업의
파일 변경만 역적용하며 사용자 변경은 보존한다. 향후 통합 후에는 해당 변경 단위의 revert와
이전 lockfile 설치로 복구하고 check·build로 확인한다. 사용자 요청에 따라 완료된 3단계와 4단계는
각각 `454ddae`, `772914e`로 커밋했다. 5단계도 구현 `b211b28`, 리뷰 문서 `90a19cb`로 나눠 커밋했다.
6단계는 구현 `0220a14`, 결과 문서 `57ee25e`로 나눠 커밋했다. push·PR·배포·revert는 실행하지 않았다.

### 5단계 검증 결과

- catalog와 네 워크스페이스 설치본에서 React 2.5.0 / CSS 2.8.3을 확인했다.
- `pnpm install --frozen-lockfile` 통과. 공급망 보호 예외는 추가하지 않았다.
- 최초 생성 시 공식 스니펫 3개의 registry 원문 일치를 확인했다. 이후 사용자 리뷰에 따라 React 19의 ref prop과 저장소 코드 스타일을 적용했다.
- ActionButton 테스트는 가상 저장 예시를 제거하고 userEvent 기반 공용 계약 4개로 정리했다. 기존 Button 테스트와 함께 5개가 통과했다.
- `node --run check` 통과. lint·typecheck는 각각 7개 작업 중 3개, test는 4개 중 1개가 캐시였다.
- 직전 React 19 코드 수정 후 `node --run build` 통과. web·admin·Storybook 3개 모두 캐시 없이 빌드했다.
  이번 테스트·문서 정리에서는 제품 코드·빌드 설정을 바꾸지 않아 빌드를 재실행하지 않았다.
  Storybook에서 500 kB 초과 chunk 경고가 있었으며 빌드 실패는 없었다.
- userEvent 키보드 검증과 별개로 실제 브라우저 화면·키보드·스크린 리더·터치 검증은 7단계에서
  시도하며, 실행하지 못한 항목은 완료로 표시하지 않는다.

### 6단계 검증 결과 — 2026-09-30

- 기존 web·admin 테스트가 제목·문구·빈 상태를 검증하므로 중복 테스트를 추가하지 않았다.
- web·admin은 공용 UI가 제공하는 공식 Manual 스크립트를 사용하고 Storybook은 Vite plugin 2.1.0을 사용한다.
  TanStack Start SSR 응답에는 Vite HTML transform이 적용되지 않는 것을 dev와 build에서 확인해 admin의
  효과 없는 plugin 연결을 제거했다. 공식 로직을 복제한 테스트 6개도 리뷰 의견에 따라 제거했다.
- `node --run check` 통과. UI의 userEvent 기반 버튼 테스트 4개와 web·admin 기존 테스트도 통과했다.
  lint·typecheck는 각각 7개 중 3개, test는 4개 중 1개 작업이 캐시였다.
- `node --run build` 통과. web·admin·Storybook 3개 모두 캐시 없이 빌드했다.
  Storybook의 500 kB 초과 chunk 경고는 남아 있다.
- web·admin 프로덕션 산출물에서 Manual 스크립트와 `data-seed-color-mode="system"` 속성을 확인했다.
  Storybook iframe 산출물에서는 Vite plugin이 주입한 스크립트와 color-scheme 메타를 확인했다.
- 소스에서 옛 Button·ButtonProps·theme import를 제거했고 웹 safe-area와 라우트·페이지 콘텐츠를 유지했다.
- 브라우저로 로컬 화면을 열려 했으나 관리자 정책 확인 불가로 보안 검사에서 접근이 거부됐다.
  우회하지 않았다. 실제 렌더링·초기 테마·hydration·반응형·키보드·스크린 리더·터치는 미검증이다.
  이 제한은 7단계에서도 이어져 [검증 결과](./validation.md)에 미완료 항목으로 기록했다.

### 7단계 검증 결과 — 2026-09-30

- CLI compat, frozen lockfile 설치, 의존성 단일 버전 확인, `node --run check`와
  `node --run build`가 통과했다.
- web·admin·Storybook 개발 및 프로덕션 응답과 산출물에서 base CSS, Seed 토큰, Manual 스크립트와
  Vite plugin 주입 결과를 확인했다.
- ActionButton userEvent 테스트와 기존 web·admin·app-bridge 회귀 테스트가 통과했다.
- 관리자 정책으로 localhost 브라우저 연결이 거부되어 실제 테마 변경, hydration 콘솔, 반응형,
  터치와 스크린 리더 검증은 완료하지 못했다. 자동 검증과 수동 검증의 판정은
  [validation.md](./validation.md)에 구분했다.

## 복잡성 기록

새 패키지 계층은 없다. 공식 스니펫 원문을 유지하려고 추가했던 포맷·interface/type 규칙 예외는
사용자 리뷰 후 제거했다. 세 스니펫 모두 저장소 기본 포맷·lint·타입 검증을 따른다. 초기 구현 계획의 API 즉시 제거를 6단계로 늦추어 리뷰 중간에도
기존 소비자가 작동하게 한다. 최종 API와 제품 범위는 바뀌지 않는다.
