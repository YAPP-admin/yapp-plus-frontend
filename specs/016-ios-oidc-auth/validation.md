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
