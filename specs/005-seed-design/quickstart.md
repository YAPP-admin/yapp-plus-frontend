# 검증 가이드: Seed Design 전환

## 전제

제품 코드는 아직 구현 전이다. 아래는 5~7단계에서 실행할 검증 절차이며 완료 기록이 아니다.
각 사용자 단계가 끝나면 다음 단계 명령을 실행하기 전에 리뷰를 받는다.

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

기대 결과: 스니펫 버전 호환, 활성·비활성·로딩·ref 테스트 통과, 기존 소비자도 빌드 가능.
이 단계에서는 기존 Button·theme API가 남아 있으며 6단계에서 제거한다.

## 개발 화면 실행 — 6~7단계

각 명령을 별도 터미널에서 실행하고 출력된 주소로 접속한다.

```sh
mise exec -- pnpm --filter @yapp-plus/web dev
mise exec -- pnpm --filter @yapp-plus/admin dev
mise exec -- node --run storybook
```

| 시나리오          | 실행                                                            | 기대 결과                                                |
| ----------------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| 최초 라이트·다크  | 브라우저 시스템 테마를 각각 설정한 뒤 새 문서로 진입            | 첫 콘텐츠 표시에서 올바른 배경·전경, hydration 오류 없음 |
| 실행 중 테마 변경 | 라이트→다크→라이트로 변경                                       | 새로고침 없이 일괄 반영                                  |
| 감지 실패         | 공용 단위 테스트에서 matchMedia 부재·실패 모의                  | light 유지, 초기화 오류 전파 없음                        |
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
```

- Storybook 정적 산출물을 기존 상대 asset 경로로 제공해 테마와 컴포넌트 CSS를 확인한다.
- web·admin의 프로덕션 산출물에서도 CSS 누락·콘솔 오류·hydration 경고를 확인한다.
- 앱마다 Seed React/CSS의 단일 호환 버전과 base.css 1회 로딩을 확인한다.
- 루트 품질 게이트는 앱·패키지의 포맷, 린트, 타입과 테스트를 포함한다. Turbo 캐시 활용 여부를 보고한다.
- 실제 실행 명령, 결과와 미실행 검증을 8단계 문서에 기록한다. 실패한 검증을 완료로 표시하지 않는다.

## 복구 확인

계획의 복구 단위에 따라 공용 UI·소비 앱·catalog·lockfile을 함께 되돌린 다음 frozen lockfile 설치와
check·build를 확인한다. 사용자 변경을 덮어쓰는 reset이나 일괄 정리는 사용하지 않는다.
