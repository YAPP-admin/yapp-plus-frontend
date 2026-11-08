# 검증 기록

## 1단계 — 문서·계획·작업 목록

- 기준: `32f4c3d0f52e4b43bcc34326267b497fc2a17feb`. fetch한 origin/main과 동일하며 실제 브랜치는 DongjaJ/api를 유지했다.
- 범위: Spec Kit 문서·요구사항 체크리스트·이슈 초안. 제품 코드·생성 코드·의존성 변경 없음.
- Spec Kit resolver·setup-plan·setup-tasks 실행. gitignored .specify/feature.json은 specs/019-member-notices를 가리킨다.
- setup-plan JSON의 BRANCH는 feature fallback 식별자이며 실제 Git 브랜치를 바꾸지 않았다. extension 설정이 없어 before/after hooks는 적용 대상이 아니다.
- 이전 조사에서 받은 OpenAPI 원본의 SHA-256과 임시 생성물 diff 0줄을 다시 확인했다. 이 단계에서 서버 재배포 여부·실회원 조회·PUT을 새로 검증한 것은 아니다.
- 읽기 전용 조사 검토의 5개 지적을 계약·작업에 반영했다: 강제 GET 복구, callback 격리, 무효 커서 초기화, URL 정규화 경계, 현재 주 필터.
- 문서 교차 검토에서 발견한 오류 UI 이동의 의존 방향 문제를 보완했다. feature에는 탐색 비의존 콘텐츠만 두고 헤더·BackButton은 페이지에 유지한다.
- 사용자 리뷰와 다음 단계 진행 승인을 받은 뒤 [#368](https://github.com/YAPP-admin/yapp-plus-frontend/issues/368) `feature: 회원 공지 조회와 읽음 저장 연동`을 생성했다. 담당자·라벨·milestone은 지정하지 않았다.

## 자동 검증

- 새 실행: Spec Kit prerequisites, 문서 9개의 상대 링크·placeholder·작업 ID/형식·FR 매핑 검사 통과.
- 작업 36개: 준비/기반/마무리 10개, US1 6개, US2 4개, US3 10개, US4 6개. T001~T004 완료, T005 및 제품 작업은 대기.
- `mise exec -- node --run check` 통과. format:check는 853개 파일을 새로 검사했다.
- Turbo 재사용: lint 7/7, typecheck 7/7, test 5/5. 이 결과를 신규 테스트 실행으로 보고하지 않는다.
- 교차 검토 반영 후 문서 포맷·정합성과 `git diff --check`를 다시 확인했다. 전체 제품 검증은 반복하지 않았다.
- 실제 base origin/main 대비 신규 문서 9개, 추가 481줄·삭제 0줄. untracked를 포함하며 650줄 미만이므로 1단계 분리 불필요.
- .context 이슈 초안과 .specify/feature.json은 gitignored 로컬 산출물이다. 전체 check 로그는 .context/member-notices-check.log에 보관한다.

## 미실행·리뷰 상태

- build·expo:doctor·화면·실서버·실기기 검증은 문서만 변경한 1단계 대상이 아니다. 이후 단계의 quickstart 시나리오로 남긴다.
- T005를 완료했다. 2단계 기반의 구현 결과는 별도 리뷰 대기이며 목록 UI와 다음 작업은 시작하지 않았다.
- 이번 문서 검증만으로 본문 렌더링·읽음 경합·계정 격리가 구현 또는 검증됐다고 보지 않는다.

## 2단계 기반 — 조회 계약과 개발 응답

- 생성 `list1Options`와 `list1InfiniteOptions`를 그대로 감싼 query options에 `type` 필터를 추가했다. 응답 경계에서 postId·totalPostCount의 안전한 정수 범위와 양수/0 이상 제약, 비어 있지 않은 nextCursor를 검증한다.
- 날짜는 공통 `koreanTimestamp`를 사용해 달력상 존재하지 않는 날짜도 거부하고, 표시 변환은 서울 시간대·공지 유형·D-day 형식을 담당한다.
- 개발용 MSW handler에는 12개 fixture, 4개 단위 3페이지, 유형 필터, 빈 결과, 첫/다음 페이지 실패와 잘못된 커서 응답을 추가했다. browser/server 모두에 등록했다.
- 회귀 테스트는 single/infinite query key 분리, 필터 전달, 다음 커서, int64·날짜·cursor·음수 count·0 ID 거부, 표시 변환을 확인한다.

## 2단계 기반 자동 검증

- 새 실행: `mise exec -- pnpm --filter @yapp-plus/web typecheck`, `mise exec -- pnpm --filter @yapp-plus/web lint`, `mise exec -- pnpm --filter @yapp-plus/web test -- src/features/member-notice/model/notice-queries.test.ts src/features/member-notice/model/notice-display.test.ts` 통과. 마지막 명령은 Vitest 설정상 web 전체 45 파일·300 테스트를 새로 실행했다.
- 새 실행: `mise exec -- node --run check` 통과. format:check는 859개 파일을 새로 검사했고 web lint·typecheck·test는 cache miss로 실행했다.
- Turbo 재사용: check의 나머지 lint/typecheck는 6/7, test는 5/6 패키지가 캐시를 재사용했다. 캐시 결과는 이번 변경의 신규 실행으로 보지 않는다.
- `git diff --check` 통과. build·화면·실서버·실기기 검증은 이 기반 단계의 대상이 아니며, 목록 UI 단계에서 수행한다.

## 2단계 기반 리뷰 상태

- T006~~T008 완료. 목록 UI(T009~~T014), 홈, Markdown, 상세, 읽음 저장은 사용자 리뷰와 다음 단계 진행 확인 전 시작하지 않는다.

## 2단계 — US1 게시판 목록

- 고정 fixture 목록을 제거하고 생성된 `list1InfiniteOptions` 기반의 실제 목록 query를 연결했다. 로딩·초기 오류·재조회 오류·빈 결과·다음 페이지 로딩을 각각 구분한다.
- 공지 탭은 `ALL`, `SESSION`, `ASSIGNMENT`, `OPERATION` OpenAPI 값을 사용한다. 선택 값은 `/notices?category=…`으로 정규화하고, 상세 이동 뒤 browser back에서도 복원한다.
- 출석 내역에 있던 활성 Activity 한정 IntersectionObserver를 shared lib로 옮겨 공지 목록과 공유한다. 다음 페이지는 기존 요청 중 중복 호출하지 않는다.
- UI 자동 검증은 서버 fixture 렌더링, 유형 전환, 상세 링크, 세 페이지 연결과 Stackflow의 category URL·back 복원을 확인한다.
- 로컬 브라우저 스크린샷은 Computer Use 브라우저가 localhost 연결을 제공하지 않아 수행하지 못했다. 테스트 DOM과 production build로 대체 확인했으며 실기기·스크린 리더 검증은 남아 있다.

## 2단계 — US1 자동 검증

- 새 실행: web 전체 Vitest 45 파일·306 테스트 통과. `node --run check`와 web production build는 rebase 직후 통과했다.
- rebase: `origin/main`의 `9008b08c` 위로 충돌 없이 재적용했다. 완료 HEAD `a1293495`, `git range-diff`에서 두 공지 커밋의 변경 보존을 확인했다.

## 3단계 — US2 홈 주간 공지

- 홈의 고정 공지 배열을 `list1Options` 첫 페이지 조회로 교체했다. 응답은 서울 일~토 범위로 거르고 원래 서버 순서를 유지한 채 세 건까지만 표시한다.
- 목록 query의 기본 `staleTime`과 focus 재조회 정책을 사용한다. 주 경계를 계산해 별도로 강제 재조회하지 않는다.
- 공지 Suspense/ErrorBoundary는 세션·출석 카드와 별도 경계에 두었다. 공지 조회 실패는 `ResultSection`의 다시 시도로 복구하며 다른 홈 콘텐츠를 가리지 않는다.
- MSW `weekly` 시나리오는 첫 페이지의 네 건 fixture를 제공한다. 모델 테스트는 서울 토요일·일요일 경계, 지난주 제외, 0/1/4건을 확인하고 홈 테스트는 상세 링크와 독립 오류 복구를 확인한다.

## 3단계 — US2 자동 검증

- 새 실행: `mise exec -- pnpm --filter @yapp-plus/web test -- src/pages/home/model/weekly-notices.test.ts src/pages/home/ui/home-page.test.tsx`는 Vitest 설정상 web 전체 46개 파일·311개 테스트를 실행해 통과했다.
- 새 실행: `mise exec -- node --run check` 통과. format:check는 864개 파일을 새로 검사했고, web lint·typecheck·test는 cache miss로 실행했다.
- Turbo 재사용: check의 lint·typecheck는 나머지 6/7 패키지, test는 나머지 4/5 패키지가 캐시를 재사용했다. 캐시 결과를 이번 단계의 신규 검증으로 보지 않는다.
- 새 실행: `mise exec -- pnpm --filter @yapp-plus/web build` 통과. Vite가 기존 500 kB 초과 chunk 경고를 출력했지만 빌드를 실패시키지 않았고, 이번 변경으로 번들 분할 정책을 변경하지 않았다.
- `git diff --check` 통과. 로컬 브라우저·실기기·스크린 리더 검증은 Computer Use 브라우저가 localhost 연결을 제공하지 않아 미실행이며, 테스트 DOM과 production build로 대체 확인했다.

## 4단계 — US3 Markdown 렌더러

- `react-markdown` 10.1.0을 pnpm catalog와 web 의존성으로 고정했다. 본문은 상세 화면의 Markdown 문자열만 받는 독립 UI이며, 현재 고정 fixture에도 연결해 표시를 확인했다. 실제 상세 API 연결과 고정 fixture 제거는 5단계에서 수행한다.
- `skipHtml`로 raw HTML·JSX를 무시한다. 링크와 이미지는 절대 HTTP(S) URL만 허용하고, 링크는 새 창의 `noopener noreferrer`로 연다. 허용하지 않은 URL과 이미지 로드 실패는 텍스트 대체 표시로 남긴다.
- 본문 최상위 h1은 화면 제목 아래 h2로, h2는 h3로 낮춘다. 문단·목록·인용·인라인/블록 코드·긴 링크의 읽기 레이아웃을 전용 스타일로 제공한다.
- 사용자 선택으로 `react-markdown`을 유지한다. 이 패키지는 unified 기반 확장성과 HTML 미해석 경계를 제공하지만 transitive 의존성이 많아, 이번 단계는 PR 크기 예외를 적용한다.

## 4단계 — US3 자동 검증

- 새 실행: `mise exec -- pnpm --filter @yapp-plus/web test -- src/pages/notice-detail/ui/notice-markdown.test.tsx`는 Vitest 설정상 web 전체 47개 파일·314개 테스트를 실행해 통과했다.
- 새 실행: `mise exec -- pnpm --filter @yapp-plus/web lint`, `mise exec -- pnpm --filter @yapp-plus/web typecheck`, `mise exec -- pnpm --filter @yapp-plus/web build`, `git diff --check` 통과했다. build는 500 kB 초과 chunk 경고를 출력했다.
- 상세 fixture 연결 후 build에서 activities chunk는 462.03 kB(gzip 135.54 kB)에서 582.48 kB(gzip 172.94 kB)로 증가했다. index chunk는 523.99 kB(gzip 157.66 kB)에서 gzip 157.67 kB로 사실상 동일하다. 사용자 승인 범위 안에서 이 비용을 유지하며, 실제 상세 query 연결 뒤 다시 측정한다.
- catalog·package·lockfile은 +667/-202줄이고 렌더러·스타일·테스트는 신규 244줄이다. 합계 +911/-202줄로 일반 PR 제한을 초과하며, 사용자가 `react-markdown` 유지를 선택해 예외를 승인했다.
- 로컬 브라우저·실기기·스크린 리더 검증은 Computer Use 브라우저가 localhost 연결을 제공하지 않아 미실행이다. 컴포넌트 테스트에서 링크 접근 이름·새 창 속성과 이미지 오류 대체 문구를 확인했다.
