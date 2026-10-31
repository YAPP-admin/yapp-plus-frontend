# 검증 기록: 관리자 로그인 API와 세션 연동

## 1단계 — 이슈와 Spec Kit 문서

- 이슈 [#241](https://github.com/YAPP-admin/yapp-plus-frontend/issues/241)을 생성하고 #157을 관련
  결함으로 연결했다.
- 명세 품질 체크리스트의 모든 항목을 통과했고 `[NEEDS CLARIFICATION]`은 없다.
- 생성 client·Staff 로그인 계약·기존 폼과 테스트 구조를 읽어 계획에 반영했다.
- `oxfmt --check specs/014-admin-login-api`가 문서 9개의 format 통과를 확인했다.
- `tasks.md`의 task 16개가 checkbox·ID·story label·파일 경로 형식을 충족한다.
- 새 문서의 whitespace 오류는 없으며 실제 base 대비 변경량은 1단계 리뷰 보고에 기록한다.

## 후속 단계

## 2단계 — 브라우저 token 저장소와 Staff auth 설정

- `admin-session.test.ts`: 7개 테스트 통과. Staff SDK 요청의 실제 `Authorization: Bearer …` 전달도
  MSW 보호 요청으로 확인했다.
- `pnpm --filter @yapp-plus/admin typecheck`: 통과.
- `oxfmt --check` 대상 4개 파일: 통과.
- 저장소 예외 테스트는 happy-dom 전역 prototype spy가 다음 테스트에 남는 문제를 확인한 뒤,
  window 단위 test double로 격리해 해결했다.
- 이 단계에서는 전체 `check`·`build`와 브라우저 수동 검증을 실행하지 않았다.
- 직접 실행한 명령은 Turbo task가 아니므로 Turbo 캐시 재사용은 없다.

## 후속 단계

## 3단계 — 실제 Staff 로그인 API 어댑터

- `login.test.ts`: 7개 테스트 통과.
- `admin-session.test.ts`, `login-form.test.tsx`, `routes/login.test.tsx`를 포함한 로그인 집중
  테스트 22개 통과.
- 관리자 앱 typecheck와 lint 통과.
- 로그인 어댑터·MSW 테스트 format check 통과, `git diff --check` 통과.
- 생성 SDK 요청 body 변환, 401·400·500·네트워크·계약 검증·저장 실패와 기존 token 보존을 확인했다.
- 기존 직접 mock 파일 두 개를 제거했으며 생성 API 파일은 수정하지 않았다.
- 직접 실행한 명령은 Turbo task가 아니므로 Turbo 캐시 재사용은 없다.
- 전체 `check`·`build`와 브라우저 수동 검증은 실행하지 않았다.

## 후속 단계

## 4단계 — 폼 활성화와 늦은 성공 격리

- 기존 form test에 unmount 뒤 늦은 성공과 환경 제한 제거 회귀를 먼저 추가해 실패를 확인한 뒤,
  제출별 mutation callback으로 구현했다.
- `login-form.test.tsx`: 8개 통과.
- `login.test.ts`, `admin-session.test.ts`, `login-form.test.tsx`, `routes/login.test.tsx` 집중
  테스트: 23개 통과.
- 관리자 앱 typecheck와 lint 통과.
- 관련 8개 파일 format check와 `git diff --check` 통과.
- `available` prop과 프로덕션 준비 중 안내를 제거했으며, 정상 성공은 현재 화면에서만 이동한다.
- 전체 `check`·`build`와 브라우저 수동 검증은 실행하지 않았다.
- 직접 실행한 명령은 Turbo task가 아니므로 Turbo 캐시 재사용은 없다.

## 5단계 — 전체 품질·브라우저·보안 검증

- 로그인 집중 테스트 23개 통과.
- `mise exec -- node --run check`: 통과.
  - format: 490개 파일 검사 통과.
  - lint: 7개 task 통과, 5개 Turbo 캐시 재사용, 2개 새 실행.
  - typecheck: 7개 task 통과, 6개 Turbo 캐시 재사용, 1개 새 실행.
  - test: 41개 파일, 493개 테스트 통과. 4개 task 중 3개 캐시 재사용, 관리자 테스트 1개 새 실행.
- `mise exec -- node --run build`: 통과.
  - 3개 build task 성공, 2개 Turbo 캐시 재사용, 관리자 빌드 1개 새 실행.
- MSW 개발 서버(`VITE_API_MOCKING=true`)에서 합성 입력으로 로그인 성공·`/` 이동을 확인했다.
- 동일 브라우저에서 새로고침 후 대시보드가 유지되어 localStorage 세션 유지 흐름을 확인했다.
- 실 API 개발 서버(`VITE_API_MOCKING=false`)에서 로그인 화면과 활성화된 제출 버튼을 확인했다.
- 프로덕션 빌드 서버에서 로그인 버튼이 활성화되고 실제 API 호출 대기 상태로 전환되는 것을 확인했다.
- 실 API 제출과 curl 확인은 외부 endpoint가 10초 이상 응답하지 않아 성공·401 응답까지 확인하지 못했다.
  이는 코드 오류가 아니라 검증 환경의 네트워크/서버 응답 부재로 분류하며, 배포 환경에서 재검증이 필요하다.
- 늦은 성공 격리, 401·400·500·네트워크·잘못된 응답·저장 실패와 Staff bearer 전달은 집중 Vitest에서 확인했다.
- `git diff --check origin/main...HEAD` 통과. 실제 base 대비 변경량은 1,066 additions / 77 deletions로
  800줄 기준을 초과하므로 문서와 구현을 독립 PR로 분리해야 한다. 이번 단계에서는 PR을 생성하지 않았다.
- `git grep`로 실제 테스트 계정 식별자 비기록을 확인했다. 자격 증명과 발급 토큰은 코드·문서·로그·스크린샷에
  기록하지 않았다.
- 롤백은 로그인 어댑터·provider 초기화·화면 활성화 커밋을 되돌리는 방식으로 가능하다. 자동 갱신·접근 가드·
  로그아웃 UI·전역 401 처리는 범위 밖으로 남겼다.
