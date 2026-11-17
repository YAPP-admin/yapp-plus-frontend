# 검증 기록: 코드 출석과 사전 보고

코드 출석의 기존 실행 기록을 보존한다. 이 기록은 이번 사전 보고의 구현·검증 결과가 아니다.
사전 보고 1단계 문서 갱신 결과는 마지막 절에 별도로 기록한다.

## 기존 코드 출석 1단계

- 이슈: [#385](https://github.com/YAPP-admin/yapp-plus-frontend/issues/385). 사전 출결 보고는 리뷰 후 별도로 구현한다.
- Android 기준은 `develop`의 `2b837e3c`이며 2026-11-08 KST 커밋을 제외했다. 심사 빌드의 SHA는 확인되지 않았다.
- 회귀 검증: 구현 전 홈 테스트 4개 실패, 구현 후 통과했다.
- `mise exec -- node --run check`: 통과. 웹 lint·typecheck·테스트 314개를 새로 실행했다. 다른 패키지 lint 6개·typecheck 6개·test 4개 작업은 Turbo 캐시를 사용했다. 포맷 검사는 새로 실행했다.
- `mise exec -- node --run build`: 통과. 웹 빌드는 새로 실행했고 admin·storybook 2개 작업은 캐시를 사용했다. 웹 500 kB 청크 경고는 남아 있다.
- 입력·붙여넣기·Enter·오류 접근성 속성, 실제 요청 본문·인증, 실패 응답·401·응답 유실, 중복·오프라인·대상 변경·계정 변경·화면 이탈을 MSW/Vitest로 검증했다.
- 실제 브라우저 자동화는 연결 오류로 실행하지 못했다. 화면 캡처·VoiceOver·iOS 키패드/터치·safe-area·실서버 출석은 미검증이다. 실제 화면과 인증 만료 후 네이티브 토큰 갱신은 테스트 계정으로 추가 확인해야 한다.
- 완료 표시는 계정별 메모리 상태이므로 앱을 다시 시작하면 사라진다. 성공 후 조회 실패가 서버 출석을 취소하지는 않는다.
- 변경량: `origin/main`과의 merge-base `0ec55581` 대비 새 파일 포함 추가 759줄·삭제 38줄, 합계 797줄이다.
- 650줄에서 분리를 검토했다. 코드 출석까지 첫 리뷰 단위로 제한하고 사전 보고는 후속 PR로 분리한다. 커밋·푸시·PR 생성은 수행하지 않았다.
- 복구: 이 단계의 화면·API 연결을 되돌려 출석 버튼을 준비 중으로 복원한다. 이미 기록된 서버 출석은 삭제하지 않는다.
- 리뷰 반영: 제출 훅의 AbortController·useRef를 제거하고 mutation 상태·완료 콜백으로 대체했다. 화면 숨김 회귀를 추가했다. `confirmationOptions`를 제거하고 생성된 `verifyMutation` 성공 결과로 완료 상태를 관리한다. 화면 이탈 후 같은 계정의 성공 보존·계정 변경 격리·앱 재시작 초기화를 확인했다.

## 구조 수정 후 검증 및 로컬 분리

- `useSuspenseQuery`·인증 경계·Suspense/ErrorBoundary와 TanStack Form의 코드 필드·제출 후 수정 검증을 적용했다. 생성 `verifyMutationKey`에 계정 범위를 덧붙이며 수동 작업 식별 키를 제거했다.
- `mutationKeys: true`로 동일 OpenAPI 입력을 재생성했다. 설정과 생성 키·공개 export만 변경되며 SDK·조회 옵션·응답 계약 변경은 없다. API lint·typecheck를 새로 실행해 통과했다.
- 최종 `node --run check`: 통과. 포맷, 웹·관리자 lint, API·웹·관리자·모바일 typecheck, 웹 316개·관리자 658개·모바일 150개 테스트를 새로 실행했다. lint 5개·typecheck 3개·test 2개 작업은 Turbo 캐시를 사용했다. 첫 검사에서 발견한 lint 오류는 수정 후 재검증했다.
- 최종 `node --run build`: 통과. 웹은 새로 빌드했고 관리자·Storybook은 캐시를 사용했다. 관리자는 이번 작업의 직전 빌드에서도 새로 실행해 통과했다. 500 kB 청크 경고는 남아 있다.
- 최초 조회 대기·실패·재시도와 네 자리 Form 검증의 제출/수정 시점을 추가했다. 출석 인접 테스트 15개와 기존 계정 변경·화면 숨김·중복 제출 회귀가 통과했다.
- 브라우저 도구가 탭 생성 시 `Cannot read properties of undefined (reading 'timeoutMs')`로 실패했다. 화면 캡처·VoiceOver·실기기 키패드/터치·실서버 검증은 수행하지 못했다.
- 로컬 분리: `origin/main` → `DongjaJ/attendance-spec`(252줄) → `DongjaJ/attendance-api-keys`(252줄) → 기존 `DongjaJ/7al70`(추가 673줄·삭제 98줄, 합계 771줄). 각 화살표는 PR base/head를 나타낸다. 명세 PR의 merge-base는 `0ec55581`이며 최신 main의 공지 변경은 합치지 않았다. push·PR 생성은 하지 않는다.
- 완료 Activity의 접근 차단, 홈 성공 상태 공유, 제출 중 닫기·`useIsMutating`, 서버 오류별 복구 UI 제안은 보류했다. 사전 출결 보고는 첫 단계 리뷰 후 진행한다.
- 최신 리뷰 반영: 제출은 Activity의 `mutation.isPending`과 TanStack Form으로 관리하고 시트 닫기를 차단했다. 전역 pending 조회·닫힘 감시 Effect·초기 세션 ID state·출석 전용 계정 검사를 제거했다. `check`·`build` 통과: 웹 lint·typecheck·316개 테스트·빌드는 새 실행, 나머지 lint 6개·typecheck 6개·test 4개·build 2개 작업은 캐시 재사용이다. 실기기·실서버 검증은 미실행이며 홈 성공 결과 공유 방식은 후속 결정한다. 생성 키 브랜치 대비 추가 695줄·삭제 104줄, 합계 799줄이고 이번 수정은 아직 커밋·push하지 않았다.
- 조회 경계 리뷰 반영: QueryBoundary를 분리해 출석 시트·홈 카드에 적용했고 mutateAsync를 mutate로 바꿨다. 시트의 로그인 상태 중복 검사를 제거하되 일반 브라우저 제한은 유지한다. 웹 316개 테스트를 포함한 check와 build가 통과했고 웹 작업만 새로 실행했다. 이 추가 리팩터링은 800줄 제한에 따라 출석 PR 이후의 별도 리뷰 단위로 준비하며 아직 커밋·push하지 않는다.
- 제출 책임 리뷰 반영: 제출 직전 fetchQuery·세션 재검사·토큰 재조회는 제거하고 POST의 404·409 판정에 맡겼다. onSuccess는 조회 갱신, 제출 성공 콜백은 화면 이동, mutation.error는 오류 표시를 담당한다. onMutate에는 오프라인 차단과 홈 완료 표시용 대상 ID 전달만 남겼다. 최종 작업 트리의 check·build 통과: 웹 lint·typecheck·317개 테스트·빌드를 새로 실행했고 다른 작업은 캐시를 재사용했다. 실기기·실서버 검증과 커밋·push는 수행하지 않았다.

## 사전 보고 1단계 — 문서 갱신, 2026-11-17

- #385가 열린 상태임을 다시 확인했다. 사용자가 기존 이슈·명세의 후속 작업과 이번 문서 단계 진행을 승인했다.
- `git fetch origin` 후 HEAD `3420a854`, `origin/main` `9851baf6`를 확인했다. main이 2커밋 앞서지만 대상 기능 문서·홈 코드에는 차이가 없다. 브랜치 `DongjaJ/wh3c0`와 기존 이력을 유지했다.
- 이 디렉터리의 문서 9개만 수정했다. 사유 필수·시작 전 마감·일요일 전환·Hand off·뒤로가기·오류 복구·검증 범위를 일치시키고 제출 직전 재조회 없음과 `mutate` 사용을 명시했다.
- 후속 리뷰에서 조회는 `useQuery`·`useSuspenseQuery`, 제출은 `useMutation`의 `mutate`만 사용하도록 명확히 했다. 보고 응답의 양의 안전한 정수 ID 검증과 예상 대상 ID 비교는 제거했고, 후속 구현 리뷰에서 화면이 응답 본문을 소비하지 않으므로 앱 측 응답 검증도 생략했다.
- 기존 T001–T009의 상태는 보존했다. T010 문서 갱신은 완료, T011은 검증 결과 기록 후 사용자 리뷰·2단계 진행 확인 대기다. T012–T022 제품 구현·검증은 미착수다.
- Spec Kit의 기존 기능 갱신으로 처리하여 새 feature·브랜치·전역 기능 포인터를 만들지 않았다. `.specify/extensions.yml`이 없어 전후 extension hook은 해당 없다.
- 새 실행: 문서 9개의 상대 링크 7개·앵커, T001~T022의 고유·연속 번호, US1 5개/US2 11개, 완료 상태, 핵심 정책 정합성 검사 통과.
- 기본 `mise exec -- node --run check`는 `node_modules` 부재로 `/bin/sh: oxfmt: command not found`에서 중단됐다. lint·typecheck·테스트·Turbo 작업은 실행되지 않았으며 캐시 통과도 없다.
- 대체 문서 검사: 저장소 고정 버전과 같은 `mise exec -- pnpm dlx oxfmt@0.66.0 --check specs/020-member-attendance-submit`을 사용했다. 포맷 오류와 작업 범위의 취소선 오인 표기를 수정했고 최종 포맷 검사·`git diff --check`가 새 실행으로 통과했다.
- 문서만 변경하여 build·브라우저·실기기·실서버 검증은 실행하지 않았다. 제품 동작 검증은 2~4단계에 남아 있다. 과거 코드 출석 검사 결과를 이번 실행으로 계산하지 않았다.
- 변경량은 `origin/main`과 HEAD의 merge-base `3420a854` 대비 작업 트리 전체에서 추가 225줄·삭제 56줄, 합계 281줄이다. 650줄 미만이므로 이번 문서 단계의 추가 분리는 필요 없다. 커밋·push·PR 생성은 수행하지 않았다.
- 복구는 이번 문서 변경만 되돌리는 것이며 서버 데이터나 제품 코드는 변경하지 않았다. 사용자 리뷰와 다음 단계 확인 전에는 2단계를 시작하지 않는다.

## 사전 보고 2단계 — 제출·마감 처리, 2026-11-17

- `pages/home/model/attendance-report.ts`에 사유 입력 검증, 한국 시간 세션 시작 전 마감, 기존 주간 Query 구독, `submit1Mutation`의 `mutate`와 오류 변환을 추가했다. 일반 브라우저·정적 콘텐츠 모드·오프라인에서는 POST를 막는다. 데이터 요청은 `useSuspenseQuery`, 제출은 `useMutation`만 사용하며 제출 직전 요청·자동 재실행·오프라인 예약을 추가하지 않았다.
- 현재 화면은 보고 응답 본문을 소비하지 않아 앱 측 응답 검증을 추가하지 않는다. 응답 sessionId의 양의 안전한 정수 검증과 현재 주간 대상 ID 비교는 추가하지 않았다. 성공하면 주간 Query만 무효화하고, 화면 이탈 뒤 늦은 성공은 호출별 완료 콜백을 실행하지 않는다.
- 생성 MSW `submit1` 핸들러는 세 유형의 필수·trim 사유와 30자 UTF-16 경계를 검증한다. 별도 저장소 없이 현재 주간 세션 ID와 제출 시각을 반환하며, 빈 사유는 `INVALID_ATTENDANCE_REPORT`로 거절한다.
- 새 실행: `pnpm --filter @yapp-plus/web exec vitest run src/pages/home/model/attendance-report.test.tsx src/mocks/attendance-handlers.test.ts`에서 2개 파일·18개 테스트가 통과했다. 입력·시각 경계·요청 본문·400/403/404/409·일반 브라우저·오프라인·중복·화면 이탈과 MSW 세 유형·빈 사유를 확인했다.
- 새 실행: `mise exec -- node --run check`가 통과했다. 포맷은 전체 1,042개 파일을 새로 검사했고, 웹 lint·typecheck·전체 테스트는 새로 실행했다. 다른 lint·typecheck·test 작업은 Turbo 캐시를 재사용했다. 빌드·브라우저·실기기·실서버 검증은 3~4단계에 남아 있다.
- 리뷰 반영: native 인증 provider와 TanStack Query 기본값이 이미 POST 재시도를 막으므로 중복 `retry`·`networkMode` 설정을 제거했다. `submit1Mutation`이 반환값을 화면에서 사용하지 않는 현재 단계에서는 별도 `responseValidator`를 두지 않는다. 일반 브라우저·정적 콘텐츠·마감·오프라인 차단은 `submit`이 `mutate` 전에 안내 문구로 반환하고, `onMutate`는 제거했다. 오류 해석을 내부 함수로 분리하고, 오류 초기화와 주간 재조회를 함께 수행하던 `refresh`는 제거했다.
- 후속 새 실행: 인접 보고·MSW 테스트 18개, 웹 lint·typecheck, 포맷·`git diff --check`가 통과했다. 첫 전체 `check`는 변경하지 않은 `stackflow/src/stack.test.tsx`의 코드 출석 전환 1건이 시간 초과로 실패했으나, 단독 29개 테스트와 두 번째 전체 `check`는 통과했다. 두 번째 전체 `check`에서 포맷은 1,042개 파일을 새로 검사했고 웹 전체 테스트 512개는 새로 실행했으며, lint·typecheck와 나머지 테스트는 Turbo 캐시를 재사용했다.
- `origin/main` 대비 현재 작업 트리는 추가 622줄·삭제 145줄, 합계 767줄이다. 800줄 이하지만 650줄 검토 기준을 넘으므로 3단계 화면 변경은 별도 리뷰·PR 단위로 분리해야 한다. 커밋·push·PR 생성은 수행하지 않았다.
- 현재 단계는 모델·MSW만 변경하며 운영 진입과 보고 시트는 열지 않았다. 3단계에서 Form·시트·Stackflow 탐색·성공 안내를 연결하기 전 사용자 리뷰를 기다린다.

## 사전 보고 3단계 — 화면·운영 탐색, 2026-11-17

- 시연용 보고 시트를 `attendance-report-sheet.tsx`로 교체했다. 현재 주간 Query의 대기·실패·대상 없음·시작 정각 마감 상태를 표시하고, 유형 선택과 30자 이내 한 줄 사유 입력을 같은 Form 수명 안에서 관리한다. 이전 단계로 돌아가면 입력은 보존하고, Activity를 닫거나 새로 열면 Form이 새로 생성되어 초안을 보존하지 않는다.
- WebView의 로그인 세션과 개발 MSW 미리보기에서만 홈 진입을 열었다. 일반 브라우저와 정적 콘텐츠에서는 보고 요청을 시작하지 않으며, 실제 제출 성공 시 현재 주간 Query만 무효화하고 홈으로 복귀해 완료 알림을 표시한다. `attendanceStatus`는 진입 조건으로 사용하지 않았다.
- `AttendanceReport` Activity에 `step?: 'reason'` 이력을 추가했다. 시트의 이전 버튼은 Stackflow step을 되돌리고, 제출 중에는 버튼·시트 dismiss를 막아 같은 mutation을 중복 실행하지 않는다.
- 새 실행: 모델·MSW·보고 시트·홈·Stackflow의 선별 회귀 5개 파일 75개 테스트가 통과했다. 유형/사유 검증, trim한 POST 본문, 400 오류 후 수정, 사유 단계 입력 보존, 제출 중 잠금, 시작 정각 마감, WebView 운영 진입과 실제 제출 후 홈 복귀를 확인했다.
- 새 실행: `mise exec -- node --run check`가 통과했다. 포맷은 1,044개 파일을 새로 검사했고, 웹 lint·typecheck·518개 테스트는 새로 실행했다. 그 외 lint·typecheck·test 작업은 Turbo 캐시를 재사용했다. 마지막 테스트 이벤트 정리 뒤 시트 테스트 6개도 다시 새로 실행해 통과했다.
- 새 실행: `mise exec -- node --run build`가 통과했다. 웹 빌드는 새로 실행했고 admin·storybook 빌드는 Turbo 캐시를 재사용했다. 기존 웹 500 kB 청크 경고는 남아 있다.
- 단계 4의 실제 브라우저·모바일 크기·키보드/스크린 리더·한국어 IME·실기기/실서버 검증은 아직 실행하지 않았다. T019의 사용자 리뷰와 4단계 진행 확인을 기다린다.
- 현재 브랜치의 추적 파일은 `origin/main` merge-base `3420a854` 대비 추가 947줄·삭제 533줄, 합계 1,480줄이다. 새 보고 시트·테스트 560줄까지 포함하면 작업 트리 전체는 2,040줄이다. 현재 미커밋 3단계 변경도 문서 포함 847줄이므로, PR을 열기 전 800줄 제한을 만족하도록 별도 검토 단위로 분리할 계획이 필요하다. 이번 단계에서는 commit·push·PR 생성을 하지 않았다.

## 사전 보고 4단계 — 실제 데이터 경로 정리, 2026-11-17

- 사용자 리뷰를 반영해 사전 보고의 개발 MSW 미리보기 진입을 제거했다. 홈의 `reportCopy`는 유지하되 로그인 WebView에서만 `출결 보고하기`를 표시하며, 일반 브라우저·정적 콘텐츠에서는 목업 플래그와 관계없이 버튼과 직접 URL을 차단한다. 코드 출석·팀 사진의 기존 개발 시연 조건은 변경하지 않았다.
- 보고 시트는 `useNativeAuthSession`의 `apiOptions`로 생성된 현재 주간 Query와 제출 mutation만 사용한다. 테스트의 MSW는 요청 본문·오류·탐색 회귀를 위한 격리된 대체 서버이며, 제품 런타임의 보고 진입을 열지 않는다.
- 새 실행: 홈·보고 시트·Stackflow 관련 3개 파일 58개 테스트가 통과했다. 일반 브라우저 홈 버튼과 `/attendance/report` 직접 진입이 `VITE_API_MOCKING`과 무관하게 차단되고, native WebView의 실제 API 흐름이 유지됨을 확인했다.
- 새 실행: `mise exec -- node --run check`가 통과했다. 포맷은 1,044개 파일을 새로 검사했고 웹 lint·typecheck·519개 테스트는 새로 실행했다. 나머지 작업은 Turbo 캐시를 재사용했다. `mise exec -- node --run build`도 통과했으며 웹 빌드는 새 실행, admin·storybook은 캐시 재사용이다. 기존 웹 500 kB 청크 경고는 남아 있다.
- 브라우저 자동화 호스트가 연결되지 않아 실제 브라우저 캡처·모바일 크기·키보드/스크린 리더·한국어 IME 검증을 수행하지 못했다. WebView 인증 세션이 없어 실서버 데이터·제출도 검증하지 않았다. 이 두 항목은 최종 완료 전에 실제 앱 환경에서 확인해야 한다.
- 읽기 전용으로 기본 API의 `GET /api/sessions/current-week`를 인증 정보 없이 확인했으나, 이 실행 환경에서는 15초 동안 응답을 받지 못해 `curl` 상태 `000`으로 종료됐다. 서버 도달성·401 인증 요구 여부·인증된 실제 데이터 및 제출은 확인하지 못했으며, 보고 생성 `POST`는 보내지 않았다.
