# 조회·인증·화면 계약

## HTTP와 검증

| 화면 | SDK   | GET 경로                          | 검증                               |
| ---- | ----- | --------------------------------- | ---------------------------------- |
| 홈   | find3 | /api/sessions/current-week        | zCurrentWeekSessionResponse        |
| 일정 | find4 | /api/generations/current/sessions | zCurrentGenerationSessionsResponse |

SDK·스키마는 `@yapp-plus/api/generated`에서 가져온다. 서버 또는 생성 코드의 변경은 없다.
화면은 생성 queryOptions를 useSuspenseQuery에 전달한다. SDK의 throwOnError: true를 사용하며 HTTP client는 throwHttpErrors: false로 오류 본문을 SDK에 전달한다.
HTTP client는 retry.limit 1과 shouldRetry: false로 일반 자동 재시도를 막고 401 훅의 ky.retry만 허용한다. 해당 query retry는 false로 지정한다. 실패한 데이터는 Query가 성공으로 저장하지 않도록 오류로 전달한다.
외부 응답은 검증 후 사용한다. 200이라도 스키마·날짜·시간 검증 실패는 오류이며 [] 또는 null로 바꾸지 않는다.
AbortSignal을 HTTP 요청에 전달한다. 인증 값은 요청별 옵션으로만 전달하고 전역 client.setConfig에 저장하지 않는다.

## HTTP client의 인증 interceptor

1. 화면은 Provider의 apiOptions를 생성 queryOptions에 전달한다. 생성 queryFn이 AbortSignal을 SDK에 전달하며 별도 인증 조회 래퍼는 만들지 않는다.
2. 생성 SDK에 access token과 signal을 전달한다. 취소된 요청의 결과를 사용하지 않는다.
3. HTTP client의 afterResponse 훅에서 GET의 첫 401이면 `refreshSession({ sessionId, tokenVersion })`을 기존 브리지로 호출한다.
4. 전달받은 세션과 같은 신원의 SIGNED_IN이며 토큰 버전이 낮아지지 않았을 때만 새 토큰으로 재시도한다.
5. 원래 Request의 헤더·취소 신호를 유지하고 새 token으로 ky.retry를 한 번 실행한다. retryCount가 0일 때만 갱신하므로 두 번째 401과 403은 추가 갱신 없이 종료한다.
6. 다른 로그인·SIGNED_OUT·WITHDRAWN이면 이전 요청을 종료한다. Provider의 갱신 토큰 반영은 인증 작업의 기존 경로에 연결한다.

웹은 refresh token에 접근하거나 서버 갱신 endpoint를 호출하지 않는다. native의 single-flight와 요청 버전 비교를 재사용한다.
동시 조회마다 브리지 호출은 가능하나 실제 native 갱신 횟수를 웹에서 임의 구현으로 제어하지 않는다.
취소/로그인 세션 변경 후에는 재시도·캐시 기록·화면 안내를 하지 않는다. 최종 401에는 재로그인 안내를 제공한다.
권한 부족은 로그인 계정 전환으로 가장하지 않으며 네이티브 로그아웃 API를 자동 호출하지 않는다.

## 인증 작업과의 연결

main #329의 applyAccountBoundary를 사용해 모든 업무 query와 업무 mutation을 제거한다.
인증 제어 query와 진행 중 인증 mutation은 유지하고, 완료된 인증 mutation은 제거한다.
queryClient.clear()로 전체 cache를 제거하는 구현은 아니다.
확정 인증 전환 지점, 늦은 인증 응답 차단, 이전 화면 제거는 인증 작업 #329와 연결한다.
이 조회 작업에서는 별도 provider·결과 적용기·Stackflow 경계를 만들지 않는다.
확정된 계정 경계에서 진행 중인 업무 query를 취소한 뒤 업무 cache를 제거한다. Provider 값 변경만으로 기존 요청이 취소되는 것은 아니다.
자동 통합 검증과 실제 WebView 검증을 구분하며, 실환경 검증 전에는 계정 격리의 출시 검증을 완료 처리하지 않는다.

## 갱신과 복귀

- 사용자 리뷰에 따라 홈·일정·native 세션 query의 동시 실행을 허용한다. 웹에서 순차 실행하거나 갱신 Promise를 별도로 관리하지 않는다.
- 업무 query는 앱 기본 staleTime 30초와 mount/focus/reconnect 재조회 기본값을 사용한다. true는 stale 데이터만 재조회한다.
- 정상 SIGNED_IN·SIGNED_OUT·WITHDRAWN 세션은 focus에서 always로 재확인한다. 인증 진행·가입 대기·미지원 상태는 강제 재조회하지 않는다.
- 복구 가능한 세션 오류는 기존 5초 stale·복구 간격을 유지한다. 온라인 복구도 이 정책을 따르며 숨김 상태에서는 재조회하지 않는다.
- 401은 native single-flight·요청 버전 비교로 복구한다. 계정 전환·늦은 응답 차단은 기존 인증 경계를 사용한다.
- 별도 visibility/pageshow 이벤트 listener, 복귀 Suspense 대기, query 일괄 취소는 추가하지 않는다. BFCache 이전 화면 비노출은 보장하지 않으며 별도 검증 대상으로 둔다.
- 한국 주간이 바뀌면 다음 화면 진입·focus 복귀에서 홈의 주간 데이터를 다시 조회한다. 주간 갱신용 타이머는 두지 않는다.

## 화면과 개발 모드

- / 및 /schedule 경로와 TabLink 탐색을 유지한다. 홈 바로가기 이름은 `전체 세션 확인하기`다.
- 홈은 server name과 주간 범위를 표시하고 type/endTime/출석 완료를 만들어내지 않는다.
- 일정은 server 순서, REGULAR 칩, null 장소 `-`, 종료 일정의 기존 흐림을 유지한다.
- 기존 내용이 있는 재조회 오류는 별도 안내하고, 재시도 버튼은 요청 중 중복 실행을 막는다.
- 실서비스의 출석/팀 인증/출결보고는 disabled와 인접 준비 중 안내를 제공하고 유도 tooltip은 표시하지 않는다.
- 모의 전환·URL 상태·성공 이동은 DEV이면서 VITE_API_MOCKING=true일 때만 활성화한다.
- 일반 브라우저 비목업에서는 두 조회를 disabled로 유지하고 앱 이용 안내를 보여준다. 신규 로그인은 구현하지 않는다.
- MSW 고정 데이터는 실제 자격을 포함하지 않는다. 정상 응답은 생성 faker의 날짜·시간만 보정하고 빈 결과·오류·지연·401은 테스트별 override를 사용한다.
