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

**일자**: 2026-10-26 | **상태**: 생성·계약 검증 완료, 사용자 리뷰 대기

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

## 다음 단계

3단계 생성물·공개 진입점·검증 결과를 사용자에게 리뷰받는다.
명시적 승인 후에만 4단계 대표 응답·공용 핸들러 구성에 착수한다.
리뷰 수정은 3단계 범위에서 반영하며 현재 생성물은 아직 커밋하지 않았다.
