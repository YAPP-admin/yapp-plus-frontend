# 검증 기록

## 1단계 — 명세·계약·작업 목록

**날짜**: 2026-11-07

**기준**: HEAD = origin/main = `4fc4cd837bc04df3d7c2c99152af5ce6ba68c744`

**브랜치**: `DongjaJ/my-page-attendance-api-plan` 유지

**상태**: 문서·이슈 준비 완료. 사용자 “다음 작업 진행해”로 1단계 리뷰 및 2단계 진행 확인.

## 변경과 조사

- 이 디렉터리에 명세·계획·조사·모델·계약 2개·검증 가이드·작업 목록·체크리스트·본 기록을 작성했다.
- `.specify/feature.json`에 현재 feature를 지정했다. 로컬 제외 설정 대상이므로 PR 문서에 포함되지 않는다.
- 같은 목적의 열린 이슈 검색은 결과가 없었다. `.context/my-attendance-issue.md`에 템플릿을 따른 초안을 작성했다.
- 생성 이슈 [#352](https://github.com/YAPP-admin/yapp-plus-frontend/issues/352): `feature: 마이페이지와 출석 내역 API 연동`. 담당자: DongjaJ. 추가 라벨·milestone 없음.
- 사용자 승인으로 이슈를 생성하고 제목·본문·담당자·OPEN 상태를 재조회했다. 브랜치 변경·commit·push·PR·제품 구현은 수행하지 않았다.
- 29개 작업 중 문서 준비 T001–T004만 완료했다. US1 6개, US2 8개, US3 4개이며 나머지는 준비·기반·마무리 작업이다.
- origin/main 대비 새 문서 10개, +574/-0줄이다. 문서 단계는 650줄 미만으로 분리 검토 기준에 도달하지 않았다.
- 추가 검토에서 SDK의 오류 status 보존·스키마 변환 반환·재조회 커서 비교 범위를 보완했으며 최종 링크·작업 형식·공백 검사가 통과했다.

## 실행 결과

| 항목                                                | 결과                                           | 이번 실행 여부                                |
| --------------------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| git fetch origin·상태 확인                          | 성공, 기준 일치·기존 사용자 변경 없음          | 새 실행                                       |
| Spec Kit template resolve·setup-plan·setup-tasks    | 성공, 018-my-attendance 경로 확인              | 새 실행                                       |
| check-prerequisites --require-tasks --include-tasks | 성공, 필수 설계 파일 확인                      | 새 실행                                       |
| 문서 로컬 링크·placeholder·작업 ID/경로 검사        | 성공, 초기 validation.md 누락을 작성 후 재검사 | 새 실행                                       |
| 문서 포맷·루트 format:check                         | 성공                                           | 새 실행                                       |
| node --run check                                    | 성공                                           | 아래 Turbo 단계는 캐시 재사용                 |
| lint                                                | 7/7 성공                                       | 7개 전부 Turbo 캐시                           |
| typecheck                                           | 7/7 성공                                       | 7개 전부 Turbo 캐시                           |
| test                                                | 5/5 성공                                       | 5개 전부 Turbo 캐시, 테스트 본문 새 실행 아님 |

고정 pnpm 실행 과정에서 lockfile 기준 의존성을 로컬 store에서 복원했다.
package.json·lockfile 변경은 없으며 외부 배포·API 쓰기 호출도 없다.
Spec Kit extension 파일이 없어 before/after hook은 모두 적용 대상이 아니다.

## 미실행·남은 검토

- build·expo:doctor: 문서만 변경했으므로 이번 단계에서 실행하지 않았다.
- 실제 UI·WebView·인증·서버 데이터 검증: 제품 구현 전이므로 미실행이며 후속 단계에서 수행한다.
- 최신 배포 OpenAPI 수신은 앞선 조사에서 타임아웃이었다. 서버 dev 소스 확인과 실서버 검증을 구분한다.
- 이름 없는 기존 설치가 다음 정상 로그인 전까지 `—`인 점, 회원 정보·면제권·진행률의 `—`, 단계별 리뷰 범위를 확인받는다.
- 이슈 생성·번호 확인과 1단계 진행 확인을 완료해 T005를 완료했다.

## 2단계 — 이름 전달 기반

- T006–T009 구현 완료, 사용자 리뷰 대기. 이름을 API 입력·저장 복구에서 정규화하고 기존 version 1 세션에 선택적으로 저장한다.
- 토큰 갱신·재시작은 저장된 이름을 유지하며 이름 없는 새 계정은 이전 이름을 상속하지 않는다. 기존 세대 검사로 늦은 응답을 차단한다.
- 구현 전 모바일 인접 테스트 73개 중 이름 누락 관련 5개 실패를 확인했다. 구현 후 기존 저장값 기대를 새 계약에 맞추고 테스트 lint 오류를 수정했다.
- `check`·`build` 결과 및 변경량은 아래 최종 검증에 기록한다. 로그는 `.context/stage2-check.log`, `.context/stage2-build.log`에 보관한다.
- 실기기 Keychain·WebView·서버 인증은 미실행이다. UI 연결은 3단계이며 native 실제 환경 호환성은 통합 단계에서 검증한다.
- 모바일 설정·의존성 변경이 없어 expo:doctor는 미실행이다. 루트 build에는 native 바이너리 빌드가 포함되지 않는다.
- 650줄 분리 기준을 넘어 명세 PR과 이름 전달 PR 분리를 검토했다. 현재 800줄 미만이며 다음 화면 구현 전 PR 분리를 권장한다. Git 이력·원격 변경은 수행하지 않았다.

### 최종 검증

- `node --run check` 성공: format 새 실행, 최종 lint·typecheck 각각 1개 새 실행/6개 캐시, test 2개 새 실행/3개 캐시.
- 이번 단계에서 app-bridge 26개·mobile 83개·web 220개 테스트를 새로 실행해 통과했다. 최종 check의 app-bridge 결과는 직전 실행 캐시다. admin·ui 테스트는 기존 캐시만 재사용했다.
- `node --run build` 성공: web 새 실행, admin·storybook 캐시. web의 청크 크기 경고가 있으며 빌드 실패는 없다.
- origin/main 대비 untracked 문서·테스트 포함 +698/-20줄, 합계 718줄. 이번 단계는 분리하지 않았으며 다음 단계 전 분리 권장.
- 문서 최종 포맷과 `git diff --check` 통과. 3단계 구현은 사용자 리뷰 후 진행한다.

## 기존 작업 커밋과 3단계 — 마이페이지 연동

- 사용자 승인으로 기존 문서 `6b015a76`, 이름 전달 `0145466f`를 목적별 커밋했다. hook을 통과했다.
- 커밋 전 `check`·`build` 성공. format은 새 실행, lint 7개·typecheck 7개·test 5개·build 3개는 전부 Turbo 캐시였다.
- 사용자 승인으로 `DongjaJ/my-page-api`를 생성·전환했다. 검토 base는 `DongjaJ/my-page-attendance-api-plan`의 `0145466f`다. push·PR 생성은 하지 않았다.
- 2단계 리뷰·3단계 진행 승인을 받았고 T010–T014를 구현했다. T015는 아래 화면 검증 제한으로 미완료다.
- 세션 이름과 점수·횟수를 연결하고 미지원 프로필·면제권은 `—`로 남겼다. 기존 메뉴와 규칙 다이얼로그를 유지했다.
- 생성 SDK·query key·Zod 기반으로 안전한 ID 정규화, status/code가 일치하는 미대상 처리, 실패·재시도·이전 값 유지 동작을 구현했다. 새 의존성·생성 코드·서버 계약 변경은 없다.
- DEV+MSW에서 정상·미대상 2종·지연·최초 실패 후 복구를 재현한다. `.context/stage3-dev.log`에 개발 서버 로그를 보관한다.

### 자동 검증

- 구현 전 새 query 모듈 미존재로 수집 실패를 확인했고, query 구현 후 화면 연결 전 화면 테스트 10개 실패·query 테스트 18개 성공을 확인했다. 수집 실패와 기능 회귀 실패를 구분한다.
- 초기 검사에서 lint 규칙, 테스트 Provider 초기화 대기와 query fixture 타입 오류를 수정했다.
- 최종 `mise exec -- node --run check` 성공: format 새 실행, lint·typecheck 각각 web 1개 새 실행/6개 캐시, test web 1개 새 실행/4개 캐시.
- web 40개 파일·244개 테스트를 새로 실행했다. 점수 query 18개·마이페이지 10개를 포함한다. 다른 패키지 테스트 수는 캐시 결과이므로 새 실행으로 보고하지 않는다.
- `mise exec -- node --run build` 성공: web 새 실행, admin·storybook 캐시. 기존 청크 크기 경고가 있으며 빌드 실패는 없다.
- 로그: `.context/stage3-check.log`, `.context/stage3-build.log`. 키보드 Enter 재시도, 상태 접근성 이름, 메뉴와 규칙 다이얼로그는 자동 테스트로 확인했다.

### 남은 확인과 리뷰

- Chrome 탭 생성·연결·DOM·스크린샷 도구가 `timeoutMs` 관련 오류를 반환했다. native 앱으로 로컬 URL 이동은 했으나 캡처가 검은 화면이고 페이지 접근성 트리도 확보되지 않았다. 유효한 화면 캡처나 시각 검증 성공으로 보고하지 않는다.
- 실제 터치·스크린 리더, 모바일 폭·safe-area·테마 시각 검증은 미실행이다. 현재 Vite 설정은 light-only이며 테마 정책 변경은 없다.
- 실제 서버·WebView·구 native 조합 검증은 미실행이다. MSW와 가상 native 테스트 성공을 실서버 연동 성공으로 보지 않는다.
- 모바일 설정·의존성 변경이 없어 expo:doctor는 미실행이다. 4단계 출석 내역 구현은 시작하지 않았다.
- 최초 3단계 제출은 실제 base `0145466f` 대비 +406/-59줄, 합계 465줄이었다. 리뷰 반영 후 변경량은 아래에 기록한다.
- 3단계 변경은 미커밋으로 제출한다. T015의 화면 근거 확보와 사용자 리뷰 후 다음 단계 진행을 확인한다.

### 3단계 리뷰 반영 — 생성 옵션·Suspense·오류 보존

- 사용자 요청으로 직접 SDK 호출을 생성 `mineOptions`의 queryFn·query key 재사용으로 변경하고 HTTP status 중복 판별을 제거했다. 기존 인증 훅·signal 전달은 생성 옵션을 통해 유지한다.
- `useSuspenseQuery`·Suspense·ErrorBoundary·QueryErrorResetBoundary를 점수 영역에 적용했다. 카드 제목·규칙·프로필·메뉴는 경계 밖에 유지하며 기존 카드 배치를 CSS grid로 보존한다.
- 초기 실패는 ErrorBoundary 재시도로 복구하고 재조회 실패는 이전 값과 안내를 함께 표시한다. 로딩 중 연 규칙 다이얼로그가 조회 완료에도 유지되는 회귀 테스트를 추가했다.
- queryFn 부재의 별도 런타임 예외를 제거했다. 생성 타입의 선택적 함수는 optional call로 호출하고 반환값은 기존 스키마로 검증하므로 타입 단언·lint 예외가 없다.
- 모든 실패를 같은 Error로 감싸는 코드도 제거했다. 미대상 외 오류·스키마 오류·네트워크 오류는 원래 오류를 전파하고 화면에서 안내 문구를 정한다.
- 사용자가 미대상 상태·사유를 명시적으로 반환하고 `—`로 표시하는 정책을 승인했다. 미대상 code 2개는 null 대신 `{ status: unavailable, reason }`으로 보존하고 정상 값은 `{ status: available, score }`로 반환한다. 별도 에러 클래스는 추가하지 않았다.
- 수정 전 code 단독 판별 회귀 2개 실패를 확인했다. 중간 검증에서 관련 테스트 29개가 통과했으며 최종 결과는 아래에 기록한다.
- 최종 `check` 성공: format 새 실행, web lint·typecheck 새 실행/각 6개 캐시, web 40개 파일·245개 테스트 새 실행/다른 4개 패키지 테스트 캐시. 점수 19개·마이페이지 10개 테스트를 포함한다.
- 최종 `build` 성공: web 새 실행, admin·storybook 캐시. 로그는 `.context/stage3-review-check.log`, `.context/stage3-review-build.log`다. 기존 청크 크기 경고는 유지된다.
- 화면 도구 오류와 실서버·WebView·실환경 접근성 검증 제한은 위 기록과 같다. T015는 미완료이며 4단계는 시작하지 않았다. 이번 리뷰 반영은 미커밋이다.
- 최종 변경량 실제 base `0145466f` 대비 +586/-131줄, 합계 717줄이다. 650줄 기준을 넘어 분리를 검토했으나 점수 조회·화면·검증 계약이 한 목적이며 800줄 미만이므로 현재 단계에 유지한다.

### 3단계 리뷰 반영 — SEED layout과 오류 경계 분리

- 사용자 승인으로 기존 작업을 `789f9f43`(조회·MSW·테스트), `63a502b2`(화면·테스트), `12c2fa00`(계약·검증 문서)로 나눠 커밋했다. hook을 통과했고 당시 작업 트리는 clean이었다.
- 커밋 전 check·build는 성공했으며 format만 새 실행, lint·typecheck·test·build는 모두 Turbo 캐시였다.
- seed-design 스킬의 공식 React 문서와 설치본 3.1.0 타입을 확인했다. [HStack](https://seed-design.io/react/components/layout/h-stack), [VStack](https://seed-design.io/react/components/layout/v-stack), [Box](https://seed-design.io/react/components/layout/box), [Grid](https://seed-design.io/react/components/layout/grid)를 사용하고 레이아웃 CSS 103줄을 제거했다.
- 기존 간격·크기를 같은 SEED dimension으로 옮기고 nav·section·output 의미를 유지했다. 의존성·공용 패키지·생성 파일은 변경하지 않았다.
- score-error-boundary.tsx로 QueryErrorResetBoundary·ErrorBoundary·초기 오류 안내를 분리했다. score-summary.tsx는 정상·로딩·실패 상태의 같은 점수 배치를 담당한다. 새 공용 추상화는 추가하지 않았다.
- check 성공: format 새 실행, web lint·typecheck 새 실행/각 6개 캐시, web 40개 파일·245개 테스트 새 실행/다른 4개 패키지 테스트 캐시. 기존 회귀 테스트로 로딩 중 다이얼로그 유지·초기 및 재조회 실패 복구를 확인했다.
- build 성공: web 새 실행, admin·storybook 캐시. 초기 minWidth 숫자 prop 타입 오류는 공개 API에 맞는 문자열로 수정했다. 기존 청크 크기 경고는 유지된다.
- 로그는 `.context/stage3-layout-check.log`, `.context/stage3-layout-build.log`다. 화면 캡처·실기기·실서버 검증 제한은 이전 기록과 같고 T015는 여전히 미완료다.
- 사용자 승인으로 `12c2fa00`에서 후속 브랜치 `DongjaJ/my-page-layout`을 생성·전환했다. 검토 base는 `DongjaJ/my-page-api`이며 미커밋 변경을 보존했다. push·PR 생성·추가 commit은 수행하지 않았다.

### 3단계 화면 비교 완료

- 사용자 승인으로 별도 headless Playwright·Chromium에서 기준 커밋 `12c2fa00`과 현재 코드를 동일한 320×844·390×844 모바일 viewport로 비교했다. 두 서버 모두 DEV+MSW를 사용했다.
- 정상·로딩·초기 오류·미대상·기수 없음·규칙 다이얼로그 12쌍 모두 PNG 픽셀 차이 0이며 프로필·카드·규칙 버튼·메뉴의 좌표와 크기가 일치했다. `.context/ui-diff.log`, `.context/ui-comparison.json`, `.context/ui-{before,after}-{320,390}-*.png`에 근거를 보관했다.
- 두 버전에서 오류 후 재시도로 92점 복구를 확인했다. 현재 버전의 키보드 Enter 열기·Escape 닫기·닫힘 후 초점 복귀, 터치 다이얼로그 열기·출석 내역 이동도 확인했다. dark 환경에서도 기존 light-only 정책을 유지한다.
- headless 검증은 실제 스크린 리더·iOS safe-area·WebView·실서버 검증을 대신하지 않는다. 해당 항목은 5단계에 남긴다. 자동화 코드는 `.context/ui-compare.mjs`, `.context/ui-interactions.mjs`다.
- 최종 check·build 성공: format 새 실행, lint·typecheck·test·build는 모두 Turbo 캐시 재사용. headless 비교·상호작용은 이번에 새 실행했다. 로그는 `.context/stage3-ui-final-{check,build}.log`다.
