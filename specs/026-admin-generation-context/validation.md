# 검증 기록

## 1단계 — 2026-11-19

- 기준 HEAD·origin/main: `4344a9e244ff17100f0e9b25858e07c886df2241`.
- 브랜치 `DongjaJ/api-v3` 유지. 시작 시 작업 트리는 깨끗했다.
- 같은 목적의 열린 이슈가 없어 `issue-draft.md`에 초안을 작성했고, 사용자 승인 후
  [#480](https://github.com/YAPP-admin/yapp-plus-frontend/issues/480)으로 생성했다.
- 명세·계획·조사·모델·계약·검증 절차·26개 작업·품질 체크리스트를 작성했다.
- Spec Kit 템플릿 해석과 setup-plan/setup-tasks를 실행했다. 확장 hook 설정은 없다.
- 로컬 `.specify/feature.json`은 새 문서를 가리킨다. 스크립트의 BRANCH 출력은 기능 디렉터리명이며
  실제 Git 브랜치는 변경하지 않았다. 이 로컬 파일과 `.context/`는 Git 제외 대상이다.
- 공개 OpenAPI는 최초 503 뒤 재조회 성공했다. 수신 원본과 해시는 `research.md`를 참고한다.
- SDK 재생성·제품 코드 변경·브라우저·실서버 CRUD는 수행하지 않았다.

### 검증 상태

- 문서 포맷: 새로 실행해 통과. 의존성이 없어 pnpm이 lockfile 기준으로 로컬 설치를 수행했다.
- 로컬 문서 링크·미해결 표식·26개 작업 ID 검사: 새 실행 통과.
- Spec Kit `check-prerequisites.sh --json --require-tasks --include-tasks`: 새 실행 통과.
- `mise exec -- node --run check`: 통과. format:check는 새 실행, lint 7/7·typecheck 7/7·test 5/5는
  모두 Turbo 캐시 재사용이다. 이번에 제품 테스트를 새로 실행했다고 보지 않는다.
- 캐시의 테스트 기록은 app-bridge 96·ui 10·mobile 284·web 519·admin 698건이다.
- 전체 명령 로그: `.context/admin-generation-stage1-check.log`.
- 문서 갱신 후 포맷과 링크·작업 형식을 다시 확인했다. 코드 변경이 없어 전체 check는 반복하지 않았다.
- build·expo:doctor: 문서만 변경하여 미실행. 제품 단계에서 build를 실행한다.
- 남은 위험: 생성물 diff·실제 인증 기수 응답·선택 UI·CRUD 동작은 후속 단계에서 검증해야 한다.

### 리뷰 대기

문서의 기본 기수·선택 수명·실패 범위·전환 중 화면 폐기 정책을 리뷰했고, 사용자 지시로
2단계 API 재생성을 시작한다.

### 검토 반영 — 기수 조회 실패 범위

- 기수 목록은 모든 관리자 데이터의 선행 조건이므로 `ready` 상태 분기와 기수별 부분 안내를
  제거한다.
- Provider는 `useSuspenseQuery`, 관리자 레이아웃은 단일 Suspense·오류 경계를 사용한다.
  목록 오류면 관리자 작업 영역 전체가 재시도 화면으로 대체된다. 401은 오류 화면을
  표시하지 않고 access token을 삭제한 뒤 즉시 `/login`으로 이동한다.
- 이 결정은 문서 단계에서 반영했다. 제품 코드·전체 check는 변경하지 않았다.

## 2단계 — 2026-11-19

- 최신 OpenAPI를 `.context/admin-generation-openapi.json`에 저장했다. SHA-256은
  `4a28b22002ee6c1cb68ef224332bb12643adc82af2a1e2ccc381587ed770138b`이다.
- 기존 생성 명령으로 `@yapp-plus/api`를 재생성했다. `GET /api/admin/generations`의
  `list2`와 기수 목록 타입·Zod 스키마·TanStack Query 옵션이 생성물에 추가됐다.
- 같은 명세 갱신으로 기존 목록 operation 이름이 한 칸씩 이동했다. 경로 기준으로 mock과
  관리자 출석 계약 테스트를 수정했다. 출석 요약의 `lateCount`·`reportCount`도 실제 값으로
  소비한다.
- 기수 목록 mock은 `33기`(ID 33)와 `32기`(ID 32)를 번호 내림차순으로 반환한다. 계약 테스트로
  `/api/admin/generations` 응답을 검증한다.
- 새 `CHECKED_IN`·`PENDING_APPROVAL` 출석 상태는 회원 웹의 표시 문구와 비활성 버튼 상태를
  추가했다. 날짜 고정으로 실패하던 Stackflow 출결 보고 테스트는 현재 날짜 기준의 유효한 주간
  범위와 다음 날 세션을 사용하도록 보정했다.

### 검증 상태

- `mise exec -- pnpm --filter @yapp-plus/api typecheck`: 새 실행 통과.
- `mise exec -- pnpm exec vitest run src/mocks/api-contract.test.ts` (`apps/admin`): 새 실행 통과,
  6건.
- `mise exec -- pnpm exec vitest run stackflow/src/stack.test.tsx -t '출결 보고 시트에서 실제 제출하면 홈으로 돌아가고 알림을 표시한다'` (`apps/web`): 새 실행 통과, 1건.
- `mise exec -- node --run check`: 새 실행 통과. format:check는 새 실행, lint·typecheck는 변경된
  admin/api/web/mobile 작업을 새로 실행했고, test는 admin 698·web 521·mobile 284건을 새로 실행했다.
  app-bridge 96·ui 10건은 Turbo 캐시를 재사용했다. 마지막 재실행은 모든 작업 캐시를 재사용했다.
- `mise exec -- node --run build`: 통과. admin·web build는 새 실행, storybook build는 Turbo 캐시를
  재사용했다.

### 리뷰 대기

공통 생성 계약과 회귀 수정은 완료했다. 3단계에서는 이 계약을 사용하는 Suspense 기수 Provider와
전역 오류 경계를 구현한다. 이 단계의 제품 코드는 아직 추가하지 않았다.

## 3단계 — 2026-11-19

- `AdminGenerationProvider`가 `useSuspenseQuery`로 기수 목록을 조회하고, 목록의 첫 기수를
  기본 선택한다. 목록 응답은 생성된 Zod 스키마로 검증한다. 기수 배열은 서버 계약상 하나 이상이므로
  별도 길이 검증을 두지 않는다. Context에는 목록·현재 기수·목록에 있는 ID만 허용하는 선택 함수만 둔다.
- 대시보드 전체를 `ClientOnly`와 기수 조회 오류 경계로 감쌌다. 토큰이 없으면 조회 전에
  `/login`으로 이동한다. 401이면 access token을 삭제하고 진행 중 Query를 취소·제거한 뒤
  `/login`으로 이동하며, 그 밖의 오류는 작업 영역을 재시도 UI로 대체한다.
- 로그인 성공은 대시보드로만 이동한다. 사이드바는 현재 기수를 표시하고, 세션 목록은 Context의
  기수 ID만 사용한다. `VITE_ADMIN_GENERATION_ID`와 관련 설정 모듈·테스트는 제거했다.

### 검증 상태

- `mise exec -- pnpm --filter @yapp-plus/admin typecheck`: 새 실행 통과.
- `mise exec -- pnpm exec vitest run src/features/admin-generation/model/admin-generation.test.tsx src/router.test.tsx` (`apps/admin`): 새 실행 통과. 기본 선택·잘못된 응답 오류·토큰 없음·401·일반 오류 재시도를 확인했다.
- `mise exec -- pnpm exec vitest run --maxWorkers=4` (`apps/admin`): 새 실행 통과, 75개 파일·699건.
- `mise exec -- node --run check`: format:check·lint·typecheck는 통과했다. admin 전체 test는 75개
  병렬 worker의 자원 경합으로 변경 범위 밖의 4건이 5초 timeout으로 실패했다. `--maxWorkers=4`도
  공지 편집기 테스트 1건이 조회 대기 상태에서 실패했지만, 해당 파일 단독 재실행은 3건 모두 통과했다.
- 최종 코드 기준 `mise exec -- pnpm --filter @yapp-plus/admin typecheck`와 기수 Provider·라우터
  대상 Vitest는 새 실행 통과(2개 파일·110건)했다.
- `mise exec -- node --run build`: 최종 재실행 통과. admin build는 새 실행했고, web·storybook build는
  Turbo 캐시를 재사용했다.
- 브라우저·실서버 확인은 승인된 관리자 access token과 테스트 데이터가 없어 미실행했다. 경계와
  세션 요청 차단은 MSW 라우팅 테스트로 확인했다.

### 리뷰 대기

최신 기수 자동 선택과 세션 CRUD 연결을 구현했다. 다음 단계의 기수 전환 UI는 사용자 리뷰와 진행
확인 전에는 시작하지 않는다.

### 후속 검증 — 테스트 timeout 안정화

- 관리자 Vitest를 최대 4개 worker와 10초 test timeout으로 제한하고, Testing Library의 비동기
  대기 시간도 10초로 맞췄다. 라우터·오버레이 UI 테스트가 공유 개발 환경의 과도한 worker 경합으로
  실패하지 않도록 한 테스트 실행 설정 변경이다.
- `mise exec -- pnpm --filter @yapp-plus/admin test`: 새 실행 연속 3회 통과, 매회 75개 파일·701건.
- `mise exec -- node --run check`: 통과. format:check는 새 실행, admin lint·typecheck·test는 새
  실행했고, 다른 패키지 lint·typecheck·test는 Turbo 캐시를 재사용했다.
