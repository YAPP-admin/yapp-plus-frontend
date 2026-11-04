# 단계별 검증 안내

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
