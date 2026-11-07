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

### 4단계 — 출석 내역 API 연결

- 사용자 승인으로 `0db68e86`에서 `DongjaJ/attendance-history-api`를 생성·전환했다. 검토 base는 `DongjaJ/my-page-layout`이며 push·PR·추가 commit은 하지 않았다.
- 생성 find5InfiniteOptions·인증 옵션·30초 캐시를 유지한다. transformer에서 생성 Zod 검증·안전한 ID 변환을 수행하며 현재 조회 체인의 커서 반복을 명시적 오류로 처리한다. 중복 ID는 위치를 유지해 갱신하고 마지막 성공 summary를 사용한다.
- 목업 mode·records를 제거했다. 실제 스크롤 컨테이너·활성 화면에서만 다음 페이지를 관찰하고, 오류 시 자동 요청을 중단한다. 초기/추가/재조회 오류 재시도·처음부터 조회, 독립 점수 경고와 전체 배지를 연결했다.
- 모델 구현 전 테스트 모듈 미존재로 실패를 확인했다. 최종 자동화는 응답 검증·3페이지 재조회·중복·반복 커서·전체 상태 매핑·결석 9/10·초기 및 추가 오류 복구·재조회 보존·비활성 화면·직접 진입 MY 복귀를 검증한다.
- headless Playwright 390×844에서 정상·빈 결과·초기 오류·추가 오류·결석 경고·로딩을 새 실행했다. 3페이지 스크롤·재시도·터치 뒤로가기를 확인했다. `.context/stage4-*.png`, `.context/stage4-browser.log`에 화면 근거를 보관했다.
- 실서버·실기기 WebView·스크린 리더·iOS safe-area와 5단계 계정 격리 통합은 미실행이다. 기존 light-only 테마를 유지하며 의존성·생성 코드·서버 계약은 변경하지 않았다. 롤백은 이 웹 변경만 되돌린다.
- 라우팅 테스트가 전환 완료 전에 끝나 다음 테스트에 영향을 주던 문제는 `/my` 복귀 대기·명시적 unmount로 해결했다. 라우팅 19개가 새 실행으로 통과했고 브라우저에서도 `/my` 복귀와 처음부터 조회 후 3페이지 복구를 확인했다.
- 최종 check·build 성공: format·web lint/typecheck·web 42파일 272테스트·web build 새 실행, 다른 lint/typecheck 각 6개·test 4개·build 2개 Turbo 캐시 재사용. 기존 청크 크기 경고는 유지된다. `.context/stage4-final-{check,build}.log`에 기록했다.
- 실제 base `0db68e86` 대비 추가·삭제 합계 782줄(새 파일 포함)로 800줄 미만이다. 650줄부터 분리를 검토했으나 내역 조회·화면·검증의 한 목적을 유지했다. T016–T023을 완료하고 4단계 리뷰에서 멈춘다. 5단계는 시작하지 않았다.

### 4단계 리뷰 — 생성 infinite 옵션으로 단순화

- 사용자 요청으로 반복 커서 검사·커서 이력·전용 오류 클래스·중복 병합을 제거했다. 생성 queryFn을 그대로 사용하며 initialPageParam·getNextPageParam만 추가한다. 목록은 서버 페이지 순서로 펼친다. 기존 명세의 해당 방어 정책도 함께 제거했다.
- 응답 transformer의 생성 Zod 검증과 bigint→안전한 number 변환은 페이지네이션과 별개인 경계 처리로 유지한다. 생성 TypeScript ID 타입과 런타임 반환 타입을 맞추기 위한 처리다.
- sentinel의 스크롤 부모 탐색과 root 지정을 제거했다. 기본 IntersectionObserver에서도 headless 모바일 3페이지 조회·오류 재시도·처음부터 조회·MY 복귀가 통과했다. `.context/stage4-simple-browser.log`에 새 실행 결과를 기록했다.
- check·build 통과: web lint·typecheck·270개 테스트·web build 새 실행, 다른 패키지는 Turbo 캐시 재사용. `.context/stage4-simple-{check,build}.log`에 기록했다. 실서버·WebView·스크린 리더 검증은 미실행이며 4단계 리뷰를 유지한다.

### 4단계 리뷰 — Suspense와 오류 경계

- 내역은 useSuspenseInfiniteQuery, 결석 경고는 독립 useSuspenseQuery 경계로 전환했다. 초기 로딩·실패는 별도 attendance-query-boundary.tsx가 처리하고 추가/재조회 실패는 기존 데이터를 보존한다. 로그인 조건은 조회 컴포넌트 마운트 전에 검사한다.
- 내역은 오류 code를 분류하지 않아 throwHttpErrors 덮어쓰기를 제거했다. SDK 기본 오류 처리를 유지한다. 생성 옵션의 skipToken 포함 타입만 좁히며 queryFn은 감싸지 않는다.
- useHistorySentinel은 useLoadMoreObserver, sentinel ref는 loadMoreRef, chips는 attendanceBadgeStyles로 이름을 명확히 했다.
- check·build 통과: web lint/typecheck·270테스트·web build 새 실행, 나머지 Turbo 캐시 재사용. headless 6개 상태·3페이지·복구·MY 복귀도 통과했다. `.context/stage4-suspense-{check,build,browser}.log`에 기록했다. 실제 서버·실기기·스크린 리더는 미실행이다.
- 누적 diff가 800줄을 초과해 조회 모델·MSW와 화면 변경의 브랜치 분리가 필요하다. 승인 전 commit·새 브랜치·push·PR은 수행하지 않았다. 5단계는 시작하지 않았다.

### 4단계 검토 단위 분리

- 사용자 승인으로 조회 모델·테스트·MSW·계약 11파일을 `2902980e`로 커밋했다. `DongjaJ/attendance-history-api`는 실제 base `DongjaJ/my-page-layout` 대비 +255/-14, 합계 269줄이다. format·lint·commitlint hook을 새로 실행해 통과했다.
- 해당 커밋에서 `DongjaJ/attendance-history-ui`를 생성·전환했다. 검토 base는 `DongjaJ/attendance-history-api`이며 화면·observer·라우팅·검증 문서는 미커밋으로 보존했다. push·PR은 하지 않았고 4단계 리뷰를 유지한다.

### 4단계 리뷰 — SEED 로딩과 조회 독립성

- 사용자 요청으로 전체 초기화 버튼·useQueryClient를 제거했다. 기존 데이터가 있는 Suspense query의 추가/재조회 오류는 오류 경계로 자동 전파되지 않으므로 isError 안내·같은 페이지 재시도를 유지한다.
- [SEED Loading 패턴](https://seed-design.io/patterns/loading), [Skeleton](https://seed-design.io/react/components/skeleton), [Progress Circle](https://seed-design.io/react/components/progress-circle)을 확인했다. 첫 로딩은 SEED Skeleton, 추가 로딩은 불확정 ProgressCircle로 표시하고 Grid·Box·HStack·VStack으로 배치했다.
- 내역·점수 경계를 형제로 분리했다. 내역 로딩·실패 중에도 점수 경고가 표시되며 기존 요약→경고→목록 순서는 유지한다. 관련 회귀 테스트 2개를 추가했다.
- check·build 성공: web lint/typecheck·272테스트·web build 새 실행, 다른 패키지는 Turbo 캐시 재사용. headless 모바일에서 3페이지·재시도·MY 복귀와 두 로딩 화면을 확인했다. `.context/stage4-seed-{check,build,browser}.log`, `.context/stage4-seed-{loading,more}.png`에 기록했다. 실서버·실기기·스크린 리더는 미실행이다.

### 4단계 최종 리뷰와 커밋

- requested 지역 플래그를 제거하고 isFetching·cancelRefetch: false로 중복 요청을 제어한다. observer mock도 disconnect 이후 관찰 콜백을 제거하도록 수정해 실제 생명주기를 반영했다. 화면의 summary는 sessionSummary로 명확히 했다.
- 오류 UI를 AttendanceQueryError 컴포넌트로 분리하고 useErrorBoundary의 resetBoundary를 사용한다. AttendanceQueryBoundary의 useCallback·fallbackRender는 제거했다.
- 최종 check·build 성공: web lint/typecheck·272개 테스트·web build 새 실행, 나머지는 Turbo 캐시 재사용. `.context/stage4-commit-{check,build}.log`에 기록했다. 실서버·실기기·스크린 리더 검증은 미실행이며 5단계에 남긴다.
- headless 모바일 6개 상태에서 3페이지 스크롤·재시도·MY 복귀를 새 실행해 통과했다. `.context/stage4-commit-browser.log`에 기록했다. 기능과 문서를 별도 커밋으로 분리하며 push·PR·5단계 구현은 수행하지 않는다.

### 5단계 — 계정 격리·통합 자동화

- 사용자 승인으로 `fe9c62b3`에서 `DongjaJ/my-attendance-integration`을 생성·전환했다. 실제 검토 base는 `DongjaJ/attendance-history-ui`다. commit·push·PR은 수행하지 않는다.
- 생성 mineOptions·find5InfiniteOptions로 각각 최초 401 후 갱신·재시도, 이름 보존, 후속 요청의 새 토큰 사용을 검증했다. 계정 전환은 이전 두 조회를 취소하며 지연 응답이 도착해도 새 세션이나 캐시를 복구하지 않는다.
- 실제 Stackflow+MY 테스트에서 이름 있는 계정에서 이름 없는 계정으로 전환하면 이전 이름을 제거하고 `—`를 표시한다. React Activity 숨김은 observer를 해제하고 복귀 시 목록 DOM·스크롤 값을 보존하며 다시 관찰한다. 이는 mock DOM 생명주기 검증이며 실제 WebView 스크롤 실측과 구분한다.
- 기존 최초/추가/재조회 오류·계정 mutation 회귀와 함께 확인했다. 제품 코드·인증 정책·의존성 변경은 없으며 새 테스트만 제거하면 이번 단계 변경을 롤백할 수 있다.
- 사전 headless Chromium에서 320×844·390×844, dark 선호·reduced motion 조건의 키보드 Enter 진입→3페이지→터치 MY 복귀를 확인했다. 두 폭 모두 가로 넘침이 없고 `/my` 복귀·기존 light-only 정책을 확인했다. `.context/stage5-browser.log`, `.context/stage5-{320,390}.png`에 근거를 보관했다.
- 실제 서버의 검증 계정과 구버전/신규 앱 조합으로 로그인·재시작·계정 전환·401 복구는 실행하지 않았다. 실행 중 iOS 시뮬레이터는 확인했으나 이를 실제 기기 검증으로 간주하지 않는다. 스크린 리더·기기 safe-area도 미실행이다. T027–T029는 이 결과와 최종 출시 리뷰까지 남긴다.
- 최종 check·build 성공: format·web lint/typecheck·web 42파일 277테스트·web build 새 실행, 다른 lint/typecheck 각 6개·test 4개·build 2개는 Turbo 캐시 재사용. 기존 청크 크기 경고만 유지된다. `.context/stage5-final-{check,build}.log`에 기록했다. 모바일 설정·의존성을 바꾸지 않아 expo:doctor는 실행하지 않았다.
- base `fe9c62b3` 대비 +188/-5, 합계 193줄이다. 자동화 범위 T024–T026을 완료하고 실환경 검증 T027–T029는 미완료로 유지한다. 작업은 미커밋 상태다.

### 5단계 — 네이티브 실행 시도

- iOS 17.5 iPhone 15 Pro 시뮬레이터의 개발 빌드를 실제로 열어 확인했다. 연결 대상은 다른 워크스페이스의 Metro 8081이며 위치 브리지 개발 화면이 표시되어, 이번 변경의 검증 결과로 사용할 수 없다.
- 이번 워크스페이스에서 Metro 8082·웹 3001을 API 모킹 없이 실행했지만 해당 빌드로 연결·조회 성공을 확인하지 못했다. 공유 시뮬레이터 사용을 확인하기 전에는 다른 작업의 연결을 변경하지 않는다.
- 검증용 WebView 포트 변경은 원복하고 이번에 실행한 두 서버만 종료했다. 실제 서버 로그인·점수·내역·401 복구·네이티브 safe-area는 계속 미검증이며 T027–T029를 완료 처리하지 않는다.

### 5단계 — 전용 시뮬레이터 연결 후 확인

- 다른 세션 종료 후 사용자 승인으로 iPhone 15 Pro(iOS 17.5)를 Metro 8082에 연결했다. 이번 워크스페이스의 iOS 번들(1,581 모듈)이 실행됐고 웹은 API 모킹을 끈 3002 포트로 제공했다.
- 실제 WebView에서 `로그인 상태를 확인하지 못했어요`와 `다시 시도`가 표시됐다. 마이페이지·출석 내역 조회 성공은 확인하지 못했으며, 이 화면만으로 서버 인증 실패나 원인을 확정하지 않는다.
- 개발 런처의 접근성 버튼·주소 입력은 동작했지만 WebView 좌표 클릭은 도구의 `noWindowsAvailable` 오류로 실패했다. 사용자에게 복구 버튼 클릭을 요청했다. `.context/stage5-native-session-recovery.png`에 화면을 보관했다.
- 재시도 결과를 확인하기 위해 검증 서버와 임시 WebView 개발 포트 3002를 유지한다. 검증 종료 시 포트는 3000으로 원복해야 하며 이 임시 변경은 커밋 대상이 아니다. T027–T029는 미완료다.

### 네이티브 세션 복구 실패 원인 확인

- 임시 진단 표시로 `manila:3002`, `ERROR / STORAGE`, `bridge=true`, `session=true`를 확인했다. 현재 워크스페이스 코드이며 브리지 메서드 연결 실패가 아니다.
- 네이티브 로그에서 SecureStore의 기존 토큰 키 삭제 호출 `deleteValueWithKeyAsync`가 `필요한 권한이 존재하지 않습니다`로 실패하는 것을 확인했다. 토큰 값은 조회·출력하지 않았다.
- 설치된 YAPP.app의 codesign 조회에서 entitlement가 출력되지 않았다. 기존 개발 바이너리의 Keychain 권한 문제를 해결한 빌드로 재검증해야 한다. 저장소 오류를 무시하거나 인증을 우회하지 않았다. 임시 진단 UI·로그 코드는 원복했다.

### 네이티브 재빌드 후 저장소 복구 확인

- 사용자 승인으로 현재 워크스페이스에서 Expo iOS prebuild·pod install·Xcode Debug simulator 빌드를 새로 실행했다. `CODE_SIGN_IDENTITY=-`, `CODE_SIGNING_ALLOWED=YES`로 빌드 성공 후 같은 앱 ID로 업데이트 설치했다. 앱 삭제나 Keychain 초기화는 하지 않았다.
- 생성된 `YAPP.app-Simulated.xcent`에는 `FAKETEAMID.org.yapp.yappplus` 앱 식별자가 포함된다. 일반 codesign 출력의 entitlement만으로 시뮬레이터 권한을 단정할 수 없으므로 실제 실행 결과를 기준으로 확인했다.
- 재설치 앱을 열어 이전 `ERROR / STORAGE` 복구 화면 대신 정상 로그인 화면에 도달했다. `.context/stage5-native-login.png`에 화면 근거를 저장했다. 실제 계정 점수·내역·세션 재시작은 사용자 테스트 계정 로그인 후 검증해야 한다.
- `mise exec -- node --run expo:doctor`를 새로 실행해 20/20 검사를 통과했다. iOS 빌드 역시 새 실행이며 외부 의존성 다운로드·CocoaPods 캐시는 재사용했다. `.context/stage5-ios-{prebuild,pods,build}.log`, `.context/stage5-expo-doctor.log`에 기록했다. 기존 웹 check·build는 제품 코드 변경이 없어 반복하지 않았다.
- 생성된 ios 디렉터리·빌드 산출물은 gitignored이며 의존성·운영 설정 변경은 없다. 테스트 계정 로그인을 위해 Metro 8082·웹 3002 및 임시 WebView 포트를 유지한다. 검증 종료 후 포트를 원복해야 한다. commit·push·PR은 수행하지 않았다.

### 실제 로그인과 주간 세션 조회

- 사용자 재시도에서 Apple SDK 성공 → 인증 API HTTP 200 → `SIGNED_IN`을 확인했다. 앞선 일시적 `SERVER` 결과의 원인은 재현되지 않아 확정하지 않는다. 인증 진단 코드는 원복했다.
- 홈 조회 실패는 `NetworkError`였다. 검증 주소 `http://127.0.0.1:3002`의 CORS 사전 요청은 HTTP 403·허용 헤더 없음, `http://localhost:3002`는 HTTP 200·해당 origin 허용으로 확인됐다. 이는 검증 환경의 호스트 선택 문제다.
- 임시 WebView 호스트를 localhost로 바꾸자 로그인 상태를 유지하며 홈에 `이번 주 예정된 세션이 없어요`가 표시됐다. 오류를 숨기거나 서버 계약을 변경하지 않았다. 임시 홈 진단 표시도 원복했다.
- WebView 좌표 클릭은 계속 `noWindowsAvailable`로 실패해 사용자에게 MY 이동을 요청했다. 마이페이지·내역 실서버 검증은 계속 진행 중이다. 임시 포트·호스트 변경은 검증 종료 시 함께 원복한다.

### MY 실제 계정 결과와 첫 진입 오류 보고

- 사용자 보고: MY 첫 진입은 재시도 안내가 표시됐고 수동 재시도 후 표시됐다. 이는 기대 동작으로 간주하지 않으며 최초 실패의 HTTP 상태·오류가 확보되지 않아 원인을 확정하지 않는다.
- 실제 화면에서 세션 이름과 점수·횟수 `—` 표시를 확인했다. 점수 query의 반환 사유는 `ATTENDANCE_SCORE_NOT_ELIGIBLE`이므로 현재 계정의 `—`는 명세에 따른 미대상 처리다. 점수가 있는 계정의 정상 표시까지 검증한 것은 아니다.
- 진단용 query 상태 표시는 제거했다. 새 앱 실행에서 첫 요청 결과를 별도로 재현해야 하며 T027–T029는 미완료로 유지한다.

### 시뮬레이터 재시작 후 첫 진입 재검증

- 사용자 요청으로 Device Hub에서 iPhone 15 Pro를 재시작한 뒤 YAPP+ 앱과 이 워크스페이스의 Metro 8082를 다시 열었다. 저장 데이터 초기화·재로그인 없이 홈에 진입하고 주간 세션 없음이 표시됐다.
- 이번에는 도구의 WebView 좌표 입력이 동작했다. MY 첫 진입에 재시도 안내 없이 이름·미대상 `—` 표시를 확인했다. 이전 첫 진입 오류는 이번 실행에서 재현되지 않았으나 최초 오류 원인 확정이나 영구 해결로 간주하지 않는다.
- 출석 규칙 열기·확인 닫기, 출석 내역 첫 진입(총/남은 세션 0회·빈 내역), 뒤로가기 MY 복귀가 모두 동작했다. `.context/stage5-native-history-empty.png`에 개인정보 없는 내역 화면을 보관했다. 상태 표시줄·홈 인디케이터와 주요 콘텐츠 겹침은 관찰되지 않았다.
- 실제 점수·내역이 있는 계정의 페이지 추가 조회, 구버전 앱, 계정 전환, 의도적 401 복구와 실제 스크린 리더는 미검증이다. 이번 실행은 실제 서버를 연결한 iOS 시뮬레이터 검증이며 실물 기기 검증은 아니다.

### 검증 환경 정리

- 검증용 Metro 8082·웹 3002만 종료하고 WebView 임시 포트·호스트 변경을 원복했다. 다른 워크스페이스 서버는 변경하지 않았다. 임시 진단 코드도 남아 있지 않다.
- 구현과 현재 계정으로 가능한 실서버 시뮬레이터 확인을 마무리했다. 추가 계정·기기 조건이 필요한 미검증 항목과 재현되지 않은 최초 오류는 위 기록대로 남긴다. 통합 테스트·검증 문서는 미커밋이며 push·PR은 수행하지 않았다.
