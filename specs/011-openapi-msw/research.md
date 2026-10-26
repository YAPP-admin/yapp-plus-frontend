# 조사와 결정

**작성일**: 2026-10-26 | **상태**: 1단계 조사 기록

## 기존 도구를 유지한다

- 결정: Hey API 0.99.0의 MSW 플러그인과 MSW 2.15.0을 사용한다.
- 근거: 이전 조사에서 고정 버전 npm 배포물의 플러그인 구현·타입과 MSW 2.15.0 배포일을 확인했다.
  0.99.0은 `createMswHandlers`, `pick`, `all`, 응답의 `body`를 사용한다. 최신 웹 문서의
  `getAllMocks`, `result`, `onMissingMock` 예제를 그대로 복사하지 않는다.
- 대안: Orval 등으로 생성 도구를 바꾸거나 핸들러를 전부 수동 작성하면 현재 구성과 계약을 중복한다.
- 제한: 실제 명세로 생성·컴파일하는 검증은 3단계다. 지금 실행 성공을 보장한 것으로 기록하지 않는다.
- 출처: [Hey API MSW](https://heyapi.dev/docs/openapi/typescript/plugins/msw),
  [고정 버전 메타데이터](https://registry.npmjs.org/@hey-api/openapi-ts/0.99.0),
  [MSW 고정 버전](https://registry.npmjs.org/msw/2.15.0).

## 자동 생성과 응답 데이터를 분리한다

- 결정: 전체 operation의 handler factory를 생성하되 수동 데이터는 다섯 대표 API에 한정한다.
- 이유: 스키마만으로 실제 인증·상태 전이·읽음 정책을 재현할 수 없다. 사용자는 생성·실행 기반을 선택했다.
- 대안: 모든 응답을 임의 데이터로 채우거나 기존 화면의 직접 mock 저장소를 교체하는 것은 범위 밖이다.
- 수정 결정: 3단계 리뷰 요청에 따라 `source: []`를 제거하고 기본 `@hey-api/examples`를 사용한다.
  명세의 응답 예제를 활용하고, 자동·수동 응답이 모두 없을 때만 501을 반환한다.
  logout 204와 부족한 대표 응답·특정 사례는 다음 단계에서 보완한다.

## 개발 모드는 선택적으로 켠다

- 결정: 앱별 환경 변수와 개발 환경을 모두 확인하며 worker 준비 뒤 자식 화면을 렌더한다.
- 이유: 현재 어드민 login·sessions는 HTTP를 호출하지 않는다. MSW 설치만으로 화면 연결이 바뀌지 않는다.
  일반 모드의 SSR는 유지하고 opt-in 모드만 준비 화면을 사용한다.
- 대안: SDK의 모든 요청을 별도 wrapper로 감싸거나 서버 요청까지 가로채는 추상화는 추가하지 않는다.
- 출처: [MSW 브라우저 초기화](https://mswjs.io/guides/integrations/browser),
  [MSW Node 통합](https://mswjs.io/guides/integrations/node).

## 현재 저장소와 명세 기준

- 현재 API 생성 설정에는 Ky·TypeScript·Zod·SDK·TanStack Query가 있으며 소비 화면은 아직 연결되지 않았다.
- 두 앱은 Vitest·happy-dom을 사용하고 setup에는 cleanup이 있다. 신규 테스트 도구는 추가하지 않는다.
- 원격 main은 27커밋 앞선 상태다. API 설정은 같고 Ky catalog 전환은 있으나 버전은 동일하다.
- [배포 명세](https://44nk4mnqi7.execute-api.ap-northeast-2.amazonaws.com/v3/api-docs)는 앞선 조회에서
  48 operation·62 schema, `read` 필수 Boolean·`readAt` 필수 nullable, `AdminSessionResponse` 참조를 확인했다.
- 이번 단계의 재조회는 두 번 시간 초과했다. 이전 성공 결과와 현재 응답 확인을 구분하고,
  3단계 생성 직전에 원문을 다시 확인한다. 서버 변경을 추정해서 타입을 작성하지 않는다.

## 실행 제약

- 1단계에는 node_modules가 없었다. 2단계 승인 후 설치와 frozen lockfile 검증을 완료했다.
- `.specify/extensions.yml`과 template override는 없다. 기본 Spec Kit 템플릿과 로컬 feature 포인터를 사용한다.
- 헌법 파일은 빈 템플릿이다. AGENTS.md를 실제 원칙으로 사용하고 헌법을 임의로 채우지 않는다.

## 2단계 설치 정책 확인

- MSW 2.15.0의 배포된 postinstall은 msw.workerDirectory가 있을 때 CLI로 worker를 복사한다.
  컴파일 과정은 아니므로 자동 실행을 끄고 5단계에서 CLI로 worker를 생성한다.
- pnpm이 추가한 미검토 placeholder 대신 `allowBuilds`에 `msw@2.15.0: false`를 명시했다.
  전역 보호 설정은 유지한다. 고정 버전 변경 시 이 결정을 재검토한다.
- [pnpm allowBuilds 문서](https://pnpm.io/settings/build#allowbuilds)의 패키지·버전별 실행 정책을 따른다.
- 기존 모바일 expo-modules-core의 react-native-worklets peer 범위 경고가 있다.
  모바일 manifest와 lockfile importer는 변경하지 않았으며 MSW 관련 peer 경고는 없다.

## 3단계 생성 확인

- 배포 명세 재조회에 성공했으며 이번 입력은 48 operation·63 schema다. 원문 해시와 검증은
  [validation.md](validation.md)의 3단계 기록을 기준으로 한다.
- 고정 생성 도구의 기본 index는 SDK·타입만 공개한다. 계획한 공개 계약을 충족하도록 Ky·Zod·Query의
  includeInEntry를 true로 설정했다. MSW는 별도 진입점으로 유지한다.
- Zod 생성기는 int64를 z.coerce.bigint()로 검증하지만 TypeScript DTO는 number로 생성한다.
  기존 SDK validator와 transformer 기본값은 비활성으로 유지했다. 이후 fixture 검증에서는 safeParse의
  성공 여부를 확인하고, 변환된 출력으로 JSON 응답을 만들지 않는다. SDK 자동 검증을 켜려면 먼저
  이 숫자 변환 정책과 타입 일치를 별도로 검토해야 한다.

## 3단계 리뷰 수정 — 명세 예제 활용

- 사용자 “그렇게 진행해” 승인으로 예제 생성을 차단하던 source 설정을 제거했다.
- 설치된 Hey API 0.99.0의 MSW 기본 source는 `@hey-api/examples`다. 이 구현은 성공 응답의
  스키마 example을 사용하며, 하위 필드 example들을 모아 완성된 응답 객체를 만들지는 않는다.
- 3단계 원문에는 예제 위치 46개(스키마 속성 45개·요청 파라미터 1개)가 있으나 응답 전체 예제가 없다.
  따라서 설정 변경 후 실제 생성물은 동일하다. 예제 활용 설정이 꺼져 있어서 생긴 결과와 구분한다.
- 별도의 임시 검증 명세로 같은 설정을 실행해 전체 응답 예제는 200과 예제 본문을 반환하고,
  예제가 없는 응답은 501을 반환하는 것을 확인했다. 검증 명세는 `.context/`에만 두었고
  실제 API 원문·생성물을 보정하는 데 사용하지 않았다.
