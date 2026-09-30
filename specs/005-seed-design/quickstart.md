# 검증 가이드: Seed Design 전환

## 전제

1~7단계는 사용자 리뷰를 마쳤고 8단계 문서 정리까지 수행했다. 아래는 검증 재현 절차이며 실제
실행 결과와 미실행 항목은 [validation.md](./validation.md)를 따른다. 브라우저 정책으로 완료하지
못한 항목은 이 절차로 다시 확인한다.

- Node.js 24.20.0, pnpm 12.3.4를 사용한다. 일반 셸의 버전이 다르면 명령 앞에 `mise exec --`를 붙인다.
- 5단계부터 설치된 lockfile로 `pnpm install --frozen-lockfile`이 성공해야 한다.
- 별도 인증 정보나 운영 데이터를 입력하지 않는다. 기존 홈·빈 대시보드·버튼 사례를 사용한다.

## 공용 UI 확인 — 5단계

```sh
mise exec -- pnpm dlx @seed-design/cli@1.7.0 compat --cwd packages/ui
mise exec -- pnpm --filter @yapp-plus/ui test
mise exec -- node --run check
mise exec -- node --run build
```

기대 결과: 스니펫 버전 호환, userEvent 기반 버튼 조작·disabled·loading·ref·비제출 계약 검증 통과, 기존 소비자도 빌드 가능.
가상의 저장 기능·비동기 업무 시나리오는 검증 대상에 포함하지 않는다.
이 단계에서는 기존 Button·theme API가 남아 있으며 6단계에서 제거한다.

## 개발 화면 실행 — 6~7단계

두 명령을 별도 터미널에서 실행하고 출력된 주소로 접속한다. 루트 dev는 web·admin·mobile을 함께
실행한다. Storybook 테마 검증은 preview iframe을 대상으로 한다.

```sh
mise exec -- node --run dev
mise exec -- node --run storybook
```

| 시나리오          | 실행                                                            | 기대 결과                                                |
| ----------------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| 최초 라이트·다크  | 브라우저 시스템 테마를 각각 설정한 뒤 새 문서로 진입            | 첫 콘텐츠 표시에서 올바른 배경·전경, hydration 오류 없음 |
| 실행 중 테마 변경 | 라이트→다크→라이트로 변경                                       | 새로고침 없이 일괄 반영                                  |
| 기존 콘텐츠       | 웹 제품명·소개, 관리자 메뉴·대시보드·빈 상태 확인               | 문구·라우팅·제목 구조 유지                               |
| 반응형            | 390px 및 1280px 너비에서 확인                                   | 가로 넘침·내용 잘림 없음                                 |
| 안전 영역         | 기존 브리지 테스트 및 브라우저에서 기존 safe-area CSS 변수 주입 | 기존 padding 우선순위와 fallback 보존                    |
| 버튼              | 활성·disabled·loading 및 loading+disabled 사례                  | 클릭 차단은 disabled가 담당, 로딩 표시는 별도            |
| 키보드·터치       | Tab, Enter, Space와 터치 입력                                   | 포커스가 보이고 기존 조작 수행 가능                      |
| 스크린 리더       | 랜드마크·제목·버튼 이름 확인                                    | 읽기 순서와 접근성 이름 보존                             |

브라우저에서 확인한 안전 영역은 웹 레이아웃 검증이다. 실제 기기 검증을 하지 않았다면
네이티브 WebView 전체를 검증했다고 기록하지 않는다. 접근성 트리 검사와 실제 스크린 리더 청취도 구분한다.

## 최종 품질 게이트 — 7단계

```sh
mise exec -- pnpm dlx @seed-design/cli@1.7.0 compat --cwd packages/ui
mise exec -- node --run check
mise exec -- node --run build
mise exec -- pnpm -r why @seed-design/react
mise exec -- pnpm -r why @seed-design/css
mise exec -- pnpm -r why @seed-design/vite-plugin
```

- Storybook 정적 산출물을 기존 상대 asset 경로로 제공해 테마와 컴포넌트 CSS를 확인한다.
- web·admin의 프로덕션 산출물에서도 CSS 누락·콘솔 오류·hydration 경고를 확인한다.
- 앱마다 Seed React/CSS의 단일 호환 버전과 base.css 1회 로딩을 확인한다. Vite plugin은 Storybook만
  소유하고 preview iframe에 테마 스크립트와 color-scheme 메타를 한 번 주입하는지 확인한다.
- 루트 품질 게이트는 앱·패키지의 포맷, 린트, 타입과 테스트를 포함한다. Turbo 캐시 활용 여부를 보고한다.
- 실제 실행 명령, 결과와 미실행 검증을 8단계 문서에 기록한다. 실패한 검증을 완료로 표시하지 않는다.

## 복구 확인

계획의 복구 단위에 따라 공용 UI·소비 앱·catalog·lockfile을 함께 되돌린 다음 frozen lockfile 설치와
check·build를 확인한다. 사용자 변경을 덮어쓰는 reset이나 일괄 정리는 사용하지 않는다.
