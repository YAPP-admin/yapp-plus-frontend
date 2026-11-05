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
