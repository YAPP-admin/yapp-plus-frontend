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

## 5단계 통합 검증

- `node --run check`: exit 0. 포맷 검사는 새로 실행했고, 웹 테스트 27개 파일·103개 테스트를 새로 실행했다. 나머지 Turbo 작업은 실행 결과에 따라 캐시를 재사용했다.
- `node --run build`: exit 0. 웹 번들은 새로 생성했고 전체 build 작업은 Turbo 캐시 재사용 항목을 포함해 통과했다.
- `node --run expo:doctor`: exit 0, 20/20 checks passed.
- 이번 단계에서는 시뮬레이터·실기기 설치를 실행하지 않았다. Apple·Google SDK의 실제 nonce/aud 응답, bridge handshake, 앱 재실행 세션 복구는 기기 검증 대기다.
- 백엔드 CORS 반영 전이므로 `https://yapp-plus-web.vercel.app`에서 실제 bearer 요청·OPTIONS·401/403 응답 헤더는 확인하지 않았다.
- TestFlight 업로드·설치와 build number/commit SHA 연결은 Apple 개발자 계정·빌드 승인 이후 후속 검증으로 남긴다.

## CORS 반영 확인 — 2026-11-05

- `Origin: https://yapp-plus-web.vercel.app`으로 Google authorization endpoint의 `OPTIONS`를 요청해 `200`, `Access-Control-Allow-Origin`, credentials, GET/POST/OPTIONS 허용 헤더를 확인했다.
- 같은 Origin의 Google authorization `GET`은 `302`를 반환하고, 공통 Web Client ID를 포함한 Google authorization URL로 redirect했다.
- Apple native-authentication endpoint의 `OPTIONS`는 `200`을 반환했다.
- Apple endpoint에 테스트 토큰을 POST한 결과는 `401 AUTHENTICATION_FAILED`였고, 오류 응답에도 `Access-Control-Allow-Origin`과 credentials 헤더가 포함됐다. 실제 Apple token 검증 성공은 실기기 대기다.
- TestFlight 설정의 public Expo config는 운영 WebView URL·Bundle ID·EAS projectId·Apple capability·Google iOS URL scheme을 기대값으로 확인했다.
- npm registry의 `eas-cli` 최신 `latest`는 `27.4.1`로 확인했다. EAS CLI 27.4.1 `whoami`는 `yapp-plus` 계정으로 확인했고, 프로젝트 설정도 `yapp-plus-official` owner·EAS projectId·testflight profile 기준으로 해석됐다.
- TestFlight build는 원격 iOS credential 검증에서 Apple Developer 로그인 입력을 요구해 중단했다. 비밀번호·2FA는 에이전트가 입력하지 않는다.
- build 시도 중 EAS remote build number가 `1`에서 `2`로 증가했지만, Apple credential 단계에서 취소되어 빌드 아티팩트와 TestFlight 제출은 생성되지 않았다.
- 2FA 없는 대안으로 `development-simulator` EAS build도 시도했으나 build `f42137ce-8e9e-425c-ac7c-b4ec40494f80`가 Install dependencies 단계에서 `UNKNOWN_ERROR`로 실패했다. 아카이브 URL은 생성되지 않았다.

## 로컬 iOS 시뮬레이터 검증 — 2026-11-05

- Xcode 27.2와 부트된 iPhone 15 Pro 시뮬레이터에서 Apple Developer 계정 없이 unsigned Debug 빌드를 생성했다.
- 실행 명령은 `MOBILE_WEB_URL=https://yapp-plus-web.vercel.app pnpm --filter @yapp-plus/mobile exec expo run:ios --configuration Debug --device generic --output .context/yapp-plus-sim`이다.
- Debug 빌드는 0 errors, 2 warnings로 성공했고 `.context/yapp-plus-sim/YAPP.app`을 생성·설치했다. 개발 런처 화면에서 Metro development server 선택 화면까지 실행되는 것을 확인했다.
- 같은 방식의 Release 빌드도 0 errors, 3 warnings로 성공했고 `.context/yapp-plus-sim-release/YAPP.app`을 생성·설치했다.
- Release 앱은 `MOBILE_WEB_URL`에 설정한 `https://yapp-plus-web.vercel.app`을 WebView로 로드해 YAPP+ 홈 화면까지 표시했다. 실행 스크린샷은 `.context/yapp-plus-simulator-release-clean.png`에 저장했다. 앞서 개발 URL 확인창이 포함된 원본은 `.context/yapp-plus-simulator-release.png`다.
- Release 빌드의 경고는 Expo Dev Launcher strip script의 ambiguous dependencies와 Expo 모듈 provider의 `CoreModule` 접근 수준 안내다. 빌드 실패는 아니다.
- 시뮬레이터에서는 원격 WebView 로드와 네이티브 번들·URL scheme 등록까지만 확인했다. Apple/Google 계정 선택, nonce가 포함된 실제 native SDK 인증, backend token 검증, bridge handshake와 세션 갱신은 실제 상호작용·계정·백엔드 결과가 필요하므로 아직 미확인이다.
- TestFlight용 store 서명·업로드는 Apple Developer 자격 증명과 2FA가 필요하다. 로컬 unsigned simulator 빌드는 이를 대체하지 않는다.

## EAS TestFlight 의존성 버전 보정 — 2026-11-05

- EAS TestFlight build `5131b9cf-966f-4606-af0f-9418ade4268f`는 인증서·프로비저닝 프로파일 검증과 소스 업로드까지 성공했지만 `Install dependencies` 단계에서 실패했다.
- 원격 로그의 원인은 EAS 기본 이미지가 Node `22.23.3`·pnpm `11.28.2`를 사용한 반면 저장소가 Node `>=24.20.0`·pnpm `12.3.4`를 요구한 엔진 불일치다.
- `apps/mobile/eas.json`의 `base` 프로필에 Node `24.20.0`, pnpm `12.3.4`, `corepack: true`를 지정해 모든 빌드 프로필이 저장소와 같은 도구 버전을 사용하도록 보정했다.
- `eas config --platform ios --profile testflight --json`에서 해당 버전과 `distribution: store`가 해석되는 것을 확인했다.
- 보정 후 `node --run format:check`, `node --run expo:doctor`(20/20), `node --run build`, `git diff --check`가 통과했다. 원격 재빌드는 아직 실행하지 않았다.
- 보정 후 첫 재빌드 `ead29cc8-3060-421e-9a8a-0c49fb8162c0`는 Node `24.20.0` 설치까지 성공했지만, EAS가 pnpm `12.3.4`를 전역 설치하는 과정에서 기존 `pnpm` 실행 파일과 `EEXIST` 충돌해 실패했다.
- EAS의 직접 pnpm 설치 옵션은 제거하고 저장소의 `packageManager: pnpm@12.3.4`와 `corepack: true` 조합으로 전환했다. 이 조합이 Corepack의 프로젝트 고정 버전을 사용하도록 하는 후속 보정이며, 재검증이 필요하다.
- 두 번째 재빌드 `b49e52d1-7e5a-462c-8ac8-0944aa7d9f10`에서도 Corepack이 기본 이미지의 pnpm `11.28.2`를 선택했고, Node `24.20.0` 경로에 전역 설치하는 과정에서 같은 `EEXIST`로 실패했다.
- 자동 pnpm 설치 충돌을 피하기 위해 `apps/mobile/eas.json`의 `corepack`을 `false`로 바꾸고, `apps/mobile/package.json`의 `eas-build-pre-install` 훅에서 `npm install --global --force pnpm@12.3.4`를 의존성 설치 직전에 실행하도록 보정했다.
- 세 번째 재빌드 `415e31e9-505a-48af-b399-0669d0be05ff`에서는 훅이 실행되기 전에 EAS 기본 pnpm `11.28.2`가 저장소의 `engines.pnpm: 12.3.4`를 검사해 실패했다. EAS 문서의 훅 순서상 이 단계에서는 기본 pnpm으로 훅을 시작해야 한다.
- `packageManager: pnpm@12.3.4` 고정은 유지하면서 `engines.pnpm`을 EAS bootstrap 버전 `11.28.2`부터 12 미만까지 허용하도록 조정했다. 다음 재빌드에서는 훅이 실행되어 pnpm `12.3.4`를 강제 설치한 뒤 실제 의존성 설치가 진행되는지 확인한다.
- 참고 레포 `YAPP-Github/28th-Web-Team-3-FE`는 Node `24.18.0`과 pnpm `11.8.0`을 사용하고, `eas.json`에 별도 Node·pnpm·Corepack 보정을 두지 않는다. EAS 기본 이미지와 도구 버전을 맞춘 구조이므로 이번 문제의 원인과 해결 방향을 비교하는 기준으로 기록한다.
- 네 번째 재빌드 `7b4ec8eb-510a-4a20-9952-f50b195f2923`는 훅이 기본 pnpm `11.28.2`로 시작한 뒤 `pnpm@12.3.4` 강제 설치에 성공했고, `pnpm install --frozen-lockfile`, Expo prebuild, CocoaPods, Xcode archive까지 통과했다.
- TestFlight용 IPA 아티팩트가 생성됐다: [EAS IPA 아티팩트](https://expo.dev/artifacts/eas/4q5rdJgVc7BJHd1oRJX-jMmm7ix6BxiGxKn6GiNH_pA.ipa). 원격 인증서·프로비저닝 프로파일은 `FV4V9756F6` 팀의 기존 자격 증명을 사용했다.
- 이 빌드는 아직 커밋하지 않은 작업 트리를 업로드해 생성됐고 EAS 표시 commit hash는 마지막 커밋 `736475e`다. 재현 가능한 TestFlight 제출 전에는 이번 설정 변경을 별도 커밋한 뒤 동일 프로필로 최종 빌드를 다시 생성해야 한다.

## TestFlight 업로드·제출 검증 — 2026-11-05

- 최종 설정 커밋 `0e734a3`에서 `testflight` 프로필로 원격 iOS 빌드를 다시 실행했다.
- 최종 빌드 `20126573-bf03-4bd6-8501-0a44243b513e`는 `FINISHED` 상태로 완료됐다.
- 앱 버전은 `1.0.0`, build number는 `14`, Bundle ID는 `org.yapp.yappplus`다.
- App Store Connect App ID `6830536097`을 대상으로 EAS Submit을 실행했다.
- EAS Submission `13090fb7-5b43-402a-84e0-ddf999393cc7`가 `FINISHED` 상태로 완료됐고, Apple App Store Connect에 IPA 업로드가 성공했다.
- 제출 과정에서 EAS 서버에 App Store Connect API Key를 생성하고 `APP_MANAGER` 권한으로 프로젝트에 연결했다. 키 파일과 비밀 값은 저장소에 기록하지 않았다.
- Apple의 binary processing이 남아 있으므로 TestFlight 설치와 실제 기기 인증 검증은 처리 완료 이메일 이후에 진행한다.
- 제출 직후 `eas submit:status --platform ios --json`에서 `testFlightBuilds: []`를 반환했다. 이는 App Store Connect의 processing 완료 전 상태로 기록한다.
- 제출 후 현재 작업 트리는 clean 상태다.

## 최종 품질 게이트 재실행 — 2026-11-05

- `node --run check`: exit 0. 포맷은 새로 실행했고, lint·typecheck·일부 test/build 작업은 Turbo 캐시를 재사용했다. 캐시 결과를 새 실행으로 산정하지 않는다.
- `node --run build`: exit 0. web·storybook·admin 결과는 Turbo 캐시를 재사용했다.
- `node --run expo:doctor`: exit 0, 20/20 checks passed.
- 이번 검증에서도 실제 Apple·Google SDK 인증, bridge handshake, 세션 갱신, TestFlight 설치는 Apple processing 완료 후 실기기에서 확인해야 한다.

## OpenAPI 최신성 확인 — 2026-11-05

- dev `GET /v3/api-docs`를 다시 수신했다. 원본은 `.context/openapi-latest.json`에 보관했으며, 크기는 135,192 bytes, SHA-256은 `b85939c8e61d4d78c49c70cc616f5b20dd5e4cb6902d13238e9e517cd312a41a`다.
- 기존 단계 snapshot과 최신 문서는 path 64개·operation 76개로 동일하고, operation의 path·method·operationId·세부 계약 hash도 일치한다.
- 최신 문서의 `ErrorResponse.code`에는 기존 snapshot보다 `APPLE_REVOKE_PENDING`, `APPLE_UNAVAILABLE`, `APPLE_NOTIFICATION_INVALID`, `APPLE_NOTIFICATION_UNAVAILABLE`, `APPLE_NOTIFICATION_FAILED` 5개가 추가됐다.
- 현재 `packages/api/src/generated`는 최신 문서로 생성된 결과가 아니다. SDK export가 59개로 최신 문서의 76개보다 적고, `/api/users`의 가입 함수도 최신 operationId `register_1`이 아닌 기존 `register`를 사용한다.
- 현재 생성 코드에는 최신 문서의 Apple 503 응답과 새 Apple 오류 코드가 반영되지 않았다. native Apple·Google의 핵심 200/400/401 요청 shape는 유지되지만, Apple 실패 분기를 정확히 타입화하려면 재생성이 필요하다.
- 최신 문서로 격리 생성한 결과는 `register1`, Apple notification, 세션·출석·공지·어드민의 신규 operation을 포함한다. 생성 파일은 직접 수정하지 않고 1B 별도 작업에서 재생성 후 `apps/mobile/src/auth/auth-api.ts`의 가입 함수 import 등 소비자 변경을 함께 검토한다.
- 전체 재생성은 생성 파일 변경량이 크므로 현재 단계에서는 실제 파일에 반영하지 않았다. T031(1B) 별도 승인 항목으로 남긴다.

## OpenAPI 1B 재생성 — 2026-11-05

- 사용자 승인 후 `.context/openapi-latest.json`을 입력으로 `OPENAPI_INPUT=../../.context/openapi-latest.json pnpm --filter @yapp-plus/api generate`를 실행했다.
- 생성 설정과 `@hey-api/openapi-ts` `0.99.0`을 그대로 사용했고, 생성 파일은 도구 출력으로만 갱신했다.
- 최신 operationId에 맞춰 `apps/mobile/src/auth/auth-api.ts`의 가입 호출을 `register1`/`Register1Data`로 변경했다.
- `packages/api/src/mocks/handlers.ts`에서 팀·세션·공지·현재 주 세션·현재 기수 세션의 operationId 변경을 새 Faker·Zod 계약에 맞춰 연결했다. 세션 수정은 최신 204 응답 계약에 맞춰 본문 없는 응답으로 바꿨다.
- 생성 파일 7개 변경량은 `+5,581/-806`줄이다. 소비자·모의 핸들러·검증 문서를 포함한 현재 작업 트리는 `+5,607/-822`줄이며, PR 800줄 제한을 초과하므로 commit·push 전 별도 PR 분리를 검토한다.
- `node --run typecheck`: exit 0. API 생성 타입과 mobile/web/admin 소비자 typecheck를 새로 실행해 통과했다.
- `node --run test`: exit 0. mobile 2개 파일 7개 테스트, web 27개 파일 103개 테스트, admin 71개 파일 656개 테스트가 통과했다. UI·app-bridge 테스트는 Turbo 캐시를 재사용했다.
- `node --run check`: exit 0. 포맷·lint·typecheck·test 전체 게이트를 통과했으며, 캐시 사용 항목은 새 실행으로 산정하지 않는다.
- `node --run build`: exit 0. 생성 계약 영향을 받은 web·admin build를 새로 실행했고, 일부 Storybook 결과는 Turbo 캐시를 재사용했다.
- `node --run expo:doctor`: exit 0, 20/20 checks passed.
- 앞서 제출한 TestFlight build `14`는 재생성 전 커밋에서 만들어졌으므로 이번 계약 변경은 포함하지 않는다. 이 변경을 실기기에서 검증하려면 리뷰 후 새 build 또는 네이티브 런타임과 호환되는 EAS Update가 추가로 필요하다.

## EAS Update 설정·검증 — 2026-11-05

- `eas update:configure --platform ios --non-interactive`를 실행했지만 동적 `apps/mobile/app.config.ts`를 자동 수정할 수 없어 설정 단계에서 종료됐다. 도구가 설치한 `expo-updates`와 lockfile 변경은 유지하고, 나머지 설정은 동적 설정 파일에 직접 반영했다.
- `apps/mobile/app.config.ts`에 EAS project ID 기반 `updates.url`과 `runtimeVersion: { policy: 'appVersion' }`를 추가했다. `expo config --json`에서 `updates.url`이 `https://u.expo.dev/e34d595c-d553-4007-ac7c-8e85d6549e44`, runtime policy가 `appVersion`으로 해석되는 것을 확인했다.
- `apps/mobile/eas.json`의 `testflight` 빌드 프로필에 `channel: 'testflight'`를 연결했다. 이후 `eas update --channel testflight`로 같은 네이티브 런타임에 JavaScript·asset 업데이트를 배포할 수 있다.
- `node --run check`: exit 0. 모바일 lint·typecheck·test는 새로 실행했고, 다른 패키지 일부는 Turbo 캐시를 재사용했다.
- `node --run build`: exit 0. 전체 빌드가 통과했으며 이번 실행에서는 Turbo 캐시를 재사용했다.
- `node --run expo:doctor`: exit 0, 20/20 checks passed.
- 기존 TestFlight build `14`에는 이번 `updates.url`·runtime·channel 설정이 포함되지 않았으므로, EAS Update를 사용하려면 이 설정을 포함한 새 네이티브 build를 먼저 생성해야 한다.

## EAS Update 배포·TestFlight build 15 제출 — 2026-11-05

- `testflight` 채널과 같은 이름의 EAS branch를 만들고, `runtimeVersion: 1.0.0` 업데이트 그룹 `1ca98848-73d1-4184-ad74-ca70304c43fa`를 배포했다. 공개 `MOBILE_WEB_URL`을 build 설정과 동일하게 전달했고, EAS 환경의 비밀값은 사용하지 않았다.
- 이 update는 EAS Update 설정이 없는 build 14에는 전달되지 않는다. build 15 이상의 같은 channel·runtime 설치본에서만 수신 대상이 된다.
- build `b146e688-7374-4428-bffe-5d495a974911`는 `testflight` 프로필로 성공했다. 앱 버전은 `1.0.0`, build number는 `15`, runtime version은 `1.0.0`, 포함 commit은 `04e085890684a97c9622f2609ded4a864589f035`다.
- build 15를 EAS Submission `685997d3-b71c-4a80-836a-c080936956d7`로 App Store Connect App ID `6830536097`에 제출했다. Apple processing 완료는 사용자가 확인했다.
- TestFlight 설치, 업데이트 수신, Apple·Google 실제 로그인, 가입·세션·로그아웃·탈퇴는 실기기 부재로 아직 실행하지 않았다. 실제 기기와 폐기 가능한 테스트 계정이 준비되면 T033·T034에서 결과를 기록한다.
