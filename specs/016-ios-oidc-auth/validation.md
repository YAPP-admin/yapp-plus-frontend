# 1단계 검증 기록

**날짜**: 2026-11-04

**이슈**: [#313](https://github.com/YAPP-admin/yapp-plus-frontend/issues/313)

**상태**: 1A 정식 문서 반영, 사용자 리뷰 대기. 1B API 재생성은 분리·대기.

## 이번 정식 반영

- 사용자 승인 후 #313 생성, 제목·본문·담당자 DongjaJ·OPEN 상태를 다시 확인했다.
- 현재 브랜치 DongjaJ/apple/google-oidc-plan을 유지하고 dc5c957에서 origin/main 82124d9로 fast-forward했다.
- specs/016-ios-oidc-auth/에 명세·계획·계약·조사·상태 모델·작업·검증 안내·체크리스트 9개 문서를 반영했다.
- Spec Kit feature pointer를 정식 경로로 갱신하고 setup-plan 및 check-prerequisites를 확인했다.
- .specify/extensions.yml은 없어 전후 hook 실행 대상이 없다. feature pointer는 gitignored 로컬 상태다.
- 고정 Node 24.20.0, pnpm 12.3.4와 최신 main의 frozen lockfile로 의존성을 준비했다.
- 문서 포맷·링크·작업 ID·범위 점검 및 node --run check 결과는 아래 최종 검증에 기록한다.

## 앞서 완료한 초안·API 조사

- dev GET /v3/api-docs 수신 성공: 135059 bytes. checksum은 research.md에 기록했다.
- 6개 인증 endpoint, 갱신 AuthenticationResponse, 가입 operationId register_1, Apple 오류 enum 누락을 확인했다.
- Hey API 0.99.0 격리 재생성 성공. 실제 가입 SDK는 register1, register는 알림 기기 등록이다.
- 생성 preview와 main의 diff는 7개 파일 +5537/-806 = 6343줄이다. 정식 적용하지 않았다.
- 첫 격리 생성의 Oxfmt 후처리는 .context 제외 규칙으로 실패했다. preview에서만 후처리를 분리한 뒤 stdin으로 포맷해 해결했다.
- 초안의 API 구조·문서 링크·작업 ID·포맷 검증은 통과했다. 실제 인증 테스트나 전체 품질 게이트로 간주하지 않는다.
- 관련 열린 이슈 #172(cookie 인증), #157(admin 로그인 수명)은 별도 범위로 확인했다.

## 최종 검증

- `mise exec -- node --run check`: exit 0. 포맷 검사는 새 실행, lint 7개·typecheck 7개·test 4개는 모두 Turbo 캐시 재사용이다.
- 캐시에 포함된 기존 테스트의 오류 경계/DOM 경고가 재출력됐지만 신규 실패는 없다. 이번 작업에서 제품 테스트를 새로 실행했다고 표시하지 않는다.
- 문서 자체 검증 통과: 9개 파일, 로컬 링크 10개, 요구사항 10개, 작업 ID 34개와 공백 검사. 포맷 검사도 새로 통과했다.
- 문서 검사에서 범위 표기의 취소선 해석과 hard break 후행 공백을 발견해 대시·문단 표기로 고쳤다.

## 미실행과 남은 위험

- 정식 packages/api 재생성·소비자 변경: 6343줄 변경량 처리와 backend 수정 반영 후 별도 1B 리뷰 대상이다.
- build와 expo:doctor: 제품 코드·빌드 설정·모바일 의존성을 변경하지 않은 문서 단계라 실행 대상이 아니다.
- SDK 실제 로그인·nonce/aud·서명·TestFlight·실제 탈퇴는 실기기/외부 검증 대기다.
- CORS는 사용자 backend 요청 후 대기 중이다. 이전 OPTIONS timeout을 이번 신규 검증으로 세지 않는다.
- 생성 preview의 typecheck와 backend 실제 인증 성공은 아직 확인하지 않았다.

## 리뷰와 변경량

- 실제 origin/main 기준 신규 문서 +623/-0줄이며 650줄 분리 검토 기준 미만이다.
- 이번 변경은 신규 명세 문서뿐이다. 원본 OpenAPI·생성 preview는 .context/의 비추적 증거로 유지한다.
- 1A 문서 리뷰 후 사용자 명시적 승인으로만 2단계를 시작한다. 1B 재생성은 별도 검토한다.
- commit·push·PR 생성은 실행하지 않았다. 2단계 시작 승인도 아직 없다.

## 1A 리뷰 반영 — 토큰 갱신 경쟁

- 사용자 요청으로 native single-flight와 늦은 401 처리, sessionId/tokenVersion 입력·출력 계약을 명시했다.
- 복구/갱신 공통 Promise, 비교·등록의 원자성, 저장 완료 후 공개, finally 소유권 검사를 추가했다.
- 계정 변경 후 재전송 차단과 재시도 상한을 시나리오·작업·검증 절차에 연결했다.
- 이번 변경은 계획 보완이며 기능 구현·경쟁 테스트 실행이나 2단계 시작을 의미하지 않는다.

## 1A 리뷰 반영 — 휴대전화번호 표시와 전송

- Figma 가입 화면의 `010-7777-7777` 입력·표시 형식을 기준으로 확정했다.
- 웹은 `+82` 접두어와 E.164 값을 노출하지 않으며, native가 completeSignup 직전에만 API body용 `+821077777777`로 변환한다.
- 이 변경도 계약 보완이며 가입 구현이나 다음 단계 시작을 의미하지 않는다.
- 보완 후 node --run check 통과: 포맷 새 실행, lint 7개·typecheck 7개·test 4개는 Turbo 캐시 재사용. 문서 간 계약·링크·공백 검사도 통과했다.

## 4단계 웹 연결 검증

- `apps/web/src/features/auth/`에 WebView 식별, native bridge 호출, React Query 세션 query를 추가했다.
- 앱 전체 Suspense 경계 안에서 native `getSession`을 `useSuspenseQuery`로 초기화하고, 로그인·가입·로그아웃·탈퇴는 `useMutation`으로 실행한다.
- 일반 브라우저에서는 소셜 로그인을 성공 처리하지 않고 YAPP+ 앱 안내를 표시한다.
- native 세션 복구 전에는 Tabs 보호 화면을 노출하지 않으며, 복구 성공 시에만 회원 화면을 표시한다.
- 로그인·가입·settings·Stackflow 대표 흐름을 갱신하고 웹 테스트 101개가 통과했다.
- `mise exec -- node --run check`: exit 0. 이번 변경으로 웹/app-bridge lint·typecheck와 웹 101개 테스트를 새로 실행했고, 나머지 패키지는 Turbo 캐시를 사용했다.
- `mise exec -- pnpm --filter @yapp-plus/web build`: exit 0. 웹 번들 생성까지 확인했다.

### 아직 확인하지 못한 항목

- 실기기에서 WebView user-agent 토큰, bridge handshake, Apple·Google SDK 호출은 확인하지 못했다.
- native access token을 사용하는 실제 업무 API 요청과 401 갱신 경로는 현재 웹 소비 API가 없어 통합 확인을 보류했다.
- 백엔드 CORS와 dev API의 실제 인증 응답은 기존 대기 항목이다.
- 브라우저 화면 스크린샷과 TestFlight 설치 결과는 실기기·배포 검증 단계에서 추가한다.

## 4단계 구조 보완 — mutation과 화면 전환 책임

- `queryOptions`와 `mutationOptions`를 `apps/web/src/features/auth/model/`에 모아 세션 query와 인증 mutation의 계약을 한곳에서 관리한다.
- mutation hook의 `onSuccess`는 성공한 `AuthResult`를 React Query 세션 cache에 반영하는 로직만 담당한다.
- 각 화면의 `mutate` 호출부 `onSuccess`·`onError`는 Stackflow 전환, 입력 오류, Snackbar·Dialog 표시처럼 UI에 영향을 주는 동작만 담당한다.
- 로그인·가입·로그아웃·탈퇴 mutation hook을 별도 파일로 분리해 화면에서 bridge 함수와 QueryClient를 직접 조합하지 않도록 한다.
- 로그인·Tabs 간 native 상태 전환 effect는 `NativeAuthRedirect`로 통합했다. 회원가입 화면의 전화번호 입력 포커스는 입력 필드 callback ref가 DOM 연결 시점에 처리한다.

## 회원가입 폼 리팩터링

- `apps/web/src/pages/signup/ui/signup-page.tsx`는 `@tanstack/react-form`의 `useForm`·`Field`·`Subscribe`로 이름·휴대폰 번호 상태와 단계별 필수값 검증을 관리한다.
- 폼 제출은 TanStack Form의 `onSubmit`에서 기존 native 가입 mutation과 브라우저 승인 대기 화면으로 분기하며, 입력 컴포넌트는 SEED TextField 계약을 유지한다.
- `apps/web/src/pages/signup/model/signup-form.ts`에서 `@yapp-plus/app-bridge`의 가입 입력 Zod 계약을 확장해 필수값·trim·필드 오류 메시지를 관리하고, TanStack Form Standard Schema validator가 이를 직접 사용한다. native 전송 시에는 `parse` 결과로 Zod 변환값을 사용한다.
- 웹 앱에 `@tanstack/react-form`을 catalog 의존성으로 추가하고 lockfile을 갱신했다.
- 단계 전환이 비동기 제출 검증 뒤 발생하므로 관련 테스트는 `waitFor`로 화면 전환 완료를 확인한다.
