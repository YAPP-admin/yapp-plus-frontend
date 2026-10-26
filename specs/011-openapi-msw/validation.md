# 검증·리뷰 기록

## 1단계 — 요구사항·계획·작업 목록

**일자**: 2026-10-26 | **상태**: 완료, 사용자 “진행해”로 리뷰 승인
**이슈**: [#107](https://github.com/YAPP-admin/yapp-plus-frontend/issues/107)

- git fetch origin 완료. 작업 시작 시 tracked 변경 없음, 현재 브랜치 유지.
- HEAD dc5c957, origin/main 25c1b7e, main의 선행 커밋 27개 확인. 병합하지 않음.
- 관련 열린 이슈 없음 확인 후 사용자가 이슈 생성을 명시적으로 승인함.
- 이슈 #107 생성 완료. 제목·본문·담당자 DongjaJ·OPEN 상태를 재조회로 확인함.
  라벨·milestone은 지정하지 않음. 이슈 체크리스트 변경·commit·push·PR은 수행하지 않음.
- Node 24.20.0·pnpm 12.3.4 확인. node_modules 없음. 설치는 2단계까지 보류.
- 기본 Spec Kit 템플릿 확인. extensions.yml·template override 없음. 헌법은 미작성 템플릿.
- 이번 명세 재조회 두 번은 시간 초과. 이전 48 operation 확인과 현재 재조회 실패를 구분함.
- .context/011-openapi-msw/의 초안을 specs/011-openapi-msw/에 정식 반영함.
- 로컬 .specify/feature.json 포인터를 설정하고 setup-plan.sh·setup-tasks.sh를 실행함.
  스크립트의 BRANCH 필드는 feature 이름으로 해석될 수 있으나 실제 Git 브랜치는 변경하지 않음.
- check-prerequisites.sh --json --require-spec --require-tasks --include-tasks 통과.
- 2~8단계의 설정·의존성·생성물·앱 코드·테스트는 변경하지 않음.
- 문서 9개의 로컬 링크·미해결 placeholder·행 끝 공백 검사 통과.
- 작업 ID T001~T035의 연속성·중복 없음·8단계 리뷰 중단점 확인.
  US1 4개, US2 11개, US3 6개, 공통 준비·검증·인계 14개로 구성됨.
- 이번 변경은 새 specs/011-openapi-msw/ 문서 9개다. 로컬 feature 포인터와 초안은 gitignored 상태다.
- mise exec -- node --run check 실행: oxfmt: command not found로 중단.
  의존성 미설치로 포맷·lint·typecheck·test의 품질 게이트를 통과했다고 판단하지 않음.
- 문서만 작성한 단계이므로 build·브라우저·실제 codegen 검증은 실행하지 않음.

## 2단계 — 의존성과 생성 설정

**일자**: 2026-10-26 | **상태**: 완료, 사용자 “커밋하고 다음 진행해”로 리뷰 승인

### 변경

- MSW 2.15.0을 catalog로 고정하고 API 패키지 dependencies, 두 앱 devDependencies에 추가했다.
- 생성 설정에 msw를 추가했다. 일반 index 제외, 첫 명세 서버의 base URL, 예제 비활성,
  미구현 501 정책을 설정하고 기존 SDK validator·transformer 기본값을 유지했다.
- 두 앱의 worker 경로만 포맷·lint 제외 목록에 추가했다. worker 파일은 아직 생성하지 않았다.
- 첫 설치는 미검토 MSW postinstall로 ERR_PNPM_IGNORED_BUILDS가 발생했다.
  배포 스크립트를 읽고 자동 worker 복사임을 확인해 해당 버전만 실행하지 않도록 명시했다.
  설치 보호는 유지했고 동작 변경은 research.md에 기록했다.
- lockfile에 MSW 관련 34개 package version이 추가됐으며 기존 package version은 삭제되지 않았다.
  모바일 importer는 변경 전과 동일하다. Vitest의 MSW optional peer 연결은 설치 도구가 갱신했다.
- 1단계 문서도 설치된 고정 oxfmt로 포맷했다. 요구사항 범위는 변경하지 않았다.

### 검증 결과

| 항목                           | 결과                                                                |
| ------------------------------ | ------------------------------------------------------------------- |
| pnpm install --frozen-lockfile | 통과, resolution 재실행 없이 lockfile 사용                          |
| node --run check               | 포맷·lint·typecheck·기존 테스트 모두 통과                           |
| 테스트                         | admin 215, web 29, ui 6 통과; app-bridge 17은 동일 입력 캐시 재사용 |
| node --run build               | admin·web·Storybook 3개 빌드 통과                                   |
| git diff --check               | 통과                                                                |
| 단계 범위                      | API generated 디렉터리와 두 worker 파일이 생성되지 않았음을 확인    |

빌드 실행 기록은 로컬 `.context/openapi-msw-stage-2-build.log`에 있다.
pnpm peers check는 기존 모바일 react-native-worklets 0.13.0의 peer 범위 경고로 실패한다.
이는 MSW 관련 경고가 아니며 기존 모바일 버전이나 정책을 변경하지 않았다.
모바일 설정·의존성은 변경하지 않아 expo:doctor를 실행하지 않았다.
실제 API codegen과 생성물 계약·런타임 MSW 검증은 아직 수행하지 않았고 3단계 이후 대상이다.

## 3단계 — 전체 API·MSW 생성

**일자**: 2026-10-26 | **상태**: 생성·계약 검증 완료, 사용자 다음 단계 승인

### 커밋과 입력

- 사용자 승인으로 1·2단계를 c2c723c (`feat(api): OpenAPI와 MSW 생성 기반 구성`)에 커밋했다.
  pre-commit 포맷·lint와 commitlint를 통과했다. push·PR은 수행하지 않았다.
- 입력: https://44nk4mnqi7.execute-api.ap-northeast-2.amazonaws.com/v3/api-docs
- 조회 시각: 2026-10-26 20:19:34 KST. OpenAPI 3.1.0, 48 operation, 63 schema.
- 원문 SHA-256: `5ce4c87ef0fdf27836f42c5ea90d146d1291aa114f473cd738b716e061d940ce`
- 원문은 gitignored `.context/openapi-msw-input.json`, 조사 결과는
  `.context/openapi-msw-contract-audit.json`에 보관했다. 명세 내용을 수정하지 않았다.

### 변경

- 동일한 입력으로 SDK·TypeScript 타입·Zod·Query 옵션·MSW 및 클라이언트 내부 파일 19개를 생성했다.
- 일반 생성 index에서 Ky 클라이언트·SDK·타입·Zod·Query 옵션을 공개하도록 생성 설정을 보완했다.
- `@yapp-plus/api/generated/msw` 진입점을 추가했다. 일반 index에는 MSW export가 없다.
- 모든 생성 파일은 도구로 생성했다. 수동 fixture, worker와 앱 초기화는 아직 추가하지 않았다.

### 계약·재현성 검증

| 항목                  | 결과                                                           |
| --------------------- | -------------------------------------------------------------- |
| 명세 참조·operationId | 로컬 참조 전부 유효, operationId 중복 없음                     |
| 경로 변수             | 모든 URL 변수가 required path parameter로 선언됨               |
| 오류 응답             | 명세의 4xx/5xx 응답 130개가 ErrorResponse 참조                 |
| 운영진 인증           | 로그인·로그아웃 경로와 staffBearerAuth·userBearerAuth 확인     |
| 공지 수신자           | read 필수 Boolean, readAt 필수 nullable datetime, isRead 없음  |
| 세션 목록             | sessions 요소가 AdminSessionResponse 참조, 인증 토큰 필드 없음 |
| SDK 대응              | TypeScript AST에서 추출한 메서드·경로 48개가 원문과 일치       |
| MSW 대응              | 생성 factory의 핸들러 48개가 원문 메서드·경로와 일치           |
| 미구현 응답           | 임시 Node MSW 서버에서 48개 요청 모두 501 확인                 |
| 재생성                | 같은 입력으로 다시 생성한 19개 파일의 SHA-256 전부 일치        |
| node --run check      | 포맷·lint·typecheck·기존 테스트 267개 통과(23개는 캐시 재사용) |

추가 품질 확인: `node --run build`에서 admin·web 빌드와 Storybook 캐시 검증이 통과했다.
빌드 로그는 `.context/openapi-msw-stage-3-build.log`에 있다. `git diff --check`도 통과했다.

검증 스크립트는 `.context/verify-openapi-stage-3.mjs`, 파일별 해시는
`.context/openapi-msw-generated-hashes.json`, 전체 검사 로그는
`.context/openapi-msw-stage-3-check.log`에 있다. MSW 확인에는 `https://api.yapp.test`만 사용했고
실제 서버에 인증·데이터 API 요청을 보내지 않았다.

Zod의 int64 출력은 bigint이고 생성 DTO는 number다. SDK 자동 검증·변환 기본값은 변경하지 않았으며,
후속 fixture 검증에서는 파싱 성공 여부만 사용한다. 이 단계에서 대표 성공 응답·브라우저 worker·
테스트 전역 setup은 구현하지 않았다. 모바일 변경이 없어 expo:doctor는 실행하지 않았다.

### 3단계 리뷰 수정 — 자동 응답 예제 활성화

- 사용자 요청으로 `source: []`를 제거했다. 기본 source인 `@hey-api/examples`를 사용하며
  `responseFallback: 'error'`는 유지한다. 자동 응답이 없으면 501로 처리한다.
- 위 원문 snapshot으로 다시 생성했다. 예제 위치 46개는 스키마 속성 45개·요청 파라미터 1개이며,
  응답 전체 예제는 없다. 고정 도구는 필드 예제를 조합하지 않으므로 생성 파일 19개의 해시는
  수정 전과 동일하고 48개 기본 응답도 여전히 501이다.
- 임시 `.context/openapi-msw-example-probe.json`에 전체 응답 예제 유무가 다른 두 API를 만들고
  동일한 프로젝트 설정으로 `.context/openapi-msw-example-probe/`에 생성했다.
  Node MSW에서 예제 API는 200·예제 본문 일치, 예제가 없는 API는 501임을 확인했다.
  이 검증 입력은 실제 API 명세나 저장소의 생성물에 반영하지 않았다.
- 실제 생성물의 operation 대응·수신자 계약·일반 index의 MSW 제외·재현성 검증을 다시 통과했다.
- 계획·명세·공개 계약·실행 안내·후속 작업을 “자동 예제 활용 후 부족한 사례 보완”으로 맞췄다.
- `node --run check`가 통과했다. 포맷·lint·typecheck·기존 테스트 267개를 확인했으며 로그는
  `.context/openapi-msw-stage-3-examples-check.log`에 있다. `git diff --check`도 통과했다.
- 빌드는 다시 실행하지 않았다. 생성 코드가 이전 빌드 입력과 동일하고 앱·의존성·빌드 설정 변경은 없다.
  브라우저 실행과 대표 응답 구성은 여전히 후속 단계다.

## 4단계 — Faker·대표 응답·공용 핸들러

**일자**: 2026-10-26 | **상태**: 완료, 사용자 “다음 진행해”로 리뷰 승인

### 승인·변경

- 사용자 승인으로 3단계를 13c6286 (`feat(api): OpenAPI 클라이언트와 MSW 핸들러 생성`)에 커밋했다.
  Git hook의 포맷·lint·commitlint가 통과했고, 커밋 직후 작업 트리가 깨끗함을 확인했다. push는 하지 않았다.
- 사용자가 Faker 추가와 4단계 진행을 승인해 요구사항·계획·공개 계약과 작업 목록에 반영했다.
- Faker 10.6.0을 catalog와 API 패키지 dependencies에 추가했다. 기존 생성 도구 버전은 유지했다.
- 스키마 63개와 응답 168개(성공 38개·오류 130개)의 Faker factory를 생성했다.
  요청 operation factory는 생성하지 않았다. 기존 생성 파일 19개는 바뀌지 않고 Faker 파일 1개가 추가됐다.
- generated/faker와 mocks 공개 진입점을 추가했다. 일반 생성 index에는 Faker·MSW export가 없다.
- 공용 핸들러는 Faker 30개·대표 다섯 API·기타 204 세 개를 연결해 38개 성공 응답을 제공한다.
  Faker는 고정 seed·날짜의 독립 인스턴스로 호출하고 JSON 응답을 생성 Zod로 검증한다.
- 대표 응답은 운영진 로그인·로그아웃·세션 목록·이번 주 세션·공지 수신자다. 빈 시나리오도 제공한다.
- base URL 정규화와 대상 origin·경로 경계를 구현했다. 미등록 대상은 차단하고 외부 서비스는 제외한다.
- apps/admin의 계약 테스트만 파일 내부 Node server로 실행한다. 앱 초기화와 전역 Vitest setup은 유지했다.

### 검증·발견 사항

- 설치와 frozen-lockfile 설치가 통과했다. 신규 package version은 Faker 하나이며 기존 Vitest optional peer
  snapshot 중복은 pnpm이 정리했다. 모바일 manifest·lockfile importer는 변경되지 않았다.
- 첫 테스트는 아직 없는 mocks 공개 구현을 import할 수 없어 실패했다. 이후 구현과 검증으로 통과시켰다.
- Faker 기본 생성값의 int32 초과를 발견해 nameRules를 보완하고 재생성했다. 생성 파일은 직접 수정하지 않았다.
- Zod가 bigint로 변환한 출력 대신 검증 전 JSON을 사용한다. 잘못된 모의 응답은 501로 실패한다.
- MSW 콜백 print.error만으로는 미등록 요청이 차단되지 않았다. 초기 .test 주소의 DNS 실패를 발견한 뒤
  공개 오류 처리 함수로 수정했다. 최종 회귀 테스트는 MSW의 Cannot bypass 오류로 차단됨을 확인한다.
- 22개 계약 테스트가 통과했다. 대표 응답·빈 시나리오·재현성·override 복구·잘못된 데이터 거부·
  전체 48개 경로·base URL 검증·외부 경로 제외를 포함한다.
- 실제 서버에 인증·데이터 요청을 보내지 않았다. HTTP 검증 대상은 api.yapp.test이고 외부 테스트 요청도 MSW로 처리했다.
- 동일 입력으로 재생성한 20개 파일의 SHA-256이 모두 일치한다. 원문은 3단계와 동일한 snapshot이다.
  로컬 검증 스크립트는 `.context/verify-openapi-stage-4.mjs`, 해시는 `.context/openapi-msw-stage-4-generated-hashes.json`이다.

### 최종 품질 게이트

| 항목                           | 결과                                                                       |
| ------------------------------ | -------------------------------------------------------------------------- |
| node --run check               | 포맷·lint·typecheck·테스트 통과                                            |
| 테스트                         | admin 237(신규 22 포함), web 29, app-bridge 17·ui 6(캐시 재사용), 총 289개 |
| node --run build               | admin·web·Storybook 빌드 모두 통과                                         |
| pnpm install --frozen-lockfile | 통과                                                                       |
| 재생성                         | 20개 생성 파일의 SHA-256 일치                                              |
| git diff --check               | 통과                                                                       |

전체 검사와 빌드 로그는 `.context/openapi-msw-stage-4-check.log`,
`.context/openapi-msw-stage-4-build.log`, 개별 계약 테스트는 `.context/openapi-msw-stage-4-test.log`에 있다.

### 남은 범위·제한

- OAuth 리다이렉트 6개와 성공 응답 스키마가 비어 있는 출석 close·cancel·override·badge 4개는 501이다.
  임의로 응답 본문을 정하지 않았다. API가 서버에 구현되지 않았다는 뜻은 아니다.
- Faker 데이터의 도메인 관계는 보장하지 않는다. 대표 응답 외 CRUD 상태·필터·인증 검증은 구현하지 않았다.
- MSW 생성 factory만 직접 사용하면 Faker가 연결되지 않는다. 공용 createApiMockHandlers를 사용해야 한다.
- 브라우저 worker와 두 앱 초기화는 5단계, 전역 테스트 수명주기는 6단계다. 이 단계에서는 연결하지 않았다.
- 모바일 변경이 없어 expo:doctor는 실행하지 않았다. 프로덕션 번들·실제 브라우저의 상세 검증은 후속 단계다.

## 5단계 — 개발 브라우저 연결

**일자**: 2026-10-26 | **상태**: 완료, 사용자 리뷰 대기

### 승인·변경

- 사용자 “다음 진행해”로 4단계 리뷰와 5단계 착수를 승인받았다. 6단계는 착수하지 않았다.
- origin/main을 다시 fetch해 25c1b7e임을 확인했다. 현재 브랜치와 4단계 미커밋 변경을 유지했다.
- MSW 2.15.0 CLI로 두 public/mockServiceWorker.js를 생성하고 각 package.json에 workerDirectory를 기록했다.
  생성 파일은 직접 수정하지 않았다.
- 각 앱 browser.ts는 생성 client의 base URL과 공용 핸들러·미등록 요청 정책을 사용한다.
  시작 Promise를 공유하고 실패한 시작은 새로고침 전까지 유지한다.
- MockApiBoundary를 기존 Provider에 연결했다. SSR와 첫 클라이언트 렌더는 같은 준비 안내를 출력하고,
  worker 준비 후 자식을 마운트한다. 초기화 실패·잘못된 플래그는 자식을 마운트하지 않고 안내한다.
- 어드민 VITE_API_MOCKING, 웹 NEXT_PUBLIC_API_MOCKING은 미지정·false가 기본 비활성이다.
  true는 development에서만 동작하며 production·test에서는 무시한다. 각 .env.example과 Turbo dev.env에 반영했다.
- QueryClient 설정과 웹 safe-area effect를 유지했다. 전역 Vitest setup과 기존 화면 API 서비스는 변경하지 않았다.

### 검증

- 두 앱에 신규 테스트 각 15개를 추가했다. 준비 전 요청 방지, 실패, 미지정·false·잘못된 값,
  production·test 비활성, SSR 초기 마크업, 해제 후 완료, 동시 시작과 실패 Promise 재사용을 검증했다.
- StrictMode Provider 통합 테스트에서 실제 browser 모듈과 가짜 worker를 사용해 시작 1회와
  QueryClient staleTime 유지를 확인했다. 웹 safe-area 초기화·cleanup도 유지됨을 확인했다.
- 실제 Chromium에서 두 앱의 worker 등록 1회, 대표 다섯 API의 200·204, 미구현 응답 501을 확인했다.
  대상 API의 실네트워크 경로에 차단 장치를 두었으며 이 경로로 빠진 요청은 0건이다.
- 미등록 요청은 브라우저에서 MSW가 만든 HTTP 500 InternalError(Cannot bypass)로 종료된다.
  Node에서는 같은 정책이 Promise rejection으로 나타난다. 두 경우 모두 실서버로 전달되지 않는다.
- worker 등록 실패를 브라우저에서 주입해 오류 안내와 화면 차단을 확인했다. 정상 시작 시
  hydration·페이지 오류는 없었다. 어드민 대시보드와 웹 홈·하단 탐색, 키보드 초점,
  라이트·다크에서 가로 넘침이 없음을 확인했다. 모바일 WebView 실기기 검증은 범위 밖이다.
- node --run check 통과: admin 252, web 44, app-bridge 17·ui 6(캐시 재사용), 총 319개 테스트.
- node --run build로 admin·web·Storybook 빌드를 확인했다. 프로덕션 실행 번들의 상세 배제 검증은 7단계에 남긴다.
- 모바일 설정·의존성을 변경하지 않아 expo:doctor는 실행하지 않았다.

검증 로그는 .context/openapi-msw-stage-5-check.log, .context/openapi-msw-stage-5-build.log,
.context/openapi-msw-stage-5-browser.log에 있다. 브라우저 재검증 스크립트는
.context/check-stage-5-browser.mjs이며 실행 환경에 이미 설치된 Playwright와 Chromium을 사용했다.
검증용 의존성은 프로젝트에 추가하지 않았다. 화면 기록은 .context/openapi-msw-stage-5-admin.png와
.context/openapi-msw-stage-5-web.png다.

### 복구·남은 범위

플래그를 false로 바꾸고 개발 서버를 재시작한 뒤 페이지를 새로고침하면 기존 화면을 바로 사용한다.
브라우저 모킹은 클라이언트 요청에만 적용하며 SSR 요청은 범위 밖이다. 기존 화면을 생성 SDK로
전환하는 작업도 포함하지 않는다. 전체 CRUD 상태·OAuth redirect·미정의 응답의 한계는 4단계와 같다.

## 다음 단계

5단계 개발 브라우저 연결을 리뷰받는다. 현재 4·5단계 변경은 커밋하지 않았다.
승인 후 6단계에서 기능 테스트용 Node server와 Vitest 공통 수명주기만 연결한다.

## 5단계 리뷰 수정 — 모킹 전용 테스트 제거

사용자 “그렇게 수정해”에 따라 api-contract 테스트 1개와 두 앱의 browser·mock-api-boundary·
providers 테스트 6개를 제거했다. 해당 테스트만 사용하던 deferred 보조 파일 2개도 제거했다.
제거한 테스트 사례는 총 52개다. 위의 4·5단계 테스트 결과는 제거 전 검증 이력이며,
현재 유지하는 테스트 수와 구분한다.

모킹 런타임·생성 코드·응답의 Zod 검증·브라우저 초기화는 변경하지 않았다.
요구사항·계획·작업 목록·실행 안내를 함께 수정했다. 6단계 T026~T028은 취소하고,
T024·T025·T029의 Node server·공통 수명주기·기존 기능 테스트 확인만 남겼다.
실제 기능별 성공·오류 검증은 해당 기능 구현 시 작성한다. 6단계 구현이나 commit·push는 하지 않았다.

수정 후 node --run check가 통과했다. 기존 테스트 267개(admin 215, web 29, app-bridge 17,
ui 6)가 통과했으며 app-bridge·ui는 캐시를 재사용했다. 로그는
.context/openapi-msw-stage-5-review-check.log에 있다. git diff --check도 통과했다.
이번 수정은 테스트 삭제와 문서 변경뿐이므로 빌드·브라우저 검증은 재실행하지 않았으며,
런타임이 동일한 5단계의 기존 통과 기록을 유지한다.
