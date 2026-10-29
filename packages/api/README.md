# `@yapp-plus/api`

어드민과 회원 웹은 같은 백엔드 OpenAPI에서 생성한 API 계약을 사용합니다.
Ky 클라이언트·SDK·타입·Zod·TanStack Query 옵션·MSW 핸들러·Faker factory를 한 번에 생성합니다.
모든 명령은 저장소 루트에서 실행합니다.

## 설치와 재생성

```sh
mise exec -- pnpm install --frozen-lockfile
OPENAPI_INPUT=https://44nk4mnqi7.execute-api.ap-northeast-2.amazonaws.com/v3/api-docs \
  mise exec -- pnpm --filter @yapp-plus/api generate
mise exec -- node --run check
```

`OPENAPI_INPUT`에는 URL 또는 로컬 명세 파일 경로를 지정합니다. 같은 입력으로 재현성을 확인할 때는
명세를 한 번 내려받아 `.context/`에 보관하고 그 파일을 사용합니다. 별도의 수동 OpenAPI를 유지하지 않습니다.
출력은 [src/generated](src/generated)에 저장됩니다. 생성 파일은 직접 수정하지 않고
[생성 설정](openapi-ts.config.ts) 또는 백엔드 명세를 수정한 뒤 재생성합니다.

재생성 후 SDK·타입·스키마 diff와 [공용 핸들러](src/mocks/handlers.ts)의 operation 연결을 확인합니다.
새 operation의 Faker factory가 생겨도 공용 핸들러에 자동 연결되지는 않습니다.
명세의 operationId 변경은 생성 함수명에 영향을 줄 수 있습니다.

SDK 요청·응답 검증과 응답 변환은 기본적으로 비활성화되어 있습니다.
`HEY_API_SDK_VALIDATION=true`를 함께 설정해 생성하면 SDK 검증을 활성화할 수 있으나 응답 변환은
계속 비활성입니다. 현재 Zod의 int64 파싱 결과는 bigint이고 생성 TypeScript 타입은 number이므로,
검증 옵션 변경 시 소비 코드를 함께 확인해야 합니다. 공용 모의 응답의 Zod 검증은 이 옵션과 별개로 항상 수행합니다.

## 공개 진입점

| 진입점                           | 용도                                             |
| -------------------------------- | ------------------------------------------------ |
| `@yapp-plus/api/generated`       | client, SDK, 타입, Zod, Query 옵션               |
| `@yapp-plus/api/generated/msw`   | 생성된 `handle*` 함수와 `createMswHandlers`      |
| `@yapp-plus/api/generated/faker` | 생성된 `fake*` factory                           |
| `@yapp-plus/api/mocks`           | `createApiMockHandlers`, `onUnhandledApiRequest` |

일반 `generated` 진입점에는 Faker·MSW·고정 응답을 export하지 않습니다.
제품 코드는 SDK를 사용하고, 모킹 진입점은 개발 초기화나 테스트에서만 사용합니다.
현재 이번 주 세션 조회 함수는 `find2`이며, 실제 API 경로는 생성 SDK의 주석에서 확인할 수 있습니다.

```ts
import { find2 } from '@yapp-plus/api/generated';

const { data } = await find2({ throwOnError: true });
```

## 모의 응답 구성

두 앱은 `createApiMockHandlers(baseUrl)`로 같은 응답을 사용합니다.
base URL은 인증 정보·query·hash가 없는 절대 HTTP(S) URL이어야 합니다.
브라우저는 생성 client 설정의 URL, Vitest는 `https://api.yapp.test`를 사용합니다.

- [fixtures.ts](src/mocks/fixtures.ts): 운영진 로그인·세션 목록·이번 주 세션·공지 수신자와 빈 결과
- [handlers.ts](src/mocks/handlers.ts): Faker 연결, 고정 응답 선택, 204, Zod 검증과 요청 차단
- `createApiMockHandlers(baseUrl, { scenario: 'empty' })`: 대표 목록을 비우고 이번 주 session을 null로 반환

Faker는 요청마다 seed 107과 기준 날짜 `2026-10-26T00:00:00Z`의 독립 인스턴스를 사용합니다.
대표 응답 외 데이터의 도메인 관계, CRUD 저장 상태, 실제 인증·권한·필터·페이지네이션은 재현하지 않습니다.
날짜는 오늘을 따라 바뀌지 않습니다. 시간에 민감한 화면은 필요한 응답으로 덮어씁니다.

공용 핸들러에 연결한 Faker·고정 응답이 우선하며, 연결하지 않은 API는 명세의 전체 응답 예제 또는
501을 반환합니다. Hey API 0.99.0의 MSW 플러그인은 Faker factory를 자동 호출하지 않습니다.
필드 단위 example만으로는 전체 응답이 만들어지지 않으며, 생성 핸들러만 직접 쓰면 공용 응답이 연결되지 않습니다.

2026-10-29 입력으로 기존 48개 operation을 갱신했으며 그중 38개에 성공 응답이 연결되어 있습니다.
신규 11개 operation은 #198의 기능군별 재생성 PR에서 순차 반영합니다. OAuth redirect 6개와
성공 응답 스키마가 비어 있는 출석 close·cancel·override·badge 4개는 501입니다.
이는 백엔드 미구현 여부가 아니라 프런트엔드의 모의 응답 제공 범위입니다.

## 응답 추가와 변경

1. 생성 타입·Faker factory·Zod 스키마·MSW operation 이름을 확인합니다.
2. 일반 응답은 `handlers.ts`의 `factory.all({ pick: ... })`에 `fakerResponse(factory, schema, status)`로 연결합니다.
   기본 상태는 200이므로 생성 API처럼 201인 경우 명시합니다.
3. 의미 관계가 필요한 데이터는 `fixtures.ts`에서 생성 타입의 `satisfies`로 확인하고,
   `fixedResponse`와 해당 Zod 스키마로 연결합니다. 본문 없는 204는 `new HttpResponse(null, { status: 204 })`를 사용합니다.
4. 타입 검사와 개발 브라우저에서 응답을 확인합니다. 생성 코드는 수정하지 않습니다.

공용 JSON 응답은 Zod 검증 실패 시 501로 처리합니다. bigint 변환 결과를 JSON으로 직렬화하지 않도록
검증에 성공한 원래 데이터를 반환합니다. 스키마 자체가 잘못됐다면 fixture로 숨기지 말고 명세를 수정합니다.

## 기능 테스트에서 응답 변경

두 앱의 Vitest setup이 서버 시작·테스트별 핸들러 초기화·종료를 관리합니다.
테스트마다 생성 client의 base URL을 `https://api.yapp.test`로 설정합니다.
테스트 파일에서는 해당 앱의 `src/mocks/server.ts`에서 `server`와 `apiBaseUrl`을 상대경로로 import합니다.
별도 서버를 시작하거나 브라우저 모킹 플래그를 켜지 않습니다.

아래는 import한 server를 사용해 기존 기능 테스트 안에서 이번 주 세션을 비우는 예시입니다.
공용 타입과 생성 핸들러를 쓰므로 API 경로를 다시 작성할 필요가 없습니다.

```ts
import type { CurrentWeekSessionResponse } from '@yapp-plus/api/generated';
import { handleFind2 } from '@yapp-plus/api/generated/msw';

const emptyWeek = {
  weekStartDate: '2026-10-25',
  weekEndDate: '2026-10-31',
  session: null,
} satisfies CurrentWeekSessionResponse;

server.use(handleFind2({ body: emptyWeek }, { baseUrl: apiBaseUrl }));
```

생성 핸들러에는 테스트용 `baseUrl`을 명시해야 합니다. 생략하면 명세의 서버 주소를 사용합니다.
`server.use` 변경은 테스트 종료 후 `resetHandlers`로 제거됩니다. 직접 만든 override는 공용 핸들러의
Zod 검증을 거치지 않으므로 생성 타입을 사용하고, 필요할 때 해당 스키마로 검증합니다.
제품의 성공·오류 동작은 기능 테스트에서 확인하며 모킹 자체의 전용 테스트는 두지 않습니다.

## 실패 처리와 사용 범위

- 미구현 응답·잘못된 모의 데이터: 501. handler 연결, 데이터와 생성 스키마를 확인합니다.
- 대상 origin·base 경로의 미등록 `/api/` 요청: 실서버로 보내지 않습니다. 브라우저는 MSW 오류 500,
  Node에서는 `Cannot bypass` 오류로 나타납니다. 외부 서비스·정적 자원은 차단 대상이 아닙니다.
- 브라우저 초기화 실패: 화면을 열지 않습니다. worker 파일과 개발 서버를 확인한 뒤 새로고침합니다.
- 범위: 개발 브라우저·Vitest. SSR 요청·route loader·네이티브·WebView 실기기·Storybook은 포함하지 않습니다.
  기존 화면의 직접 mock 서비스를 생성 SDK로 전환하는 작업도 별도입니다.

앱별 실행과 worker 갱신은 [어드민](../../apps/admin/README.md), [회원 웹](../../apps/web/README.md)을 참고합니다.
