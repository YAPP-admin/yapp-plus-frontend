# 조사와 결정

**확인일**: 2026-11-04. 문서 검증과 실기기 검증을 구분한다.

## 구조

- 선택: 말모처럼 native 서비스가 인증을 소유하고 typed RPC를 호출한다. 기존 safe-area bridge를 확장한다.
- 이유: 현재 백엔드는 native OIDC 교환과 refresh token body를 지원하며 가입/탈퇴도 같은 세션 경계에서 처리할 수 있다.
- 제외: Mercury의 URL 토큰 전달·웹 localStorage 보관, 범용 네이티브 HTTP 프록시, 새로운 브리지 transport.
- 참고: [말모 native bridge](https://github.com/Central-MakeUs/malmo-front/blob/dev/apps/mobile/app/bridge/index.ts), [Mercury App](https://github.com/Central-MakeUs/Mercury-App).

## SDK와 검증

- Apple은 Expo SDK의 nonce·identityToken·authorizationCode를 사용한다.
- Google은 react-native-nitro-google-signin 2.3.1의 explicit nonce와 serverClientID 연결을 사용한다.
- 널리 쓰이는 react-native-google-signin의 무료 Original API는 custom nonce를 지원하지 않으므로 그대로 대체하지 않는다.
- 실기기 미확인: Nitro·Expo 58 조합, 토큰 aud/nonce, 서명·callback. 컴파일과 테스트 통과만으로 성공 처리하지 않는다.
- [Google Nitro 저장소](https://github.com/react-native-nitro-google-sign-in/google-signin), [Original API의 nonce 제한](https://react-native-google-signin.github.io/docs/api#signinparams).

## 브리지와 저장

- 라이브러리가 통신·상태 구독·메서드 가용성을 제공한다. OIDC·backend·SecureStore는 앱 책임이다.
- RPC 입력·반환값 검증을 별도로 한다. postMessageSchema만으로 RPC가 검증된다고 가정하지 않는다.
- 브리지 timeout은 180초로 변경한다. timeout은 native 작업 취소가 아니므로 getSession으로 진행 상태를 확인한다.
- refresh token은 SecureStore, access/가입 token은 메모리. iOS 재설치 뒤 Keychain이 남을 수 있으므로 서버 검증으로 복구한다.
- [linkBridge](https://gronxb.github.io/webview-bridge/reference/web/link-bridge.html), [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).

## OpenAPI 확인 결과

- 수신 성공: `GET /v3/api-docs`, 135059 bytes. 원본은 저장소 루트의 `.context/oidc-stage-1/evidence/openapi.json`에 보관했다.
- SHA-256: `03f765c53b36c1d2b76a24671f8467f06d5b1bd1f27c4871e5687159e0a46c0f`.
- 가입 operationId는 main의 register와 달리 register_1이다. native 구현은 regenerate 후 실제 export를 사용한다.
- 격리 재생성에서 가입 SDK 함수는 register1로 확인했다. register는 신규 알림 기기 등록 PUT을 가리킨다.
- 정규 포맷 적용 후 main 대비 생성 변경은 7개 파일, +5537/-806, 합계 6343줄이다. 정식 반영은 별도 검토한다.
- 갱신 성공 응답은 main과 live 모두 AuthenticationResponse다. AuthSessionResponse만 반환한다고 가정하지 않는다.
- Apple 인증·가입의 503 설명에는 APPLE_REVOKE_PENDING/APPLE_UNAVAILABLE이 있으나 ErrorResponse.code enum에는 없다.
- 오류 envelope를 안전하게 읽고 알려지지 않은 code는 일반 서버 오류로 취급한다. 원본 명세를 수동 수정하지 않는다.
- 가입·갱신용 토큰이 schema에서 optional인 것은 web cookie 경로와 공용이기 때문이다. native 호출에는 반드시 보낸다.

## CORS와 대기 범위

- native fetch는 브라우저 CORS 대상이 아니다. 웹에서 업무 API를 직접 호출할 때는 CORS가 필요하다.
- 앞선 대화에서 OPTIONS /api/users 및 /api/posts가 응답 없이 timeout이었다. CORS 미지원이라는 증거는 아니다.
- 사용자가 백엔드에 수정을 요청하고 대기 중이므로 이번 단계에서 요청을 반복하지 않았다.
- [React Native networking](https://reactnative.dev/docs/network), [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS).

## 저장소와 관련 이슈

- 최신 main은 82124d9. 초기 브랜치는 dc5c957에서 252커밋 뒤였으며 사용자 승인 후 82124d9까지 fast-forward했다.
- #172는 일반 브라우저 교차 origin cookie 계약이며 이번 native bearer 흐름과 범위가 다르다.
- #157은 admin 로그인 화면 수명 문제다. 회원 앱 구현의 추적 이슈로 사용하지 않는다.
- 같은 목적의 열린 이슈가 없어 초안을 검토받고 [#313](https://github.com/YAPP-admin/yapp-plus-frontend/issues/313)을 생성했다. 기존 이슈의 완료를 주장하지 않는다.

## #329 보완 결정 — 2026-11-05 조사, 11-06 문서화

### 저장 직렬화

- 선택: `p-mutex@1.0.0`의 withLock을 세션 관리자 내부 저장 경계에 적용한다. 같은 프로세스의 작업만 직렬화한다.
- 이유: 직접 Promise 큐를 유지하지 않고 예외 시 lock 해제를 라이브러리에 맡긴다. 기존 workspace에 같은 용도의 직접 의존성은 없다.
- 제외: p-limit은 동시 실행 수 제한이며 세대 검사를 대신하지 않는다. 네트워크 전체를 잠그면 logout이 지연되므로 저장 임계 구역만 잠근다.
- 확인: 배포 소스는 ESM, Node >=20, yocto-queue 의존성을 사용하며 직접 Node built-in import는 없다. 이것만으로 Metro/Hermes 호환을 보장하지 않는다.
- 참고: [p-mutex API](https://github.com/sindresorhus/p-mutex#api). 설치·bundle·런타임 검증은 보완 1·7단계다.

### Android에서 참고한 원칙

- 기준: `YAPP-admin/yapp-plus-android` develop `2b837e3cb21762c6a73f1db205be6a3ef2749a97`의 TokenStore·RefreshCoordinator와 인접 테스트.
- 채택: mutex를 통한 저장 순서, 대상 token 일치 시에만 교체/삭제, 세션별 공유 갱신, 지연 완료를 제어하는 테스트.
- 적용: JS에서는 세대 검사와 p-mutex로 표현하고 Deferred 테스트로 완료 순서를 통제한다. Kotlin 구현·라이브러리를 복사하지 않는다.
- 제한: Android 전체 무결함을 주장하지 않으며 Android 저장소는 수정 대상이 아니다.

### Google 설정과 silent 인증

- 고정 `react-native-nitro-google-signin@2.3.1` iOS 구현은 iosClientId 또는 plist CLIENT_ID를 요구한다. 현재 설정은 webClientId와 scheme만 전달한다.
- 같은 SDK의 signIn은 currentUser/restore 경로에서 기존 token을 반환할 수 있다. configure에 새 nonce를 넣는 것만으로 token의 nonce가 바뀌는 증거가 되지 않는다.
- 선택: 기존 계획에 기록된 iOS client ID를 명시한다. silent 인증 유지 가능성은 보완 4단계의 별도 조사·리뷰로 결정한다.
- 제외: 매번 명시적 로그인으로 자동 변경, 기존 nonce 재사용, server nonce 검증 완화, 검증 없는 SDK 교체.
- 미확인: 실제 Google 서버의 거절, 배포 바이너리의 별도 plist, 실제 기기의 SDK 캐시·로그아웃 후 재로그인. 조사 결론과 제품 수정 완료를 분리한다.

### 별도 워크스페이스와 중복

- #328의 `hong-kong` 작업 트리를 읽어 웹 인증 세대·query/mutation cache clear·화면 수명 구현을 확인했다. 아직 미커밋이며 main 반영 근거가 아니다.
- 공통 결과 적용 경로를 재사용하는 것으로 계획한다. 현재 그쪽 query의 undefined→SIGNED_OUT과 staleTime Infinity는 남아 있어 R5 완료 증거가 아니다.
- 그쪽 계획의 업무 API 401 재요청·앱 복귀 확인과 이쪽의 브리지 재조회는 연계가 필요하다. 실제 적용 순서는 보완 5단계 전에 다시 확인한다.

## 보완 4단계 — Google nonce 조사 결과와 제안

2026-11-06: 설치된 Nitro SDK 2.3.1의 `ios/HybridNitroGoogleSignin.swift`를 확인했다. 3단계 격리 Podfile.lock의 GoogleSignIn은 10.1.0이다. 아래는 고정 소스 분석이며 실제 계정 로그인 실험 결과가 아니다.

| 경로                                  | 고정 소스 근거                                                                                                  | 새 nonce 보장 판단                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| configure → signIn                    | 69–77행은 nonce를 필드에 저장하고 102–112행은 currentUser의 token을 그대로 반환한다                             | 기존 token이 새 nonce에 맞춰 바뀌지 않는다                                  |
| restorePreviousSignIn                 | 203–223행은 nonce 인자 없이 저장 사용자를 복원한다                                                              | 이번 시도의 nonce를 전달하지 않는다                                         |
| getTokens                             | 374행 이후는 OIDAuthState.performAction 또는 refreshTokensIfNeeded를 사용한다                                   | configuredNonce를 사용하지 않으므로 새 token 여부만으로 해결되지 않는다     |
| clearCachedAccessToken                | 349행 이후는 기존 AuthState에 token 갱신 필요 표시만 한다                                                       | 새 nonce의 인증 요청이 아니다                                               |
| createAccount / presentExplicitSignIn | 115–126행은 같은 interactiveSignIn을 호출하고 235–242, 579–601행에서 configuredNonce를 Google signIn에 전달한다 | 새 nonce를 전달할 수 있는 확인된 경로이며 실제 token claim은 기기 검증 필요 |

Google 공식 [GIDGoogleUser 문서](https://developers.google.com/identity/sign-in/ios/reference/Classes/GIDGoogleUser)는 refreshTokensIfNeeded가 만료됐거나 만료가 가까운 토큰을 갱신한다고 설명한다. [GIDSignIn 문서](https://developers.google.com/identity/sign-in/ios/reference/Classes/GIDSignIn)는 저장 사용자 복원과 interactive sign-in을 구분한다. 이 API의 존재만으로 silent 로그인에서 새 nonce가 적용된다고 추론하지 않는다. 설치된 GoogleSignIn 10.1.0 헤더에도 nonce를 받는 interactive sign-in 선언이 있다.

### 권장 후속 구현 — 리뷰 승인 필요

- iOS에서 사용자가 Google 로그인 버튼을 누르면 새 nonce를 만들고 configure 후 presentExplicitSignIn을 직접 호출한다. iOS currentUser/restore의 캐시 token을 서버 인증에 사용하지 않는다. Android 경로는 유지한다.
- 앱 시작·복귀 시 이미 확보한 YAPP refresh token으로 세션을 복구하는 흐름은 유지한다. 매 앱 실행마다 Google 화면을 띄우자는 제안이 아니다.
- Google SDK signOut 추가만으로 해결하지 않는다. 앱 logout은 YAPP 세션을 정리하며, 로그인 실패 후 재시도에는 SDK 사용자 상태가 남을 수 있다. 매 로그인 전 SDK signOut은 전역 사용자 상태 변경도 추가한다.
- nonce 재사용·token에서 nonce 역추출·서버 검증 완화는 제외한다. SDK 교체나 fork도 현 단계에서 추가하지 않는다. silent 유지가 필수라면 새 nonce를 포함한 무상호작용 인증을 지원하는 근거부터 별도로 확보해야 한다.
- 사용자 영향: Google 인증 UI가 재로그인 시 다시 나타날 수 있다. 매번 비밀번호 입력 또는 계정 선택을 요구한다고 단정하지 않는다. 이 UX 변경은 리뷰 승인 후 구현한다.

후속 회귀는 iOS의 두 번 연속 시도·서버 실패 후 재시도·앱 logout 후 재로그인·사용자 취소를 검증한다. 각 인증 요청의 nonce와 SDK 구성 nonce 대응, 캐시 경로 미호출, Android 기존 경로 보존을 확인한다. 실기기에서는 실제 token nonce와 서버 검증 성공을 확인하되 token/계정 정보를 기록하지 않는다. 롤백 시 기존 캐시 token 위험이 돌아오므로 수정 제거를 해결로 표시하지 않는다.

### 웹 인증 작업 소유권 변경

사용자가 다른 세션에서 인증 작업을 중단하기로 했다. 앞선 #328 재사용 계획은 과거 조사 기록이며 앞으로의 구현 의존성이 아니다. 현재 브랜치의 session.tsx는 undefined를 SIGNED_OUT으로 변환하고, mutations.ts는 결과를 그대로 query cache에 적용한다. 보완 5단계에서 이 저장소의 단일 웹 인증 결과 적용 경로·작업 무효화·계정 캐시/화면 수명·복귀 재조회 소유권을 설계한다. 다른 작업 트리의 미커밋 코드를 가져오지 않는다. 업무 API의 일반 401 재요청까지 자동 확장하지 않고 필요한 범위를 5단계 계획 리뷰에서 확정한다.

### 4단계 구현 승인과 Android 비교

Android develop `2b837e3cb21762c6a73f1db205be6a3ef2749a97`의 [GoogleCredentialManager.kt](https://github.com/YAPP-admin/yapp-plus-android/blob/2b837e3cb21762c6a73f1db205be6a3ef2749a97/feature/login/src/main/java/com/yapp/plus/feature/login/GoogleCredentialManager.kt)는 매 요청 새 nonce를 생성하고 SHA-256 값을 GetSignInWithGoogleOption.setNonce에 전달한다. LoginRoute의 재시도도 같은 요청을 새로 시작한다. Android 실기기 화면과 토큰은 독립 검증하지 않았다.

사용자는 이 비교와 iOS 재로그인 시 Google UI가 다시 나타날 수 있음을 검토하고 구현을 승인했다. 위의 승인 대기 문단은 조사 당시 기록이다. 구현은 iOS의 SDK 캐시 반환 경로만 제거하며 자동 세션 복구·Android 제품 코드는 유지한다. 이는 다른 Android 저장소를 수정하거나 두 플랫폼의 실제 화면이 같다고 보장하는 작업이 아니다.

## 보완 5단계 현행 코드 조사

- 결정: QueryClient별 단일 결과 적용 경로에서 조회·mutation·페이지 callback을 함께 검사한다. 현재 session.tsx는 undefined를 로그아웃으로 캐시하고 mutations.ts는 모든 결과를 반영한다. 페이지별 onSuccess가 별도로 탐색하므로 cache 검사만 추가하는 대안은 충분하지 않다.
- 결정: 계정 경계에서 Stackflow 앱 인스턴스를 다시 만든다. 현재 main.tsx의 모듈 전역 인스턴스는 이전 Activity/폼 제거를 보장하지 않는다. token 회전마다 remount하는 대안은 사용자 입력을 불필요하게 잃으므로 제외한다.
- 결정: 브리지 준비 판정에 공개 상태·메서드 지원 검사를 사용한다. 고정 webview-bridge 1.8.0의 isWebViewBridgeAvailable은 함수 목록의 길이이며 initialBridge의 함수도 포함한다. 현재 packages/app-bridge의 initialBridge는 safeAreaInsets 데이터만 있어 초기 함수 목록은 비어 있다. 이 설정 전제를 회귀 테스트로 유지한다.
- 제외: onReady를 hydration 구독으로 사용하는 제안. 설치된 dist/index.js 735행은 proxy 생성 직후 onReady를 호출하고 705행의 hydrate 처리는 별도이므로 준비 신호가 아니다. SDK 내부 전역이나 private 이벤트에 직접 의존하지 않는다.
- 제외: 이번 범위에서 일반 업무 API 401 재전송 정책·추가 상태 라이브러리·새 RPC를 도입하지 않는다. 다른 세션의 미커밋 구현을 사용하지 않는다.

## 실제 갱신 응답 확인 — 2026-11-07

- 결정: 로그인에만 user.id를 요구하고 갱신은 session 자격만 검증한다.
- 근거: 시뮬레이터의 갱신 200 응답에 user가 없으며 OpenAPI도 user를 nullable로 정의한다.
- 계정 식별자는 로그인 때 검증한 userId를 refresh token과 함께 저장한다. 메모리에만 두면 재실행 복구가 불가능하다.
- 대안: Android의 storageKey 기반 식별로 바꾸면 브리지·웹 캐시 계약까지 바뀌므로 이번 수정에서는 제외한다.
- 기존 키와 다른 키를 사용해 구버전이 새 JSON을 토큰으로 전송하지 않도록 한다.

추가 재현: 토큰 저장 뒤 세션 ID를 만들 때 전역 crypto.randomUUID가 실패했다.
시뮬레이터에서 typeof globalThis.crypto 및 randomUUID가 undefined임을 확인했다.
Node의 전역 crypto 때문에 단위 테스트가 놓쳤으며, expo-crypto와 전역 crypto 부재 회귀로 보완했다.

## #406 삭제 재시도 조사 — 2026-11-09

- TestFlight 1.0.1 (20)의 [빌드 기록](https://github.com/YAPP-admin/yapp-plus-frontend/actions/runs/42455684488)은 소스 `3b7ca1309a066b12ad907414093391f97ef5b19b`를 가리킨다. 조사한 세션·저장소·갱신·웹 인증 코드는 현재 기준 commit과 같다.
- 계획 중 실제 TypeScript 소스와 저장소 대역을 연결한 Node VM 검사에서 현재 키 삭제 후 legacy 키 삭제 실패를 재현했다. 실패 해제 후 get 3회는 추가 삭제 없이 STORAGE를 반환했고 새 SessionManager는 SIGNED_OUT을 반환했다. 실제 iOS 저장소 장애나 동시성 검증은 아니다.
- 결정: 기존 restoring Promise를 공유하며 저장소 mutex 안에서 삭제 전후 generation을 검사하는 복구 경로를 추가한다. finally는 자신이 등록한 Promise만 해제한다.
- 재조회에서 clear()를 호출하면 generation이 증가해 진행 중인 새 로그인을 취소할 수 있다. 오류 무시나 기존 자격 재조회도 삭제 의도를 훼손하므로 채택하지 않는다.
- 자동 복구는 기존 5초 재조회 정책으로 확인한다. 수동 복구는 자동 재조회만 임시 중지하고 실패 후 5초 이상 기다려 버튼 효과를 구분한다.
- 조사한 Android Kotlin 구현에는 동일한 deletion-failed 상태가 없다. Android 전체 장애 복구를 검증했다는 의미는 아니며 이번 변경 대상에서 제외한다.
- 사용자 기기의 오류 코드·저장소 실패 원인은 미확인이다. 앱 복귀 증상만으로 초기 브리지 메서드 도착 지연이나 이 결함을 실제 원인으로 확정하지 않는다.
