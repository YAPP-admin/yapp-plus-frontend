# 단계별 검증 안내

> 초기 구현 검증 안내를 보존한다. #329 후속 검증은 아래 R1–R6 표를 사용하며 실행하지 않은 항목은 결과로 표시하지 않는다.

## #329 보완 검증

아래는 후속 단계의 실행 계획이다. 테스트의 deferred로 완료 순서를 제어하며 실제 token을 fixture·로그에 넣지 않는다.

| 요구  | 제어할 상황                                                               | 기대 결과와 주 검증 위치                                             |
| ----- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| R1    | 로그인·가입 응답, SecureStore 읽기/쓰기를 각각 지연→logout→이전 작업 완료 | 메모리·저장소 비복원, mobile actions/session 테스트                  |
| R1    | 동시 restore/refresh, logout 후 새 로그인, 이전 finally 완료              | 대상별 1회 갱신, 새 Promise 보존, mobile session 테스트              |
| R1    | 저장/삭제 실패와 같은 프로세스의 재조회                                   | STORAGE, 성공 미공개·옛 자격 복구 차단, mobile session 테스트        |
| R2    | renew 401 / network / timeout / 5xx / 잘못된 200                          | 401만 해당 자격 삭제, 일시 장애 보존·오류 구분, mobile API/세션 경계 |
| R2    | A의 늦은 401 전에 B 로그인 완료                                           | B 자격 유지, mobile session 테스트                                   |
| R3    | 수동 plist 없는 깨끗한 native 생성·빌드                                   | client ID·scheme 대응, Google 초기화; 실제 로그인과 별도 기록        |
| R4    | 기존 사용자 cache, 두 번째 시도·재시도·logout 후 재로그인                 | 새 nonce에 맞는 token 발급 근거 확인; silent 경로 불명확 시 미해결   |
| R5    | undefined/timeout→브리지 준비, 미지원 앱                                  | 로그아웃 확정 금지·복구 재조회, 미지원 RPC 반복 없음                 |
| R5    | visible 타이머·foreground·online·수동 재시도 중첩                         | 실패 완료 뒤 최소 5초, 진행 요청 공유·성공/숨김/unmount 시 정리      |
| R1·R5 | 지연 getSession·mutation 뒤 logout/다른 로그인                            | 단일 웹 인증 경로로 옛 상태·탐색 비복원, 웹 인증 경계 테스트         |
| R6    | GET /api/admin/generations/{generationId}/posts/{postId}                  | 공통 mock의 200·detail1 schema 검증, 기존 admin Vitest               |

고정 도구는 `mise exec --`로 사용한다. 해당 단계의 인접 테스트를 직접 실행해 수정 전 실패/수정 후 통과를 기록한다.
기본 게이트는 `mise exec -- node --run check`, 앱·빌드 설정 변경은 `mise exec -- node --run build`,
모바일 의존성·설정 변경은 `mise exec -- node --run expo:doctor`다. Turbo 캐시는 신규 실행과 구분한다.
깨끗한 iOS 생성은 현재 사용자의 native 출력물을 지우지 않고 `.context/` 격리 디렉터리에서 수행한다.
Metro bundle 성공·Hermes 실행·Xcode 빌드·Google 실제 로그인은 서로 다른 증거다. 미실행 단계는 그대로 남긴다.
외부 서비스·실기기·TestFlight 설치·EAS Update는 자동 테스트 통과로 대체하지 않으며 배포하지 않는다.

### R3 네이티브 초기화와 실제 로그인 구분

1. 격리 생성 프로젝트에서 `GoogleService-Info.plist` 부재와 생성 Info.plist의 callback scheme을 확인한다. `.env`나 기존 native 출력은 복사하지 않는다.
2. 생성 프로젝트의 `ios` 디렉터리에서 `mise exec -- pod install`을 실행하고 완료까지 기다린다. 시뮬레이터 대상으로 별도 DerivedData를 사용해 Xcode 빌드를 실행하고 성공 여부를 기록한다. 번들 생성만으로 이 단계를 통과 처리하지 않는다.
3. 테스트 전용 시뮬레이터 또는 기기에서 Google 로그인을 시작한다. 디버거로 `configure`가 오류 없이 반환하고 이후 로그인 호출로 진행하는지 확인한다. 토큰·계정 정보는 출력하거나 캡처하지 않는다. 계정 선택 화면 표시만으로 서버 인증 성공을 판정하지 않는다.
4. 테스트 계정으로 공급자 인증과 서버 응답까지 확인하여 `SIGNED_IN` 또는 예상한 `SIGNUP_REQUIRED`를 기록한다. 재로그인의 nonce 일관성은 R4의 별도 검증으로 남긴다.

이 문서는 실행할 절차다. 실행 결과는 [validation.md](validation.md)에 따로 기록한다.
모든 명령은 저장소 루트 기준이며 main 동기화와 해당 단계 승인 후 실행한다.

## 1단계: 문서·API 기준

- spec의 US1–US4, FR-001–FR-010을 tasks와 계약에 대응시킨다.
- OpenAPI 수신본 checksum과 6개 endpoint의 입력/출력 shape를 확인한다.
- Apple 503 설명과 ErrorResponse enum 불일치, register → register_1 변경을 기록한다.
- 승인 후 같은 snapshot으로 생성하고 변경량을 확인한다. 생성 diff와 소비자 변경은 별도 리뷰 단위가 될 수 있다.

```sh
OPENAPI_INPUT="$PWD/.context/oidc-stage-1/evidence/openapi.json" mise exec -- pnpm --filter @yapp-plus/api generate
mise exec -- node --run check
```

## 2단계: 앱 설정

- display name/Bundle ID/Team ID/EAS projectId/Google iOS URL scheme과 실제 resolved config를 비교한다.
- release에서 웹 주소 누락·HTTP·예상하지 못한 origin을 거부하는지 확인한다.
- Figma frame의 실제 export 아이콘을 확인한다. screenshot을 앱 아이콘으로 쓰지 않는다.
- 로컬 native build는 생성된 iOS 디렉터리를 추적하지 않는다. 실기기 설치는 대기 가능하다.

```sh
mise exec -- node --run check
mise exec -- node --run build
mise exec -- node --run expo:doctor
```

## 3단계: 경계·상태 테스트

- SDK 대역에서 매 요청 nonce가 다르고 전달 값이 rawNonce의 SHA-256인지 검사한다.
- API의 200 두 분기, 잘못된 shape, 401/403/503, 지연·유실을 재현한다.
- SecureStore 대역의 읽기/쓰기/삭제 실패, refresh 동시 호출, 로그아웃 뒤 지연 완료를 검사한다.
- getSession 복구와 refreshSession 동시 호출은 갱신 HTTP 1회, 동일 버전의 N개 401도 1회인지 확인한다.
- A의 갱신 완료 후 B의 이전 token 401이 도착하면 추가 갱신 0회, B의 재시도는 새 token으로 1회인지 확인한다.
- 갱신 실패 후 다음 시도 가능, 오래된 finally의 새 Promise 비삭제, 저장 완료 전 token 미공개를 확인한다.
- 로그아웃/계정 변경 뒤 이전 요청 재전송 0회, 재시도 401의 추가 갱신 0회, 403의 갱신 0회를 확인한다.
- browser MSW가 native 요청까지 mock한다고 가정하지 않는다. native SDK/transport 경계를 테스트에서 교체한다.
- token 원문을 snapshot·로그·실패 메시지에 남기지 않는다.

## 4단계: 웹 시나리오

- 테스트용 bridge를 통해 기존 회원 로그인·취소·가입·만료·로그아웃·탈퇴를 확인한다.
- 가입 화면은 `010-7777-7777`을 그대로 표시하고, native API 대역이 전송 직전에만 `+821077777777`로 변환하는지 확인한다. `+82` 입력이나 E.164 값을 화면에 노출하지 않는다.
- 확인되지 않은 session은 보호 화면을 표시하지 않으며 403에서 refresh를 반복하지 않는다.
- 계정 전환 후 캐시와 Stackflow 화면이 이전 사용자 데이터를 노출하지 않는지 확인한다.
- 메서드 없는 앱, 일반 브라우저, web reload, 늦은 bridge hydration을 확인한다.
- 키보드 focus, accessible name·오류 안내, 터치 target, safe area를 확인한다.

## 5단계와 후속 실제 검증

- check/build/expo:doctor 및 가능한 시뮬레이터 결과를 기록한다. cache hit와 신규 실행을 분리한다.
- CORS 반영 후 서비스 origin에서 실제 bearer 요청·OPTIONS·401/403 응답 헤더를 브라우저로 확인한다.
- 실기기에서 두 제공자의 aud/nonce, 계정 선택/취소, 가입, 앱 재실행, 로그아웃을 확인한다.
- 폐기 가능한 계정으로 탈퇴·Apple 철회 지연·재가입을 확인한다.
- 서명·업로드 승인 후 첫 셸 TestFlight 설치, 이후 인증 완성 빌드를 검증한다. 기기 미확보로 코드 구현을 중단하지 않는다.
- TestFlight build number·앱 commit SHA·웹 배포 버전을 기록한다. 미실행은 실패/성공과 구분한다.

## 보완 5A/5B 실행 순서

- 5A: 지연 로그인·가입·조회 후 logout, 오래된 성공/오류 callback, 새 로그인보다 늦은 logout, 낮은 tokenVersion을 재현한다. 계정 A의 query/mutation cache와 Stackflow 폼/뒤로가기 상태가 B에게 남지 않고 token 회전에서는 유지되는지 확인한다.
- 5B: 브리지 미준비→준비, timeout→정상, 준비 후 메서드 미지원, visible/online/수동 이벤트 중첩을 검증한다. 실패 완료 후 5초·한 번의 진행 RPC·숨김/unmount 정리를 fake timer로 확인한다.
- UI: 조회 불가 중 보호 콘텐츠가 보이지 않고 강제 로그아웃으로 표시하지 않는지, 재시도 버튼의 키보드 동작·접근성 이름·터치 크기를 확인한다. 일반 브라우저 경로도 회귀 검증한다.
- 각 단위는 인접 테스트와 check/build 후 리뷰한다. 웹 E2E 대역과 실제 WebView 검증 결과는 구분한다.

## user 없는 갱신 회귀

1. mobile의 auth/actions.test.ts, session.test.ts, storage.test.ts를 실행한다.
2. 로그인에서 userId를 저장하고 user 없는 갱신 뒤에도 같은 userId와 새 refresh token이 남는지 확인한다.
3. 앱 재실행 시 저장된 userId로 복구하고 이전 토큰 단독 저장에서는 로그인 화면으로 이동하는지 확인한다.
4. 실제 시뮬레이터는 로컬 웹·MSW false·수정 native 번들임을 확인한 뒤 Apple 로그인과 재실행 복구를 확인한다. 인증 정보는 기록하지 않는다.

## #406 삭제 재시도 검증 — 2026-11-09

### 자동 검증

```sh
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm --filter @yapp-plus/mobile test
mise exec -- pnpm --filter @yapp-plus/web test
mise exec -- node --run check
mise exec -- node --run build
```

삭제 실패 후 성공·반복 실패·동시 요청 공유·새 로그인 보존을 세션 계층에서 검증한다.
실제 AuthStorage와 저장소 대역을 연결해 현재 키 삭제 후 legacy 키만 실패하는 경우를 별도로 확인한다.
웹은 실제 세션 상태 연결과 사용자 버튼 이벤트로 STORAGE에서 로그인 화면으로의 전환을 검증한다.
Turbo 캐시 재사용과 새 실행을 구분하고, 수정 전 회귀 실패 근거도 기록한다.

### 전용 시뮬레이터 오류 주입

1. iPhone 15 Pro / iOS 17.5 전용 시뮬레이터를 만들고 이 워크스페이스의 개발 빌드를 설치한다. Xcode 27.2 빌드와 `node --run expo:doctor`를 확인한다. 기존 서버·기기를 종료하지 않는다. 3000/8081이 점유되면 빈 포트와 임시 연결 설정을 사용한다.
2. 3단계 제품 변경본을 `.context/auth-recovery/`에 보관한다. 임시 구성은 실제 AuthActions가 사용하는 SessionManager singleton에 만료된 가짜 자격을 establish한다. 갱신 대역은 AuthActions 생성 전에 설정하고, 준비 완료 후 WebView를 마운트한다. 가짜 자격을 실제 API에 보내지 않는다.
3. 갱신 대역은 invalid-session을 반환한다. 실패 주입은 clearSession 내부의 legacy 키 삭제 직전에만 둔다. get/set의 legacy 정리에는 주입하지 않고 getSession 결과·상태·화면 이동은 대역으로 바꾸지 않는다. 로그에는 상태·횟수·시각만 남긴다.
4. 실패를 유지한 채 자동 재조회 2회 이상에서 STORAGE·보호 콘텐츠 비노출·삭제 횟수 증가를 확인한다. 이전 자격 읽기와 갱신은 반복되지 않아야 한다. 실패를 해제하고 버튼 조작 없이 기존 5초 재조회로 로그인 화면에 도달하는지 확인한다.
5. 수동 복구는 별도 사례로 실행한다. 자동 재조회의 refetchInterval만 임시로 false로 설정하고 마지막 실패 후 5초 이상 기다린 뒤 실제 재시도 버튼을 누른다. staleTime·재시도 함수·응답은 바꾸지 않는다. 각 사례의 실패→복구 사이에 앱을 재시작하지 않는다.
6. 실제 재시도로 테스트 자격 정리를 완료한 뒤 임시 패치·패널·갱신 대역·재조회 설정을 제거한다. 전체 git restore를 사용하지 않고 3단계 제품 변경본과 비교한다. 화면 근거는 `.context/auth-recovery/`에 저장한다.
7. 결과와 임시 구성 제거를 리뷰받는다. 실제 iOS 저장소 장애나 사용자 기기 원인 확정으로 보고하지 않는다.

### 정상 구성의 실제 Google 인증

앱을 완전히 종료하고 정상 번들로 실행한다. Fast Refresh만으로 전환하지 않는다.
`VITE_API_MOCKING=false`, `VITE_STATIC_CONTENT=false`에서 실제 Google 로그인→홈→30초 백그라운드→
같은 계정 복귀→UI 로그아웃→Google 재로그인→앱 종료/재실행 후 세션 복구를 확인한다.
필요한 계정 선택·추가 인증은 사용자와 진행하고 토큰·개인정보를 기록하지 않는다.
짧은 복귀를 만료 토큰 갱신 검증으로 간주하지 않는다. 제품 수정이 추가됐을 때만 관련 검사를 다시 실행한다.
이번 작업에서 시작한 서버·시뮬레이터를 정리한다. TestFlight 배포와 Android·Apple 인증 검증은 포함하지 않는다.
