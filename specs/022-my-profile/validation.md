# 검증 기록

## 1단계 — 이슈와 명세

- 기준일: 2026-11-10. 실제 브랜치 `DongjaJ/api-v2` 유지.
- `git fetch origin` 후 HEAD와 `origin/main`은 `7bd77d09035d8c1a317469bc4d03caedb25955f1`, 시작 작업 트리는 깨끗했다.
- 승인된 [이슈 #413](https://github.com/YAPP-admin/yapp-plus-frontend/issues/413)을 생성하고 제목·본문·OPEN 상태·담당자 `DongjaJ`를 재조회했다. 추가 라벨·milestone 없음.
- Spec Kit 템플릿 해석, setup-plan·setup-tasks가 `specs/022-my-profile/`을 선택함을 확인했다. 스크립트의 BRANCH 출력은 기능 디렉터리 이름이며 실제 Git 브랜치와 구분한다.
- `.specify/feature.json`은 gitignored 로컬 기능 선택 상태다. 브랜치·헌법·상위 템플릿은 변경하지 않았다.
- `.specify/extensions.yml`이 없어 specify·plan·tasks의 전후 hook은 실행 대상이 없다.
- 생성기·SDK·제품 코드·개발 mock은 변경하지 않았다. 명세 품질 체크 완료는 구현 또는 사용자 승인 완료를 뜻하지 않는다.
- 신규 실행: 문서 9개 링크·미치환 표식 검사, 작업 27개 연속 ID·경로·스토리 분류 검사, 명세 품질 16항목 검토가 통과했다. US1 6개·US2 4개·US3 3개·공통 14개 작업이며 T001~T003 완료, T004 사용자 리뷰부터 미완료다.
- `mise exec -- node --run check` 성공. format:check는 신규 실행, lint 7/7·typecheck 7/7·test 5/5 작업은 모두 Turbo 캐시 재사용이다. 테스트를 이번에 새로 실행한 것으로 보지 않는다.
- 로그: `.context/profile-stage-1-check.log`. 기존 테스트의 예상 오류 출력도 캐시 로그 재생이며 명령 종료 코드는 0이다.
- 문서만 변경했으므로 build·expo:doctor·브라우저·WebView·실서버 인증 조회는 이번 단계에서 미실행이다. 생성 호환성과 실제 프로필 동작은 아직 검증되지 않았다.
- 기본 의존성이 없던 환경에서 pnpm exec가 고정 lockfile의 로컬 저장소 패키지를 연결하고 prepare를 실행했다. package.json·lockfile 변경은 없다.
- 최종 문서 포맷·untracked 파일을 포함한 whitespace 검사를 확인한다. 아래 변경량은 신규 문서도 포함한다.
- 변경량: merge-base `7bd77d09035d8c1a317469bc4d03caedb25955f1` 대비 문서 9개 추가, +501/-0줄. 현재 650줄 미만으로 1단계 분리 불필요. 후속 생성·연동 변경은 다시 합산해야 한다.
- 사용자 리뷰 및 2단계 진행 승인: 대기.

## 2단계 — 공용 생성 기반과 호환성

- 최신 명세는 2026-11-10에 `https://44nk4mnqi7.execute-api.ap-northeast-2.amazonaws.com/v3/api-docs`에서 받았다. 최초 조회는 503이었고 재시도에 성공했다. `.context/profile-openapi.json`의 SHA-256은 `6035d754ee1ed2400583b3f4be2160ffe6791493a36cff5c6934bc2f7558bd96`다.
- OpenAPI 3.1.0에서 `GET /api/users/me`의 operationId `find_2`, 200·401·409·503 응답과 `userId`, `name`, `membershipStatus`, `generationId`, `generationNumber`, `position` 여섯 필수 키를 확인했다.
- `OPENAPI_INPUT="$PWD/.context/profile-openapi.json" mise exec -- pnpm --filter @yapp-plus/api generate`로 `packages/api/src/generated/` 7개 파일을 재생성했다. 생성 파일은 직접 수정하지 않았다.
- `find2`가 새 프로필 조회가 되면서 알림·현재 주·일정·출석 이력·운영 이력의 번호형 생성 operation이 각각 한 칸 이동했다. 웹 Query·SDK·MSW handler·고정 fixture·회귀 테스트와 README를 HTTP 경로 기준으로 맞췄다. 관리자 앱은 해당 번호형 소비가 없어 수정이 없었다.
- 생성 client의 validator가 원본 JSON을 유지하는 경계와 기존 Zod 사용을 확인했다. 새 프로필 연결은 다음 단계에서 추가한다.
- 신규 실행: 웹·API·관리자 typecheck와 `mise exec -- node --run check`, `mise exec -- node --run build`가 모두 성공했다. check는 lint·typecheck 7개 작업 중 각 3개, test 5개 중 2개가 Turbo 캐시 재사용이었고 나머지는 신규 실행이다. build는 3개 중 1개가 캐시 재사용이고 2개가 신규 실행이다.
- 로그: `.context/profile-stage-2-check.log`, `.context/profile-stage-2-build.log`. `git diff --check`가 통과했다. 브라우저·WebView·실서버 인증 조회는 3~4단계 범위라 미실행이다.
- 변경량은 2단계 작업만 +532/-287줄(생성 7개 파일 +532/-287, 소비 코드·테스트·README·mock +116/-116)이다. 1단계 커밋을 포함한 `origin/main` 대비 누적 변경량은 +1115/-369줄로 800줄 제한을 넘는다. 후속 프로필 UI를 시작하기 전에 PR 분리 방안을 확정해야 한다.
- 사용자 리뷰 및 3단계 진행 승인: 2026-11-10 사용자가 생성 계약·호환성 수정을 하나의 작업으로 취급하고 전체 커밋 뒤 3단계를 진행하도록 지시했다. 생성 파일만으로 800줄을 넘는 사유를 기록했으며, 이 변경은 독립 분리하지 않는다.

## 3단계 — 프로필 조회 연결

- 생성한 `find2Options`에 화면 전용 응답 validator를 연결했다. `int64`를 `number`로 안전하게 표현할 수 없는 `userId`·`generationId`는 성공 캐시에 넣지 않으며, 생성 client가 유지하는 원본 JSON number는 그대로 반환한다.
- API 응답의 이름·회원 상태·기수·직군만 표시하고 세션 이름 fallback을 제거했다. 모든 회원 상태와 직군, null 소속을 단위 테스트로 확인했다.
- 프로필 조회는 출석 조회와 별도 `ScreenQueryBoundary`·Suspense 경계로 분리했다. 프로필 지연·409·503·네트워크 오류·최초 실패 재시도에도 출석 현황·메뉴·규칙을 유지한다. 재조회 실패는 마지막 성공 값을 조용히 유지한다.
- 개발 MSW에서만 프로필 fixture를 공용 fallback보다 먼저 제공한다. 일반 브라우저에서는 프로필과 출석 API 모두 요청하지 않고 로그인 안내를 보인다.
- 계정 전환 시 이전 프로필의 지연 응답을 취소하고 캐시를 비운다. 화면 복귀는 기존 `useRefetchOnScreenReturn` 정책을 사용한다.
- 신규 실행: `pnpm --filter @yapp-plus/web exec vitest run src/pages/my/ui/my-page.test.tsx src/pages/my/model/profile-model.test.ts src/pages/my/model/profile-query.test.ts src/features/auth/model/session-queries.test.ts`에서 4개 파일 40개 테스트, 웹 typecheck가 통과했다.
- 신규 실행: `mise exec -- node --run check`가 통과했다. format:check는 새로 실행했고, lint·typecheck는 7개 중 웹 1개가 새로 실행되고 6개는 Turbo 캐시를 재사용했다. test는 5개 중 웹 1개가 새로 실행되어 웹 56개 파일·410개 테스트가 통과했고, 나머지 4개는 캐시를 재사용했다.
- 신규 실행: `mise exec -- node --run build`가 통과했다. 3개 build 중 웹 1개가 새로 실행되고 2개는 캐시를 재사용했다. 기존 웹 번들 500kB chunk 경고는 남아 있으나 이번 변경으로 새 오류가 되지는 않았다.
- 로그: `.context/profile-stage-3-final-check.log`, `.context/profile-stage-3-final-build.log`. `git diff --check`가 통과했다.
- 현재 `origin/main` 대비 변경량은 untracked 파일을 포함해 +1533/-424줄(총 1957줄)이다. 생성 계약 갱신의 큰 변경량과 이를 하나의 작업으로 유지하라는 사용자 지시를 2단계에 기록했다.
- 모바일 너비·긴 이름·테마·키보드·터치·스크린 리더의 실제 화면, 인증된 WebView·실서버 프로필 조회는 4단계에서 확인한다.
- 사용자 리뷰 및 4단계 진행 승인: 대기.

## 후속 단계

4단계 최종 검증·실서버/WebView·접근성 확인 결과는 각 단계 실행 후 추가한다.

## 4단계 — 최종 검증

- 정적 접근성 점검: 프로필 이미지는 대체 텍스트 `프로필`을 제공한다. 최초 로딩은 `output`과 `aria-live="polite"`, 최초 오류는 `role="alert"`·`aria-live="polite"`, 최초 실패 재시도는 이름이 있는 기본 버튼을 사용한다. 긴 이름에는 `minWidth: 0`과 `overflowWrap: anywhere`를 적용했고, 색상은 SEED 토큰을 사용한다.
- 실제 화면 점검은 미실행이다. 개발 서버를 `VITE_STATIC_CONTENT=false VITE_API_MOCKING=true`로 실행했으나, 브라우저 자동화 연결은 로컬 탭 생성 시 `Cannot read properties of undefined (reading 'timeoutMs')`를 반환했고 in-app browser도 사용할 수 없었다. 따라서 모바일 너비·라이트/다크 모드·키보드·터치·스크린 리더 화면 캡처는 만들지 못했다.
- 인증된 WebView·실서버 `GET /api/users/me` 검증은 인증 토큰과 실행 가능한 WebView 환경이 제공되지 않아 미실행이다. 자동 테스트나 개발 MSW 결과로 이를 대신 주장하지 않는다.
- `mise exec -- node --run check`, `mise exec -- node --run build`, `git diff --check`가 통과했다. 이번 최종 check의 lint·typecheck 7개와 test 5개, build 3개는 모두 Turbo 캐시를 재사용했으므로 새 실행으로 간주하지 않는다. 변경에 따른 새 실행 결과는 3단계 기록을 기준으로 한다.
- 로그: `.context/profile-stage-4-check.log`, `.context/profile-stage-4-build.log`. `origin/main` 대비 변경량은 +1522/-424줄(총 1946줄)이다. 800줄 초과는 2단계에 기록한 사용자 지시에 따라 하나의 작업으로 유지한다.
- 완료 대조: T001~~T023·T025~~T027은 기록과 실제 결과가 일치한다. T024만 브라우저 연결 제약으로 미완료이며, 화면·접근성 검증과 캡처를 재개할 수 있는 환경에서 수행해야 한다.

## 시뮬레이터 보완 확인

- iOS 17.5 iPhone 15 Simulator에서 이 워크트리의 Metro(`localhost:8081`)와 WebView 개발 서버(`localhost:3000`)를 연결했다. 인증된 로컬 WebView의 마이페이지에서 프로필 API가 반환한 이름과 null 소속·기수·직군의 `—` 표시를 확인했다. 세션 이름 fallback은 구현에 없으므로 표시된 이름은 프로필 조회 성공 근거다.
- 일반 iPhone 15 너비에서는 프로필·출석 현황·메뉴가 가려지거나 가로로 넘치지 않았다. 실제 사용자 이름 등 개인정보는 검증 기록과 캡처에 남기지 않았다.
- 긴 이름·키보드·터치·스크린 리더 점검은 이번 확인 범위에 포함하지 않아 T024는 계속 미완료다.
- iOS Simulator의 시스템 다크 모드도 확인했으나 WebView는 현재 라이트 팔레트를 유지했다. 시스템 테마 전환을 지원하는 화면이 아니라는 기존 동작이며, 다크 전용 색상·대비 평가는 적용할 대상이 없다. 테스트 후 Simulator는 라이트 모드로 복원했다.
- Device Hub의 키보드 전달을 활성화해 Tab 입력을 보냈으나 iOS Simulator의 Full Keyboard Access가 비활성화되어 WebView 내 포커스 이동은 확인할 수 없었다. 이 접근성 시스템 설정은 변경하지 않았으며, 재시도 버튼의 키보드·스크린 리더 실기기 검증은 미완료다.
- 긴 API 이름은 `MyPage` 화면 테스트에서 렌더링과 `overflowWrap: anywhere`를 소유한 프로필 이름 스타일 클래스 연결로 확인했다. `pnpm --filter @yapp-plus/web exec vitest run src/pages/my/ui/my-page.test.tsx`는 14개 테스트가 통과했다.
- 사용자는 실기기 키보드·스크린 리더 점검을 후속 작업으로 보류했다. T024는 미완료로 유지하며, 현재 구현·자동화 검증 범위에서는 추가 변경이 없다.
