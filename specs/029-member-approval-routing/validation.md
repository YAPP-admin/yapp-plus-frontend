# 0단계 검증 기록

## 후속 리뷰 — 구버전 응답 보정 제거

사용자 결정에 따라 OTA 적용 전 로그인 실패를 허용한다. 아래 단계별 기록의 구버전
`NONE` 정규화·호환 통과는 당시 결과이며 현재 정책을 대체하지 않는다.
현재는 웹 수신 경계에서도 `reviewTransition` 누락을 `INVALID_RESPONSE`로 거부한다.
유효한 `NONE`·`PENDING_TO_APPROVED`, 새 앱의 기존 세션 복원 정책은 유지한다.
강제 업데이트·자동 재시작은 추가하지 않는다. 복구가 필요하면 누락 보정 제거 변경을 되돌린다.

- `node --run check` 통과: bridge 110개·web 639개·mobile 335개 테스트 신규 실행,
  admin 731개·UI 10개는 Turbo 캐시 재사용.
- `node --run build` 통과: web·admin·Storybook 3개 모두 신규 실행.
- 계약·웹 수신·화면 테스트를 누락 응답 거부 기준으로 갱신했다.
- 실기기 검증은 사용자 결정대로 배포 후 진행한다.

## 작업 범위

- 날짜: 2026-11-26. Spec Kit 문서 작성만 수행했다. 제품·생성 코드·의존성은 변경하지 않았다.
- 브랜치: DongjaJ/yapp-approval-screen. HEAD fe8d2f6a, fetch 후 origin/main a7967564.
- 현재 브랜치는 main보다 16개 커밋 뒤이며 문서 경로는 충돌하지 않는다. rebase·merge는 하지 않았다.
- 열린 이슈 목록과 #329·#531 본문을 조회했다. 동일 목적 이슈가 없어 issue-draft.md를 준비했다.
- 2026-11-26에 [#599](https://github.com/YAPP-admin/yapp-plus-frontend/issues/599)를 생성했고, 제목·본문·열린 상태를 다시 확인했다. 0단계 리뷰와 1단계 진행 확인을 받았다.
- .specify/extensions.yml이 없어 specify·plan·tasks의 전후 hook은 실행 대상이 없다.
- .specify/feature.json은 로컬 ignored 선택 상태다. 실제 Git 브랜치는 변경하지 않았다.

## 수행한 확인

- 서버 OpenAPI에서 UserResponse.reviewStatus의 enum·null과 본인 조회의 필드 부재를 확인했다.
- 새 native의 SIGNED_IN에는 reviewTransition을 필수 NONE | PENDING_TO_APPROVED로 두고, 구버전 결과의 필드 누락은 웹 경계에서만 NONE으로 정규화하도록 계약을 확정했다.
- spec·plan·tasks와 계약·상태·검증 시나리오의 정합성을 확인했다.
- 자체 문서 검사 신규 실행: 11개 Markdown, 로컬 링크 누락 0개, 미완성 템플릿 0개, 연속 작업 ID T001–T036 확인.
- 작업은 총 36개이며 US1 9개·US2 7개·US3 4개·공통/검증 16개다. T001–T006 완료, 제품 작업은 미착수다.
- `pnpm dlx oxfmt@0.66.0 --check specs/029-member-approval-routing` 신규 실행 통과. 프로젝트 고정 버전을 사용했다.
- 고정 Node.js 24.20.0으로 `node --run check` 실행: `/bin/sh: oxfmt: command not found`로 format 단계에서 중단.
- node_modules가 없어 전체 lint·typecheck·test는 실행되지 않았다. 문서만 변경했으며 전체 의존성 설치는 하지 않았다.
- Turbo에 도달하지 않았으므로 Turbo 캐시 재사용은 없다. 문서 검사를 제품 테스트 통과로 보고하지 않는다.
- main 대비 기존 커밋 변경은 0줄, 새 문서 11개가 이번 diff 전부다. 최종 줄 수는 검토 보고에 기재한다.
- 변경량은 650줄 미만으로 0단계 분리는 불필요하다. 후속 제품 단계에는 누적 변경량을 다시 계산한다.

## 미실행

- 제품 동작·실기기·실서버 로그인·가입·승인 변경은 1–5단계 대상이며 실행하지 않았다.
- build·expo:doctor는 문서만 변경한 0단계에 해당하지 않아 실행하지 않는다.
- 이슈 생성·commit·push·PR·merge·배포는 실행하지 않았다.

## 1단계 중간 기록

- 서버 OpenAPI를 `.context/approval-openapi.json`에 고정했다. SHA-256은
  `54cf54829b07865f023f8d2e45012da115a7e0a530fda2f3a88fbb5acdc98391`이다.
- 공식 generate를 두 번 실행했고, 생성 디렉터리 aggregate SHA-256은 두 번 모두
  `0c497ab02a6447529f048054b15318366de83764260730db0ec7cd93d3db8f47`로 일치했다.
- `UserResponse.reviewStatus`는 `PENDING | APPROVED | REJECTED | null` 필수 필드로 생성됐다.
- 그러나 최신 명세에는 이번 기능과 무관한 API 변경도 포함되어 생성 파일만 980 추가·79 삭제,
  총 1,059줄이 바뀌었다. 800줄 PR 제한을 넘어 fixture 갱신과 다음 단계 진행을 멈추고 분리 결정을 기다린다.
- 기존 인증 fixture는 `apps/mobile/src/auth/actions.test.ts`와 `providers.test.ts` 두 곳이며,
  모두 `reviewStatus: 'APPROVED'`를 명시했다. 웹에는 AuthenticationResponse를 직접 만드는
  fixture가 없었다.
- `pnpm --filter @yapp-plus/mobile test -- --run src/auth/actions.test.ts src/auth/providers.test.ts`를
  신규 실행해 25개 파일·306개 테스트가 통과했다.
- 고정 Node.js로 `node --run check`를 신규 실행했다. 생성된 `zod.gen.ts`의 포맷 불일치를
  저장소 formatter로 보정한 뒤 format은 통과했으나, 최신 명세가 추가한
  EARLY_LEAVE_ONE_HOUR·EARLY_LEAVE_THREE_HOUR를 `apps/admin`의 기존 switch가 처리하지 않아
  @yapp-plus/admin lint가 실패했다. api·mobile·web lint는 신규 실행 통과, app-bridge·ui·storybook
  lint는 Turbo 캐시 재사용이다.
- 사용자 지시에 따라 1,059줄 생성 계약 동기화를 커밋하되, 관리자 상태 정책은 이번 승인 기능
  범위 밖이므로 임의로 변경하지 않는다. T012와 1단계 리뷰는 이 실패를 포함해 다음 확인에서 완료한다.
- 사용자 확인 후 최신 명세의 조퇴 상태도 함께 반영했다. 관리자 출석 목록의
  EARLY_LEAVE_ONE_HOUR·EARLY_LEAVE_THREE_HOUR는 각각 withinOneHour·withinThreeHours로 변환하고,
  운영진 수정 요청도 동일 상태로 전송한다. 공용 API fixture에는 필수 attendancePhase·attendanceClosedAt를
  추가했다.
- `pnpm --filter @yapp-plus/admin exec vitest run src/features/session-management/model/session-attendance-query.test.tsx`를
  신규 실행해 1개 파일·9개 테스트가 통과했다. `node --run check`은 format·lint·typecheck를 통과했다.
  최종 실행에서 admin typecheck는 신규 실행, 나머지 typecheck와 모든 lint는 Turbo 캐시를 재사용했다.
- `node --run build`는 통과했다. admin·web build는 신규 실행, storybook build는 Turbo 캐시를 재사용했다.

## 리뷰 경계

0단계 이후 사용자 확인에 따라 이슈 #599를 생성하고 생성 계약·관리자 상태·웹 분기를 커밋했다.
후속 구현은 대화의 진행 확인에 따라 진행 중이며, 아래 미완료 검증을 전체 완료로 해석하지 않는다.

## native 승인 판정·대기 복귀 연결

- 로그인·가입 응답에서 APPROVED만 세션을 확정한다. PENDING·REJECTED·null은 기존 저장 정보를
  정리한 뒤 토큰 없는 REVIEW_REQUIRED를 메모리에 유지한다. 저장 정리 실패 시 제한 결과를 확정하지 않는다.
- 대기 화면의 기존 뒤로가기는 확인창을 열고, native 정리에 성공한 뒤 Login으로 이동한다.
  취소는 대기를 유지하며 정리 실패는 재시도할 수 있다.
- 같은 실행 중 대기했던 계정이 승인되면 PENDING_TO_APPROVED를 한 번 반환한다. 앱 재생성 후에는
  이력이 없으며 기존 저장 세션 복원 정책은 유지한다.
- native 인증 작업 테스트를 신규 실행하여 65개가 통과했다.
- 최종 build는 통과했다. web은 신규 실행, admin·storybook은 Turbo 캐시 재사용이다.
- 전체 check에서 format·lint·typecheck는 통과했다. lint·typecheck는 각각 7개 중 5개 캐시를
  재사용했다. 웹 테스트는 4개 실패와 worker 시작 시간 초과 2건으로 실패했다. 단일 worker 재검증도
  기존 account-boundary 테스트의 시간 초과가 발생하여 중단하고 변경 영역의 테스트로 범위를 좁혔다.
  전체 check가 통과했다고 보고하지 않는다.
- `signup-status-content.test.tsx`와 `session-queries.test.ts`를 단일 worker·30초 테스트 제한으로
  신규 실행해 2개 파일·14개 테스트가 통과했다. 저장소의 기본 timeout 설정은 변경하지 않았다.
- 문서 갱신 후 format 검사와 `git diff --check`도 통과했다.
- 실기기 Google·Apple 로그인, 터치·VoiceOver는 아직 실행하지 않았다. 엄격한 브리지 입력 검증,
  오류 화면 제한 상태 정리와 나머지 통합 시나리오는 후속 작업으로 남아 있다.

## 브리지 수신 검증·오류 화면 복귀 보완

- 앞 단계 변경은 `3b064c3b`(관리자 페이지 크기 계약), `e86326a2`(승인 판정·대기 복귀)로 커밋했다.
- AuthResult에서 구버전 SIGNED_IN 유니언을 제거해 reviewTransition을 필수로 유지한다.
  구버전의 필드 누락은 웹 RPC 수신 경계에서만 NONE으로 정규화하며, 잘못된 상태·세션·전환 값은
  INVALID_RESPONSE로 반환한다. 새 계약 스키마는 누락을 거부한다.
- Error에서 제한 계정은 signOut 정리 성공 후 Login으로 replace한다. 정리 실패 시 제한 상태를
  캐시에 유지해 재시도를 허용하고, 문의 링크는 유지한다. 스와이프 복귀도 차단한다.
- 새 스키마·호환성 테스트 14개를 포함한 app-bridge 110개와 mobile 314개 테스트가 신규 실행 통과했다.
- 최신 build는 web 신규 실행, admin·storybook 캐시 재사용으로 통과했다.
- 전체 check는 format·lint·typecheck를 통과했다. 최종 실행의 lint·typecheck는 각각 7개 중
  6개가 Turbo 캐시 재사용이다. 웹은 608개 통과·7개 실패로 종료했고 관리자 출석 코드 발급
  테스트에서도 실패가 관찰됐다. 이번 수정의 native-auth 5개·operations 4개·오류 화면 4개는 통과했다.
- 실패한 웹 account-boundary·notification-navigation·home-page 파일을 단일 worker로 신규 실행하여
  70개가 모두 통과했고, 관리자 session-attendance-content도 8개가 모두 통과했다. 전체 실행에서는
  시간 초과·비동기 로딩 상태에서의 단언 실패가 있었으며 재실행에서는 재현되지 않았다.
  전체 check 명령의 실패와 개별 재검증 통과를 구분한다.
- 실제 기기 로그인·VoiceOver·터치 확인과 남은 통합 시나리오는 미실행이다.
- 오류 안내를 헤더 밖 본문에 배치한 최종 변경 후 오류 화면 4개 테스트, format·lint·typecheck와
  build를 다시 통과했다. lint·typecheck는 web 신규 실행·나머지 6개 캐시 재사용이고,
  build는 web 신규 실행·나머지 2개 캐시 재사용이다.
- 배포·push·PR 생성은 실행하지 않았다. 브랜치 전체 변경량이 PR 제한을 초과하므로 PR 작성 전
  검토 가능한 단위로 분리해야 한다. 새 웹 배포 후 문제가 생기면 native 활성화 전에 이전 웹으로
  복구하며, native 활성화 이후에는 REVIEW_REQUIRED를 이해하는 웹 버전을 유지해야 한다.

## 승인 화면 진입·이동 회귀 보완

- 이전 단계 변경을 `06cfd768`로 커밋했다.
- 사용자 범위 정정에 따라 로그인·가입의 INVALID_RESPONSE 전용 Error 이동 분기를 제거했다.
  로그인·가입 실패는 기존 오류 안내를 유지하며, 승인 대기 화면은 PENDING일 때만 표시한다.
- native SignupStatus는 실제 PENDING 상태에서만 렌더링한다. 상태 없이 URL로 직접 진입하거나
  정리 후 복원하면 Login으로 이동하며, 거절 상태는 Error, 승인 상태는 승인 전환에 맞는 화면으로 이동한다.
- 대기 복귀 확인은 native 정리만 요청하고 탐색은 인증 경계가 담당한다. 직접 URL 진입 시 부모로
  복원된 비활성 Login은 렌더링하지 않아 로그인 버튼과 자동 이동이 중복 노출되지 않게 한다.
- 상태별 보호 URL 진입과 업무 Query 미생성, 대기 화면 취소·로그인 복귀·같은 계정 승인 완료를
  실제 Stackflow·Query 연결 테스트에 추가했다. 테스트마다 URL과 브리지 결과를 초기화한다.
- 전체 검사는 `TURBO_ENV_MODE=loose VITEST_MAX_WORKERS=2 node --run check`로 실행한다.
  설치된 Vitest의 worker 환경 변수와 Turbo 전달 설정을 확인했으며 저장소의 테스트 설정은 변경하지 않는다.
- 이 실행에서 format·lint·typecheck는 신규 실행 통과했다. admin 718개·mobile 314개·app-bridge
  110개·ui 10개 테스트도 캐시 없이 통과했다. 웹 notification-navigation 3개 실패를 확인한 뒤
  웹 전체 실행은 중단(exit 143)했으므로 전체 check는 미통과다. 해당 실패를 이번 변경과 무관하거나
  머신 부하만의 문제로 단정하지 않는다.
- build는 web 신규 실행·admin과 storybook 캐시 재사용으로 통과했다. 실기기·VoiceOver·터치
  검증은 이번 단계에서도 실행하지 않았다.
- 변경한 account-boundary·signup-status-content·login-page·signup-page의 4개 파일을 단일 worker로
  신규 실행해 49개 테스트가 모두 통과했다.
- 알림 탐색 단독 실행에서는 첫 Stack이 Suspense fallback에 머문 동안 1초 기본 대기가 끝나
  구독 수 검증이 실패했다. 첫 lazy 모듈 준비 대기만 10초(해당 테스트 한도 15초)로 맞춘 뒤
  8개 테스트가 모두 통과했다. 알림 전송·ack·중복 이동 단언과 나머지 대기는 유지했다.
- 최종 `TURBO_ENV_MODE=loose VITEST_MAX_WORKERS=2 node --run check`는 통과했다. 웹 전체
  76개 파일·622개 테스트를 신규 실행했으며 나머지 4개 패키지 테스트는 직전 실행의 Turbo
  캐시를 재사용했다. lint·typecheck는 각각 web 신규 실행·나머지 6개 캐시 재사용이다.
- 이번 검토 단위의 제품·테스트 변경은 10개 파일 약 170줄이며 아직 커밋하지 않았다.
  브랜치 전체 PR 크기 제한과 실기기 검증, 명세의 미완료 통합 항목은 별도로 남아 있다.

## 오류 처리 범위 정정 후 검증

- 사용자 지시에 따라 INVALID_RESPONSE 전용 화면 이동과 그 전용 테스트 2개를 제거했다.
  승인 상태 분기와 대기 화면의 native 정리 실패 안내는 유지한다.
- worker 2개로 전체 check를 다시 통과했다. 웹 76개 파일·620개 테스트는 신규 실행,
  나머지 4개 패키지 테스트는 Turbo 캐시 재사용이다. build도 web 신규 실행·나머지 2개 캐시
  재사용으로 통과했다. 이번 정정은 아직 커밋하지 않았다.

## native 대기 이력·알림 후속 처리 검증

- 앞 단계 변경과 오류 처리 범위 정정을 `facaf451`로 커밋했다.
- T028: 다른 승인 계정·다른 대기 계정·거절·null·신규 가입 필요 응답에 따른 대기 이력 정리와
  교체를 검증했다. 로그인 취소·네트워크 실패·세션 저장 실패 뒤 같은 계정의 승인 전환은 보존되고,
  성공 후에는 이력이 소비된다. 대기 화면 복귀 정리 실패도 상태·이력을 유지하여 재시도할 수 있다.
- T031: PENDING·REJECTED·null에서 앱 시작·복귀·토큰 변경 이벤트가 발생해도 푸시 토큰 조회,
  권한 조회·요청과 기기 등록을 시작하지 않음을 기존 알림 조율기 연결 테스트로 검증했다.
- 두 파일의 86개 테스트가 신규 실행 통과했다. 이번 변경은 테스트·문서이며 제품 코드는 변경하지 않았다.
- 최종 전체 check도 worker 2개로 통과했다. mobile 25개 파일·326개 테스트와 mobile lint·typecheck는
  신규 실행, 나머지 패키지는 Turbo 캐시 재사용이다. 배포 가능한 앱 코드·설정 변경이 없어 build와
  실기기 검증은 다시 실행하지 않았다. 이번 테스트·문서 보완은 아직 커밋하지 않았다.

## 구현 상태 대조와 남은 회귀 보완

- 앞 단계 테스트·문서를 `e5f843a8`로 커밋했다.
- 제한 결과 확정 이후 도착한 정상 세션 조회는 폐기하고 업무 캐시를 제거하는지 상태별로 검증했다.
  구 앱의 누락 필드 보정은 이미 수신 경계 테스트가 검증하므로 다른 계층에 중복하지 않았다.
- Apple 대기 응답, 승인 세션 이후 제한 결과의 기존 자격 제거, 가입 응답의 REJECTED·null을
  추가로 검증했다. 대기 확인 처리 중 확인·취소 버튼 비활성화와 중복 요청 차단도 검증했다.
- 실제 Stackflow에서 대기 상태로 바뀐 뒤 보호 화면 push와 history back/forward로 이전 폼을
  복원하지 못하는 테스트를 추가했고 account-boundary 27개 테스트가 신규 실행 통과했다.
- 구현된 항목은 tasks.md에 반영하고, 오래된 0단계 체크리스트와 계획 상태를 갱신했다.
  전체 기능·운영 검증 완료를 의미하지 않는다. 상태별 이동 횟수·호환 조합의 통합 확인과
  키보드·실기기·VoiceOver 검증, PR 분리·배포 SHA 확인 및 최종 리뷰는 미완료로 남겼다.
- 최종 전체 check를 worker 2개로 통과했다. mobile 330개와 web 625개 테스트는 신규 실행,
  나머지 3개 패키지 테스트는 Turbo 캐시 재사용이다. 테스트·문서만 변경하여 build는 재실행하지 않았다.
  이번 회귀 테스트·문서 정리는 미커밋 상태다.

## 대기 화면 로그인 왕복 통합 검증 보완

- 실제 Stackflow의 기존 같은 계정 승인 사례를 다른 계정 승인까지 확장했다. 같은 계정의
  `PENDING_TO_APPROVED`는 완료 화면, 다른 계정의 `NONE`은 홈으로 이동함을 검증한다.
- 대기 화면의 복귀 확인에서 STORAGE 실패 시 대기 화면과 재시도 안내를 유지하고,
  다음 정리 성공 시 로그인으로 복귀하는 통합 테스트를 추가했다. 제품 코드는 변경하지 않았다.
- 첫 account-boundary 실행은 29개 중 18개 통과·11개 실패였다. 추가한 왕복 사례는 통과했으나
  기존 테스트의 시간 초과·화면 대기 실패가 발생했다. 당시 시스템 load average는 342였다.
  환경 지연만으로 원인을 단정하거나 전체 통과로 기록하지 않는다.
- 전체 check의 첫 실행에서 발견한 조건부 expect lint 오류를 수정하고 재실행했다.
- 최종 전체 `check`는 통과했다. web 76개 파일·627개 테스트와 web lint·typecheck는 신규 실행,
  나머지 4개 패키지 테스트는 Turbo 캐시 재사용이다. account-boundary의 29개 테스트도 모두 통과했다.
  실행 기록은 `.context/approval-roundtrip-check.log`에 있다.
- T020·T023의 완료 근거와 실제 테스트 경로를 작업 목록에 반영했다. 제품 코드 변경이 없어 build를
  재실행하지 않았고, 실기기·접근성 검증은 미실행이다. 이번 변경은 미커밋 상태다.
- 최신 `origin/main` 대비 작업 트리 포함 누적 변경은 추가 3,394줄·삭제 1,707줄이었다(문서 갱신 전).
  PR 제한을 초과하므로 PR 생성 전에 분리해야 한다. 이번에는 PR·배포를 실행하지 않았다.

## 실제 웹 수신 경계와 구 앱 호환 연결

- 앞 단계 회귀 테스트와 문서를 `147e0ef3`으로 커밋했다.
- account-boundary의 대역을 웹 인증 어댑터에서 native RPC 전송 경계로 옮겼다. 기존 상태별
  화면 분기·로그인 왕복·보호 화면 차단도 실제 응답 검증과 정규화를 거친다.
- 구 앱의 `reviewTransition` 없는 SIGNED_IN 응답을 받아 로그인 URL에서 홈으로 이동하는
  통합 테스트를 추가했다. 조회 1회와 로그인 화면 비노출도 확인했다.
- 대역 교체 첫 실행에서 누락된 capability 메서드를 보완한 뒤 account-boundary 30개 테스트가
  신규 실행 통과했다. 제품 코드는 변경하지 않았다.
- T018의 구 앱 수신부터 탐색까지 호환 검증은 보완했지만, 상태별 탐색 횟수의 직접 검증은
  남아 있으므로 항목 전체를 완료 처리하지 않았다. 실제 구 앱 설치·실기기 검증을 대신하지 않는다.
- 타입 import lint 지적을 수정한 뒤 전체 `check`를 통과했다. web 76개 파일·628개 테스트와
  web lint·typecheck는 신규 실행, 나머지 4개 패키지 테스트는 Turbo 캐시 재사용이다.
  기록은 `.context/approval-wire-check.log`에 있다. 테스트·문서만 변경하여 build는 재실행하지 않았다.
- 이번 후속 변경은 미커밋이며 실기기·접근성 검증은 미실행이다. 문서 최종 기록 전 누적 변경은
  `origin/main` 대비 추가 3,459줄·삭제 1,722줄로 PR 분리가 여전히 필요하다.

## 상태별 이동 횟수와 PENDING 전환 경합 수정

- 앞 단계의 구 앱 응답 호환 검증을 `52efc599`로 커밋했다.
- Stackflow의 실제 교체 완료 이벤트를 관찰해 구 앱 복원·일반 승인·대기 후 승인·제한 상태의
  목적지 이동 횟수를 검증했다. 직접 URL은 초기 가드가 화면을 결정하므로 교체 횟수 대신 기존
  보호 화면 비노출 검증을 유지했다.
- 로그인 PENDING 응답에서 SignupStatus 뒤 Login으로 역이동하는 회귀를 재현했다. mutation
  callback이 인증 context 갱신보다 먼저 이동하여 대기 화면 가드가 이전 상태를 읽는 경합이었다.
- 로그인·가입의 제한 상태 이동을 기존 NativeAuthRedirect로 옮겼다. 최상위 Activity에서
  REVIEW_REQUIRED가 반영된 뒤 이동하며 API·브리지 계약과 실패 안내 정책은 바꾸지 않았다.
  수정 후 같은 경계 테스트 33개가 통과했고 가입 폼 제출의 PENDING 회귀도 추가했다.
- 사용자 요청에 따라 실기기 검증은 배포 후 사용자 검증으로 이관했다. T034와 quickstart에
  시점·담당을 명시했으며 미실행 상태를 유지했다. 배포는 실행하지 않았다.
- Modern Web Guidance 1.0.0에서 탐색 상태 동기화와 stack-drill-down을 확인했다. 이 수정은 기존
  Stackflow의 인증 반영 순서 문제로, 가이드의 scroll-snap 기반 탐색·애니메이션 구현은 적용하지 않았다.
- 복구는 이번 웹 변경을 되돌려 직전 호환 빌드로 복구하되, PENDING 역이동 문제가 재발하므로
  native 활성화 전에 수정 웹을 먼저 검증한다. 기존 웹 선배포·native 선복구 계약을 유지한다.
- 전체 `check` 통과: web 76개 파일·632개 테스트와 web lint·typecheck는 신규 실행,
  나머지 4개 패키지 테스트는 Turbo 캐시 재사용이다. 가입 제출까지 account-boundary 34개가 통과했다.
- 전체 `build` 통과: web 신규 실행, admin·storybook 캐시 재사용이다. 기존 큰 chunk 경고는
  남아 있다. 로그는 `.context/approval-navigation-check.log`, `.context/approval-navigation-build.log`다.
- T018의 자동 검증을 완료 처리했다. 후속 경합 수정과 문서는 미커밋이며, 실기기·실기기 접근성은
  배포 후 사용자 검증으로 남겨 두었다.

## PR 분리와 최신 main 통합

- 사용자 요청에 따라 Draft PR 스택으로 분리했다. 원래 브랜치 `DongjaJ/yapp-approval-screen`은
  보존했고, 원본 통합 SHA는 `1eff82e2`, 분리 기준 main은 `971b8ef4`다.
- 최신 main의 출석 목록 50개 조회를 유지하면서 새 API의 문자열 query에 맞춰 `'50'`으로 연결했다.
  생성 코드는 수작업으로 나누지 않았다. 동일한 원본 OpenAPI에서 출석 상세 GET과 연관 스키마
  네 개를 제외한 중간 입력으로 먼저 생성하고, 다음 PR에서 전체 입력으로 다시 생성했다.
- 두 단계의 최종 생성 결과는 원본 통합 SHA의 생성 파일과 완전히 동일하다. 중간 입력에서도
  같은 출석 경로의 PATCH는 유지했다. 입력 해시와 생성 명령은 각 API PR 본문에 기록했다.

| 순서 | 검토 단위                       | PR                                                                | 실제 base 대비 추가/삭제 | 합계 |
| ---- | ------------------------------- | ----------------------------------------------------------------- | ------------------------ | ---- |
| 1    | 명세·계획                       | [#611](https://github.com/YAPP-admin/yapp-plus-frontend/pull/611) | +561 / -0                | 561  |
| 2    | API 기본 계약과 소비 코드       | [#612](https://github.com/YAPP-admin/yapp-plus-frontend/pull/612) | +429 / -69               | 498  |
| 3    | 출석 상세 API 생성 계약         | [#613](https://github.com/YAPP-admin/yapp-plus-frontend/pull/613) | +597 / -1                | 598  |
| 4    | 브리지·웹 인증 상태 기반        | [#615](https://github.com/YAPP-admin/yapp-plus-frontend/pull/615) | +336 / -34               | 370  |
| 5    | 웹 화면·접근 차단·로그인 복귀   | [#616](https://github.com/YAPP-admin/yapp-plus-frontend/pull/616) | +588 / -34               | 622  |
| 6    | native 승인 판정·이력·푸시 차단 | [#617](https://github.com/YAPP-admin/yapp-plus-frontend/pull/617) | +375 / -13               | 388  |
| 7    | 검증 기록                       | `DongjaJ/approval-pr7-validation`                                 | +274 / -0                | 274  |

- 생성 파일만 있는 커밋에서 기존 hook이 oxlint의 검사 대상 없음으로 실패했다. 생성 파일 제외
  규칙을 유지하면서 공식 `--no-error-on-unmatched-pattern` 옵션을 추가해 해결했고 hook을
  우회하지 않았다. 이 보완은 API 생성 PR에 포함했다.
- PR 1–6 각각의 상태에서 전체 `check`를 통과했다. 제품 변경이 있는 PR 2–6은 `build`도
  통과했다. `.context/approval-pr<번호>-check.log`, `-build.log`와 각 PR 본문에 신규 실행과
  Turbo 캐시 재사용을 구분했다. PR 1은 문서 전용이므로 build를 실행하지 않았다.
- 문서 전용 PR 7의 전체 `check`도 통과했으며 5개 패키지 테스트는 모두 Turbo 캐시 재사용이다.
- 최종 제품 상태에서 mobile 335개 테스트를 신규 실행했고, web 639개·admin 731개·bridge
  110개·ui 10개는 앞 단계 성공 캐시를 재사용했다. 최종 build는 세 앱 모두 캐시 재사용이다.
  web 최종 제품 코드는 PR 5에서 신규 테스트·빌드했다. 별도 환경 설정이나 의존성 변경이 없어
  expo:doctor는 실행하지 않았다.
- 스택의 제품 코드가 원본 통합 SHA와 동일함을 파일 비교로 확인했다. 의도적인 추가 차이는
  생성 파일 커밋을 지원하는 hook 옵션과 이 검증 기록뿐이다.
- 선행 PR부터 병합하고, 아래 PR이 main에 반영될 때마다 다음 PR의 base·diff·CI를 다시
  확인한다. 중간 스택을 배포 완료로 보지 않는다. 웹을 native보다 먼저 배포하며 실기기·실기기
  접근성 검증은 배포 후 사용자가 진행한다. 이번 작업에서는 병합·배포하지 않았다.
