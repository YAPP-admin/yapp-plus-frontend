# 검증 기록: 인증 세션 단순화

## 자동 검증

2026-11-20 실행 결과:

- `apps/mobile` 인증 관련 Vitest: 4개 파일, 91개 통과 (새 실행)
- `apps/web` 인증 모델 Vitest: 2개 파일, 4개 통과 (새 실행)
- `mise exec -- node --run check`: 통과. mobile·web lint/typecheck/test은 새 실행, 나머지 Turbo 작업은 캐시 재사용이 섞여 있다.
- `mise exec -- node --run build`: 통과. web build는 새 실행, admin·storybook 일부는 Turbo 캐시 재사용이다.

## 수동 개발 빌드 확인

- Apple 로그인 성공·취소
- Google 로그인 성공·취소
- 서버 거절과 SDK 실패에서 개발 로그의 단계 확인
- 로그아웃·재로그인·앱 재시작

실기기 계정·개발 빌드가 필요한 항목은 자동 테스트 성공으로 대체하지 않는다.

이번 작업에서는 Apple·Google 실기기 성공·취소와 실제 SecureStore 실패 주입은 실행하지 못했다. 개발 빌드에서 `[auth] provider|exchange|storage` 및 `[auth-bridge]` 로그로 확인한다.

## 시뮬레이터 확인

2026-11-20 iPhone 15 Plus (iOS 17.5)에서 로컬 Metro와 WebView 서버를 연결했다.

- WebView가 로드되고 오류 화면의 `로그인 화면으로` 동작으로 Google·Apple 로그인 버튼이 있는 로그인 화면까지 전환됐다.
- Firebase 개발 설정을 사용해 새 iOS 개발 빌드를 설치했다. Expo CLI는 시뮬레이터를 물리 기기로 인식해 코드 서명을 요구했으므로, `xcodebuild -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO`로 빌드했다. 빌드는 통과했다.
- 새 개발 빌드에서도 앱 재시작 직후 `로그인 상태를 확인하지 못했어요`가 표시됐다. 따라서 오래된 설치본이나 Firebase 설정 누락이 직접 원인은 아니다.
- 개발 전용 진단으로 초기 WebView를 확인했다. 사용자 에이전트 토큰은 존재했고(`true`), bridge 메서드 15개와 `getSession`도 주입되어 있었다. 토큰·응답 본문·사용자 정보는 표시하지 않았다.
- 즉, 대기 시간이 부족해서 native 주입이 안 된 상태는 아니다. WebView 세션 조회는 메서드 목록을 사전 검사하지 않고 `getSession` RPC 결과를 그대로 사용하도록 단순화했다. 초기 hydration의 fallback은 기존 `readAuthSession`이 재시도 가능한 `UNAVAILABLE`로 변환하며, 새 ready RPC·별도 상태·대기 루프는 추가하지 않는다.
- 단순화한 웹 번들을 같은 시뮬레이터에 12초간 연결했지만 세션 확인 오류 화면은 유지됐다. 따라서 이 변경은 중복 분기를 제거하지만, 현재 재현의 근본 원인은 세션 RPC 호출 또는 응답 전달 경로에 남아 있다.
- 2026-11-23에는 native `getSession()` 완료 뒤 WebView를 마운트하는 bootstrap 변경을 로컬 Metro 번들로 같은 시뮬레이터에서 확인했다. WebView는 bootstrap 뒤 마운트됐지만 동일한 세션 확인 오류 화면이 남았다. 따라서 저장소 복원과 WebView 최초 RPC의 순서만으로는 현재 재현을 해결하지 못하며, RPC 응답 전달 경로를 별도로 진단해야 한다.
- bootstrap은 위 결과에 따라 제거했다. 세션 복원 실패는 최초 1회 결과를 유지하고, 5초 polling·앱 복귀·네트워크 복귀로 다시 조회하지 않는다. 사용자가 `다시 시도`를 누른 경우에만 RPC를 재호출하는 단위·화면 테스트를 통과했다.
- 2026-11-23 개발 빌드 시뮬레이터에서 새 `getSession` 진단 로그를 확인했다. `native entered`와 `native returned status=ERROR code=STORAGE`가 순서대로 기록됐다. 따라서 WebView→native 요청과 native→WebView 응답은 도달하며, 현재 세션 확인 오류의 원인은 bridge 전달이 아니라 SecureStore 읽기 또는 이전 형식 삭제 경로의 실패다. 토큰·사용자 ID·응답 본문은 로그에 기록하지 않았다.
- 시뮬레이터 전체 초기화 뒤 이전 형식 삭제와 세션 읽기가 모두 성공했고, 저장된 세션이 없는 상태는 `SIGNED_OUT`으로 복원됐다. 이전 Keychain 오류는 앱 코드가 아니라 초기화 전 시뮬레이터 저장소 상태에서 재현된 것이었다.
- Google provider와 token exchange는 모두 성공했고 exchange HTTP 상태는 200이었다. 이후 `getSession`은 `SIGNED_IN`, native session renewal은 HTTP 200으로 확인됐다.
- WebView가 `127.0.0.1:3000`을 origin으로 사용하면 API CORS preflight가 403이었고, API가 허용한 `localhost:3000` origin에서는 200이었다. iOS 개발 WebView URL을 `localhost:3000`으로 고정한 뒤 이번 주 세션과 공지가 실제 API 응답으로 표시됐다.
- Apple 로그인, 로그아웃 서버 실패·timeout, 탈퇴 실제 결과와 실제 SecureStore 저장 실패 주입은 미검증이다.

## 운영 주의 사항

로그아웃은 서버 revoke 실패·timeout에도 기기 로컬 자격을 삭제한다. 이때 서버 세션 또는 푸시 등록은 남을 수 있으며, 앱은 자동 재시도를 수행하지 않는다.
