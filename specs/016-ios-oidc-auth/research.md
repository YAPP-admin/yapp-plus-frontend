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
