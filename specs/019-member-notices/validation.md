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
