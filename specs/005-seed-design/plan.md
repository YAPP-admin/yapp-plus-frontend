# 구현 계획: Seed Design 기반 웹 UI 전환

**브랜치**: `feat/seed-design` | **작성일**: 2026-09-28 | **명세**: [spec.md](./spec.md)  
**이슈**: [#28](https://github.com/YAPP-admin/yapp-plus-frontend/issues/28)  
**상태**: 4단계 산출물, 사용자 리뷰 대기. 제품 코드 구현은 시작하지 않았다.

## 요약

설치된 공식 `seed-design` 스킬을 기준으로 공용 ActionButton, Seed 토큰과 시스템 테마를
web·admin·Storybook에 적용한다. 화면 구조와 동작은 보존하고 vanilla-extract는 배치와
반응형 스타일에 유지한다. 세 앱에 동일한 수동 CSS·테마 연결을 사용한다.

## 기술 맥락

| 항목           | 결정                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------- |
| 언어·실행 환경 | TypeScript 6.0.3, Node.js 24.20.0, pnpm 12.3.4                                                  |
| 앱             | React 19.2.8, Next.js 16.3.4/Turbopack, TanStack Start 1.168.50/Vite 8.2.2                      |
| UI 도구        | vanilla-extract, Storybook 10.6.0                                                               |
| 추가 버전      | Seed React 2.5.0, CSS 2.8.3, CLI 1.7.0                                                          |
| 검증           | Vitest 5, Testing Library, happy-dom, Oxfmt, Oxlint, TypeScript, Turbo                          |
| 저장 상태      | DB·API·브라우저 영속 저장소 변경 없음                                                           |
| 대상           | 일반 웹 브라우저, 기존 모바일 WebView의 웹 콘텐츠, Storybook preview                            |
| 성능 기준      | 앱별 base.css 1회 로딩, 사용 컴포넌트 recipe CSS 자동 포함, 최초 테마에 추가 네트워크 요청 없음 |
| 제약           | 외부 생성 파일 원문 보존, 공용 진입점 사용, 단계별 리뷰, 기존 safe-area 보존                    |

## 원칙 점검

`.specify/memory/constitution.md`는 아직 미작성 템플릿이다. 이를 프로젝트의 확정된 규칙으로
간주하거나 이번 작업에서 임의로 완성하지 않는다. 사용자 지침과 `AGENTS.md`를 적용한다.

- 연구 전·설계 후 모두 앱 간 import 없이 공용 패키지의 공개 진입점을 사용한다.
- 공통 외부 버전은 catalog에, 내부 의존성은 `workspace:*`에 선언한다.
- UI의 Seed 의존성은 peer+dev, 소비 앱의 설치와 CSS는 앱 책임이다.
- 요청한 ActionButton과 필수 종속 스니펫만 추가한다. 새 스타일 도구·테마 라이브러리는 없다.
- API·브리지·배포·네이티브 설정을 바꾸지 않는다. 공용 UI 복구 절차를 아래에 명시한다.
- 테스트는 공용 버튼·테마 경계에 작성하고, 화면 의미와 접근성은 실제 소비 환경에서도 확인한다.
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
    ├── theme-script.ts                 # 서버에서도 안전한 스크립트 문자열
    ├── theme-script.test.ts            # 초기 테마와 시스템 변경 검증
    ├── global.css.ts                   # Seed 토큰을 사용하는 앱 공통 기본 스타일
    └── index.ts                        # ActionButton 공개
apps/web/src/app/                       # HTML head, CSS 로딩, 홈 스타일
apps/admin/src/routes/                  # HTML head, CSS 로딩, 헤더·대시보드 스타일
apps/storybook/.storybook/              # preview CSS, previewHead 테마
apps/storybook/stories/                 # ActionButton 상태 사례
README.md                              # 개발자 사용법
```

`packages/ui`는 소스를 직접 export한다. 별도 dist 빌드를 추가하지 않는다. 사용하지 않게 되는
button 구현·CSS·기존 테스트와 theme 계약 파일은 소비자 이전이 완료된 6단계에서 제거한다.

## 단계별 구현과 리뷰 경계

| 사용자 단계 | 범위                             | 완료·검증                                   | 리뷰 상태            |
| ----------- | -------------------------------- | ------------------------------------------- | -------------------- |
| 1           | 브랜치·도구·기존 설치            | Node/pnpm 버전, frozen lockfile 설치, check | 완료·승인            |
| 2           | 이슈                             | #28 제목·본문·메타데이터 재조회             | 완료·승인            |
| 3           | 공식 스킬 설치                   | 설치 파일 18개, skills-lock.json, check     | 완료·승인            |
| 4           | 명세·연구·계약·작업 목록         | 문서 정합성·체크리스트·check                | 이번 단계, 리뷰 대기 |
| 5           | 의존성·스니펫·ActionButton 추가  | compat, 버튼 테스트, check·build            | 승인 전 실행 금지    |
| 6           | 소비 앱·토큰·테마·Storybook 전환 | 테마 테스트, 기존 화면 테스트, check·build  | 5단계 리뷰 후        |
| 7           | 통합 검증                        | 최종 품질 게이트와 브라우저·접근성 검사     | 6단계 리뷰 후        |
| 8           | README·결과 문서                 | 문서 재현성·변경 범위 최종 확인             | 7단계 리뷰 후        |

### 5단계 — 공용 UI 구성

- catalog에 React 2.5.0, CSS 2.8.3을 고정하고 모든 소비 패키지의 의존성을 정렬한다.
- UI peer 범위는 React `^2.5.0`, CSS `^2.8.3`으로 제한하고 dev는 catalog를 사용한다.
- `seed-design.json`은 React, TSX, RSC, `./src/seed-design`, telemetry false로 설정한다.
- CLI 1.7.0으로 ActionButton과 loading-indicator·progress-circle 종속 스니펫을 생성한다.
- 새 ActionButton을 공개하고 동작 테스트를 추가한다. CLI가 넣은 runtime 의존성은 peer/dev로 정리한다.
- 단계 사이의 앱 파손을 막기 위해 기존 Button·theme·전역 스타일을 이 단계까지 유지한다.
  호환 래퍼는 새로 만들지 않으며 기존 API의 최종 제거 시점만 6단계로 정한다.

### 6단계 — 전체 소비자 전환

- 앱에서 `@seed-design/css/base.css`를 한 번 import하고 기존 앱 공통 기본 스타일을 뒤에 연결한다.
- 자체 테마를 Seed 공개 토큰으로 전환한다. 제품 레이아웃 크기·safe-area·반응형 구조는 유지한다.
- `seedThemeScript: string`을 `@yapp-plus/ui/theme-script`로 공개해 두 앱 head와 Storybook
  `previewHead`에 넣는다. 스크립트 문자열은 외부 값을 보간하지 않는 자체 완결 코드로 만든다.
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
이전 lockfile 설치로 복구하고 check·build로 확인한다. 이번 작업에서 배포·revert·commit을 실행하지 않는다.

## 복잡성 기록

추가 예외나 패키지 계층은 없다. 초기 구현 계획의 API 즉시 제거를 6단계로 늦추어 리뷰 중간에도
기존 소비자가 작동하게 한다. 최종 API와 제품 범위는 바뀌지 않는다.
