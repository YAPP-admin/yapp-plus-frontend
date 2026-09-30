# Seed Design 전환 검증 결과

**검증일**: 2026-09-30

**대상 커밋**: `57ee25e` (`0220a14` 구현 포함)

**결론**: 자동 품질 게이트와 산출물 검증은 통과했다. 사용자가 시스템 라이트·다크 실행 중 전환을
직접 확인했다. 관리자 정책으로 에이전트의 로컬 브라우저 연결이 거부되어 나머지 실제 화면·보조
기술 검증은 완료하지 못했다.

## 품질 게이트와 의존성

| 검증                                                       | 결과 | 근거                                                  |
| ---------------------------------------------------------- | ---- | ----------------------------------------------------- |
| `pnpm install --frozen-lockfile`                           | 통과 | 현재 lockfile로 추가 변경 없이 설치 가능              |
| `pnpm dlx @seed-design/cli@1.7.0 compat --cwd packages/ui` | 통과 | ActionButton, loading-indicator, progress-circle 호환 |
| `node --run check`                                         | 통과 | format, lint 7/7, typecheck 7/7, test 4/4 성공        |
| `node --run build`                                         | 통과 | web, admin, Storybook 3/3 성공                        |
| Seed 의존성 확인                                           | 통과 | React 2.5.0, CSS 2.8.3, Vite plugin 2.1.0 단일 버전   |

최종 check와 build는 직전 캐시 없는 성공 결과를 Turbo 캐시에서 재사용했다. Storybook 빌드에는
500 kB 초과 chunk 경고가 남아 있지만 빌드는 성공했다. Vite plugin은 Storybook의
devDependency에만 있고 web·admin은 React와 CSS를 직접 dependency로 설치한다.

## 개발 서버와 프로덕션 산출물

- 개발 서버 web 3000, admin 3001, Storybook 6006, Expo web 8081에서 HTTP 200을 확인했다.
- 프로덕션 산출물 web 3100, admin 3101, Storybook 정적 iframe 6106에서 HTTP 200과
  `text/html` 응답을 확인했다.
- web·admin은 `@yapp-plus/ui/seed-theme`의 Manual 스크립트와
  `data-seed-color-mode="system"`을 포함한다.
- Storybook `iframe.html`은 `seedDesignPlugin()`이 주입한 `color-scheme` 메타와 시스템 테마
  스크립트를 각각 한 번 포함한다.
- web·admin·Storybook은 소스에서 `@seed-design/css/base.css`를 각각 한 번 가져온다.
- 세 빌드 산출물에서 Seed 색상 토큰을 확인했고 Storybook 산출물에서 ActionButton recipe를
  확인했다.
- web의 제품명·소개와 admin의 브랜드·대시보드 응답을 확인했다.

## 자동화된 동작과 의미 구조

- ActionButton userEvent 테스트 4개가 통과했다. 클릭, Tab·Enter·Space, disabled 클릭 차단과
  Tab 제외, loading과 disabled의 독립성, React 19 ref 포커스, `type="button"`의 비제출 동작을
  검증한다.
- web 테스트에서 `YAPP+` h1과 소개 문구를 확인했다.
- admin 테스트에서 `대시보드` h1과 빈 상태 문구를 확인했다.
- app-bridge의 safe-area 설치·값 처리 테스트를 포함한 17개 테스트가 통과했다.
- web CSS에서 네 방향 `--safe-area-inset-*` 우선값과
  `env(safe-area-inset-*, 0px)` fallback을 확인했다.

## 사용자 직접 브라우저 검증

- 사용자가 web·admin·Storybook을 실행한 상태에서 macOS 시스템 라이트·다크 전환이 새로고침 없이
  정상 반영되는 것을 확인했다.

## 미완료 브라우저 검증

Chrome 연결에서 관리자 정책을 확인할 수 없어 localhost 접근이 보안 정책으로 거부됐다. 보안
검사를 우회하거나 다른 자동화 도구로 대체하지 않았다. 따라서 다음 항목은 통과로 기록하지 않는다.

- 시스템 라이트·다크 각각의 최초 진입 표시
- hydration 경고와 브라우저 콘솔 오류
- 390px·1280px의 실제 배치, 가로 넘침과 내용 잘림
- 주입한 safe-area 값의 실제 레이아웃 반영
- 실제 키보드 포커스 표시, 터치 입력과 접근성 트리
- 실제 스크린 리더의 읽기 순서와 접근 가능한 이름

자동 테스트와 산출물 검사는 구현 연결과 정적 계약을 확인한다. 위 항목은 브라우저 정책이 해소된
환경에서 [검증 가이드](./quickstart.md)의 시나리오를 직접 실행해야 완료된다.

## 요구사항 판정

| 성공 기준                  | 판정      | 근거와 제한                                                 |
| -------------------------- | --------- | ----------------------------------------------------------- |
| SC-001 Seed 화면           | 부분 통과 | CSS·토큰·산출물 연결 확인, 실제 렌더링 미확인               |
| SC-002 시스템 테마         | 부분 통과 | 실행 중 양방향 변경 확인, 각 모드의 최초 진입 표시 미확인   |
| SC-003 기존 화면·안전 영역 | 부분 통과 | 의미 구조·브리지 테스트 통과, 실제 390px·1280px 배치 미확인 |
| SC-004 버튼·접근성         | 부분 통과 | userEvent 테스트 통과, 실제 터치·스크린 리더 미확인         |
| SC-005 문서 재현성         | 통과      | README, 검증 가이드와 이 결과 문서에서 절차 재현 가능       |

모바일 네이티브 설정과 의존성은 변경하지 않아 `node --run expo:doctor`는 실행하지 않았다.
