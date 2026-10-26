# API 생성과 모킹 공개 계약

## 공개 진입점

| 진입점                       | 공개 내용                                     | 소비자             |
| ---------------------------- | --------------------------------------------- | ------------------ |
| @yapp-plus/api/generated     | Ky SDK·타입·Zod·Query 옵션                    | 앱의 실제 API 호출 |
| @yapp-plus/api/generated/msw | Hey API가 생성한 MSW 함수·타입                | 개발 모킹·테스트   |
| @yapp-plus/api/mocks         | createApiMockHandlers와 onUnhandledApiRequest | 두 앱의 초기화     |

기존 기본 진입점을 없애지 않는다. 일반 생성 index에서 MSW 모듈과 수동 fixture를 export하지 않는다.
수동 응답은 패키지 내부에서 관리하고 테스트에서 필요한 응답 변경은 생성 factory로 제공한다.

## 수동 구성 함수

- `createApiMockHandlers(baseUrl: string): HttpHandler[]`: 절대 HTTP(S) URL을 검증하고 끝 slash를
  정규화한다. 그 API URL에만 일치하는 전체 handler를 구성하고 대표 다섯 응답을 덮어쓴다.
- `onUnhandledApiRequest(baseUrl: string)`: 같은 API origin·base 경로 아래 `/api/` 요청이 미등록이면
  MSW의 오류 처리를 호출해 network passthrough를 막는다. 다른 origin·정적 자원은 통과시킨다.
- 빈 값·상대 URL·지원하지 않는 protocol은 초기화 오류로 처리한다. 환경 입력을 타입 단언하지 않는다.
- 테스트는 `https://api.yapp.test`, 브라우저는 생성 클라이언트 설정의 base URL을 명시적으로 넘긴다.
- MSW의 기본 wildcard base URL에 의존하지 않는다. 동일 경로의 외부 서비스까지 가로채지 않는다.

## 대표 operation

| 메서드 | 경로                                                            | 기본 응답               |
| ------ | --------------------------------------------------------------- | ----------------------- |
| POST   | /api/admin/auth/sessions                                        | 가상 운영진 로그인 성공 |
| DELETE | /api/admin/auth/sessions/current                                | 204                     |
| GET    | /api/admin/generations/{generationId}/sessions                  | 세션 목록               |
| GET    | /api/sessions/current-week                                      | 이번 주 세션            |
| GET    | /api/admin/generations/{generationId}/posts/{postId}/recipients | 읽음·미열람 목록        |

나머지 알려진 operation은 501이다. 미등록 경로는 오류로 차단한다. 기본 성공 응답은 인증 검증이나
실제 서버의 필터·페이지네이션·권한 정책을 구현했다는 뜻이 아니다. 테스트가 필요한 조건을 override한다.
본문 없는 응답은 `HttpResponse(null, { status: 204 })` resolver로 명시한다.

## 환경 변수와 실행

- `VITE_API_MOCKING`, `NEXT_PUBLIC_API_MOCKING`: 미지정·false는 비활성, true는 활성 요청이다.
- 활성 요청이어도 development가 아니면 비활성이다. Vitest는 브라우저 worker 대신 Node server를 쓴다.
- 환경 값은 `.env.example`에 false로 기록하고 Turbo dev 환경 전달 목록에도 반영한다.
- worker 초기화 실패·준비 중에는 자식 화면을 열지 않는다. SSR 데이터 요청 차단은 이 계약에 포함하지 않는다.

## 생성 입력과 변경

`OPENAPI_INPUT`에 URL 또는 로컬 경로를 넘긴다. 실제 명세를 한 번 읽어 동일 입력으로 생성하며,
검증용 snapshot은 `.context/`에 둘 수 있다. 별도의 수동 OpenAPI를 저장소에 유지하지 않는다.
operation 이름과 타입은 생성 결과를 사용하며 새 naming 규칙이나 wrapper SDK를 도입하지 않는다.
계약 오류는 명세·생성 설정·도구에서 해결하고 생성 파일의 직접 수정으로 숨기지 않는다.
