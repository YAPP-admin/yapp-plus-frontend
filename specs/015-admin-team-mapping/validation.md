# 검증과 단계 리뷰 기록

## 1단계 — 2026-11-02

- 기준: origin/main = HEAD = fad37b2a50e91d820016166e6ccd39f4c8bdf66c, 시작 작업 트리 깨끗함.
- 실제 브랜치: DongjaJ/team-mapping-plan. 브랜치·commit·push·PR·원격 이슈 변경 없음.
- 변경: Spec Kit 명세·계획·조사·모델·화면 계약·작업·검증 안내·품질 체크리스트·이슈 초안과 feature 위치.
- 관련 열린 이슈 없음: GitHub 검색으로 ‘팀 매핑’·‘팀 맵핑’을 각각 확인한 뒤, [이슈 #273](https://github.com/YAPP-admin/yapp-plus-frontend/issues/273)을 생성하고 `gh issue view`로 제목·본문·상태·URL을 확인했다.
- 문서 검증 새 실행: 상대 링크·템플릿 잔여·48개 작업 ID/경로/스토리·12개 Figma 노드 점검 통과. 문서 품질 체크리스트 통과.
- 기본 check 통과: format:check 새 실행, lint 7/7·typecheck 7/7·test 4/4는 모두 Turbo 캐시 재사용. 테스트 710건은 새 실행이 아니다.
- 실행 로그: .context/team-mapping-stage1-check.log. pnpm 최초 실행 시 고정 lockfile의 의존성을 로컬 캐시에서 설치했으며 manifest/lockfile 변경은 없다.
- build·브라우저·화면·접근성·expo:doctor: 미실행. 제품/빌드/모바일 변경 없는 문서 단계이며 제품 검증은 후속이다.
- Figma 조사: 계획 수립 때 12개 design context·스크린샷 확인. 이번에 구현 화면을 검증한 것은 아니다.
- 문서 재검토: 운영 fixture·최소 인원과 개별 취소·쿼리 이탈·후속 연결을 확인했다. 확정 조회 조작 비활성 및 읽기 전용 요약의 기존 예정 보존을 명확히 했다.
- 변경량: 실제 base origin/main 대비 신규 문서 10개 +577/-0, 합계 577줄. 650줄 미만으로 분리 불필요. untracked 문서도 합산했다.
- .specify/feature.json은 기존 ignore 정책의 로컬 포인터 3줄이며 PR diff 대상이 아니다. 명세 디렉터리 015-admin-team-mapping을 가리킨다.
- 사용자 리뷰: 대기. 2~12단계는 미착수.

## 2단계 — 2026-11-02

- 변경: `apps/admin/src/features/team-management/model/`에 원본 snapshot 타입·Zod 무결성 검증·직군 집계·필터 집계·후보 검색·생성 입력·변경 예정 검증을 추가하고 `index.ts` 공개 진입점을 만들었다.
- 규칙: PM·Design 누락 분류, 이름/직군 검색 별칭, 팀원 1명 필수, 중복/존재하지 않는 회원 차단, 기존 팀 최소 1명 유지, 원본 통계 불변을 순수 함수로 구현했다.
- 근접 테스트: 관리자 전체 테스트 실행 결과 62개 파일·605개 테스트 통과. 새로 실행했으며 Turbo 캐시를 사용하지 않았다.
- 타입 검사: `pnpm --filter @yapp-plus/admin typecheck` 새 실행 통과.
- 포맷: 팀 매핑 모델 파일에 `oxfmt` 적용 후 검사 통과.
- 주석 기준: [프론트엔드 개발 가이드](../../docs/frontend-development.md)에 파일 책임·공개 타입/함수 계약·정책 경계 주석 기준을 추가하고, 2단계 모델·테스트·공개 진입점에 한국어 주석을 보강했다.
- 주석 반영 후 관리자 lint·typecheck와 관리자 전체 테스트 62개 파일·605개 테스트를 다시 실행해 통과했다.
- lint/build: 단계 변경에 대해 lint는 아직 미실행, 앱 build는 UI·라우트가 없는 모델 단계라 미실행.
- 브라우저·스크린 리더·터치·Figma 비교: 미실행. UI 단계에서 수행한다.
- 변경량: 2단계 코드 5개 파일 +640/-0줄, 문서 +589줄과 가이드 변경을 합산하면 현재 작업 트리의 base 대비 +1229/-0줄 이상으로 800줄 제한을 초과하므로, commit/PR 단계에서 문서와 모델을 독립 검토 단위로 분리해야 한다. 파일을 제외하지 않고 합산했다.
- 리뷰 상태: 사용자 리뷰 대기. 3단계 fixture 구현은 시작하지 않는다.

## 3단계 — 2026-11-02

- 변경: `model/team-fixtures.ts`에 before/draft/confirmed 합성 snapshot과 고정 확정 이력을 추가하고, `fixtures.ts`에서 환경 공통 공급 진입점을 공개했다.
- 입력 사례: 후보 52명, draft 8팀·42명 배정·10명 미배정, confirmed 8팀 구성 완료·9명 미배정, 동명이인·1명 팀·긴 이름·서비스명 없음·검색 결과 없음 사례를 포함한다.
- 무결성: 모든 회원·팀·팀장 참조를 `teamMappingSnapshotSchema`로 검증하고, 환경 분기·API 요청·저장소를 추가하지 않았다.
- 근접 테스트: `mise exec -- pnpm --filter @yapp-plus/admin test -- src/features/team-management/model/team-fixtures.test.ts src/features/team-management/model/team-mapping.test.ts src/features/team-management/model/team-draft.test.ts` 실행. 스크립트 특성상 관리자 전체 63개 파일·613개 테스트가 새로 실행되어 통과했다.
- 품질 게이트: `mise exec -- node --run check` 통과. admin lint/typecheck/test는 새 실행, 나머지 패키지는 Turbo 캐시 재사용.
- build: `mise exec -- node --run build` 통과. admin build는 새 실행, Storybook·기타 build는 Turbo 캐시 재사용.
- 포맷·diff: `oxfmt`와 `git diff --check` 통과. 새 fixture 파일·공급부에 한국어 파일·공개 함수 주석을 추가했다.
- 변경량: `origin/DongjaJ/team-mapping-model...HEAD` 기준 +304/-6줄, 합계 310줄로 800줄 미만이다. untracked 파일은 commit 전에 합산했다.
- 사용자 리뷰: 대기. 4단계 경로·화면 구현은 시작하지 않는다.

## 남은 검증과 위험

문서가 제품 동작을 보증하지 않는다. fixture 구현·초안 보호·접근성·환경별 화면 검증은 tasks.md의 미완료 항목이다.
최신 OpenAPI 원문은 조회 시간 초과로 검증하지 못했다. 이번은 생성 API를 변경하거나 연결하지 않는다.
외부 기능명세서·용어 문서는 접근되지 않았으며 Figma·사용자 확정 범위를 따른다.

## 4단계 — 2026-11-02

- 변경: `/members/teams` 라우트와 URL `preview`·`filter` 스키마, 환경 공통 fixture 공급, 팀 빌딩 전 빈 화면과 상태 선택 UI를 추가했다. 회원 관리 하위 메뉴·모바일 메뉴·회원 목록 안내에서 팀 매핑으로 진입할 수 있다.
- 실행 경계: 생성 callback은 아직 연결하지 않아 첫 팀 만들기·팀 만들기 버튼은 비활성이다. draft/confirmed preview는 fixture 상태를 선택할 수 있으며 팀 목록은 5단계에서 연결한다. API 요청·저장·localStorage는 추가하지 않았다.
- 생성 파일: 새 route를 Vite로 생성해 `apps/admin/src/routeTree.gen.ts`를 갱신했다. 생성 결과를 수동 편집하지 않았다.
- 근접 테스트: 팀 검색·페이지·관리자 셸·회원 목록·기존 router 테스트를 지정 실행해 5개 파일·123개 테스트가 새로 통과했다. 팀 매핑 페이지 3개 테스트, admin shell 8개 테스트, router 101개 테스트를 포함한다.
- 품질 게이트: `mise exec -- node --run check` 통과. 포맷은 새 실행, admin lint/typecheck/test는 새 실행, 나머지 패키지는 Turbo 캐시 재사용이다. 관리자 전체 테스트는 65개 파일·620개 테스트가 새로 통과했다.
- build: `mise exec -- node --run build` 통과. admin build는 새 실행, Storybook·web·기타 패키지 build는 Turbo 캐시 재사용이다. 기존 의도적 오류 경계 테스트 stderr와 청크 크기 경고는 exit code 0으로 종료됐다.
- 회귀: 새 하위 메뉴가 추가되어 고정 탭 순서가 바뀐 기존 router 키보드 테스트 5곳을 새 순서에 맞게 갱신했다. 회원 목록의 팀 매핑 안내 링크와 모바일 메뉴 선택·닫힘을 검증했다.
- 화면 근거: 테스트 DOM으로 빌딩 전 빈 상태·헤더·생성 진입점·모바일 하위 메뉴를 확인했다. 실제 브라우저·375px·스크린 리더·터치·Figma 픽셀 비교는 12단계에서 수행한다.
- 변경량: `origin/DongjaJ/team-mapping-fixtures...HEAD` 기준 +423/-18줄, 합계 441줄이다. 650줄부터 분리를 검토하고 800줄 미만으로 유지한다.
- 사용자 리뷰: 완료. 5단계 팀 목록·카드·필터 구현을 시작했다.

## 5단계 — 2026-11-02

- 변경: draft/confirmed 팀 목록에 반응형 팀 카드, 원본 직군 집계, 서비스명·구성 상태·확인 필요 사유·비활성 더보기 메뉴를 추가했다. 팀장 정보는 목록 카드에 표시하지 않고 원본 입력·후속 상세 범위에 유지한다. `all|complete|needs-check|unassigned` 필터와 필터별 개수, 결과 없음 상태를 연결했다.
- Figma `683:39446`의 가로형 카드 구성을 반영해 팀 식별 정보·직군 배지·팀원·상태·더보기 메뉴를 한 행 중심으로 재배치했다. 좁은 화면에서는 콘텐츠가 다음 행으로 내려간다.
- 카드 팀원 목록은 이름·직군을 하나의 항목으로 묶고 항목 사이에 구분점을 표시해 카드 폭에 따라 자연스럽게 줄바꿈한다.
- URL·탐색: 라우트가 `filter` 변경을 URL에 반영하고 브라우저 뒤로가기로 이전 필터를 복원한다. 카드 제목의 상세 진입 callback과 더보기 메뉴 조작을 분리했으며 실제 상세 패널은 8단계에서 연결한다.
- 원본 보존: 카드·필터는 fixture의 원본 팀과 통계를 읽기 전용으로 표시한다. `unassigned` 필터에서는 미배정 인원 요약을 추가로 표시하고 팀 카드 원본 목록은 유지한다. 회원 체크·배정 본문은 9단계에서 연결하며, 메뉴·최종 실행·저장은 비활성 상태다.
- 근접 테스트: `team-mapping-page.test.tsx`와 `router.test.tsx`를 지정 실행해 2개 파일·107개 테스트가 새로 통과했다. 필터 개수·빈 결과·URL 복원·상세/메뉴 이벤트 분리를 포함한다.
- 품질 게이트: `mise exec -- node --run check` 통과. 포맷은 새 실행, admin lint/typecheck/test는 새 실행, 나머지 패키지는 Turbo 캐시 재사용이다. 관리자 전체 테스트는 65개 파일·623개 테스트가 통과했다.
- build: `mise exec -- node --run build` 통과. admin build는 새 실행, Storybook·web 및 기타 build는 Turbo 캐시 재사용이다. 기존 청크 크기 경고는 exit code 0으로 종료됐다.
- 화면 근거: `http://localhost:3001/members/teams?preview=draft`를 Chrome에서 열어 8개 카드·42명 배정·10명 미배정·필터를 확인했고, `filter=needs-check` 선택 시 긴 팀명 카드만 남는 URL 이동을 확인했다. DOM 테스트로 같은 상태를 고정했으며 Figma 픽셀 비교·375px·스크린 리더·터치 검증은 12단계에서 수행한다.
- 변경량: Stage 5 작업 트리 기준 +564/-28줄(새 파일 286줄 포함), 합계 592줄이다. Stage 4 PR #277에 누적하면 base 대비 약 1,033줄이 되어 800줄 제한을 넘으므로, 커밋·PR은 Stage 5를 별도 검토 단위로 분리한다.
- API 경계: API 요청·Query/Mutation·모의 저장소·localStorage·가짜 성공 처리는 추가하지 않았다. 새로고침 시 fixture로 돌아가며 초안 상태는 아직 후속 단계에서 연결한다.
- 사용자 리뷰: 대기. 6단계 생성 폼 구현은 시작하지 않는다.

## 6단계 — 2026-11-02

- 변경: 팀 빌딩 전 빈 상태와 팀 목록의 `첫 팀 만들기`·하단 `팀 만들기` 두 진입점을 `overlay-kit` 기반 생성 모달로 연결했다. 팀명·서비스명 입력과 선택 회원 영역은 TanStack Form의 메모리 상태로 제공한다.
- 입력 정책: 팀명은 공백 기준 필수로 검증하고 팀원 1명 이상 조건을 표시한다. 회원 검색·선택은 7단계로 남겨 두었으며, 만들기 버튼은 `준비 중` 비활성 상태다. Enter 제출도 차단하고 원본 fixture·목록·통계를 변경하지 않는다.
- 접근성·상호작용: 포커스 이동은 SEED Dialog의 기본 포커스 관리에 맡기고, 팀명 입력에 레이블·필수 표시·오류 연결을 제공한다. 취소·닫기 시 모달만 닫히며 이탈 확인은 10단계에서 통합한다.
- 화면 근거: Chrome의 `http://localhost:3001/members/teams`에서 빈 상태의 두 진입점을 열어 팀 생성 모달·입력 레이블·선택 회원 안내·비활성 만들기 버튼을 확인했다. 현재 브라우저 탭은 모달 상태로 유지했다.
- 근접 테스트: `mise exec -- pnpm --filter @yapp-plus/admin test --run src/features/team-management/model/team-draft.test.ts src/pages/team-mapping/ui/team-create-dialog.test.tsx src/pages/team-mapping/ui/team-mapping-page.test.tsx` 실행. Zod 경로 검증을 포함해 3개 파일·14개 테스트가 새로 통과했다.
- 구현 단순화: `createTeamDraftSchema(snapshot)`를 TanStack Form의 Standard Schema validator에 직접 연결해 값·blur·필드 오류·제출을 Form이 관리한다. `getTeamDraftIssues`는 도메인 규칙과 `superRefine`의 오류 메시지 공급원으로 유지한다. `useMemo`·dirty 전달용 `useEffect`·입력 포커스 `useEffect`는 사용하지 않으며, 포커스 이동은 SEED Dialog 기본 동작에 위임했다.
- 품질 검사: 관리자 `typecheck`와 `lint`를 각각 새로 실행해 통과했다. `node --run check`도 통과했으며 관리자 lint/typecheck/test는 새 실행, 나머지 패키지는 Turbo 캐시 재사용이다. `node --run build`도 통과했으며 관리자 build는 새 실행, Storybook·web build는 Turbo 캐시 재사용이다.
- 포맷·diff: 변경 파일에 `oxfmt`를 새로 실행했고, `git diff --check`도 통과했다.
- 변경량: Stage 6 증분은 새 파일 322줄과 기존 파일 93줄 추가·29줄 삭제로 추가·삭제 합계 444줄이다. Stage 5 변경과 같은 작업 트리에 있으므로 commit/PR은 단계별 독립 검토 단위로 분리한다.
- 미실행·위험: 회원 검색/선택, 이탈 확인, 실제 생성·저장은 아직 연결하지 않았다. 브라우저 화면·375px·스크린 리더·터치 비교는 12단계에서 수행한다.
- 사용자 리뷰: 대기. 폼 배치·입력·필수 문구·비활성 만들기·원본 보존을 확인한 뒤 7단계 회원 검색/선택을 시작한다.

## 7단계 — 2026-11-02

- 변경: 생성 모달에 이름·직군 후보 검색, 현재 소속/미배정 표시, 선택 회원 목록과 제거 동작을 연결했다. 선택한 회원은 원본 후보 목록에서 제외하고 선택 인원·직군 구성 요약에 반영한다.
- 키보드·입력: ArrowUp/ArrowDown으로 후보를 이동하고 Enter로 선택하며 Escape로 검색어를 비운다. 한글 조합 중 Enter 오선택을 막고, 선택 후 검색어를 초기화하면서 검색 입력 포커스를 유지한다.
- 불변식: 현재 팀의 마지막 회원은 선택할 수 없고 차단 사유를 표시한다. 중복 선택은 검색 후보에서 제외한다. 실제 팀 생성·원본 fixture·팀 목록·통계 변경은 없다.
- UI: 선택 회원은 이름·직군·현재 소속을 세로 목록으로 표시하고, 후보 결과는 버튼 목록으로 표시했다. 접근성 lint 규칙에 맞춰 네이티브 searchbox·button·list 요소를 사용했다.
- 근접 테스트: `mise exec -- pnpm --filter @yapp-plus/admin test --run src/pages/team-mapping/ui/team-member-search.test.tsx src/pages/team-mapping/ui/team-create-dialog.test.tsx src/pages/team-mapping/ui/team-mapping-page.test.tsx` 실행. 3개 파일·14개 테스트가 새로 통과했다.
- 품질 검사: 관리자 lint/typecheck 새 실행 통과. `mise exec -- node --run check` 통과했으며 admin lint/typecheck는 새 실행, 나머지 패키지는 Turbo 캐시 재사용이다. `mise exec -- node --run build` 통과했으며 admin build는 새 실행, Storybook·web 및 기타 build는 Turbo 캐시 재사용이다.
- 포맷·diff: 변경 파일에 `oxfmt`를 새로 실행했고 `git diff --check` 통과.
- 변경량: Stage 7 증분은 신규 검색 컴포넌트·스타일·테스트 356줄과 기존 생성 모달·테스트 변경 63줄 추가·19줄 삭제, 작업 목록/검증 문서 변경을 포함해 약 450줄이다. 650줄 미만으로 분리 불필요하며 커밋은 사용자 리뷰 후 별도 검토 단위로 만든다.
- 미실행·위험: 상세 패널의 변경 예정, 미배정 일괄 배정, 이탈 확인, 실제 생성/저장은 후속 단계다. 실제 브라우저·375px·스크린 리더·터치·Figma 픽셀 비교는 12단계에서 수행한다.
- 사용자 리뷰: 대기. 8단계 상세 패널·변경 예정 구현은 리뷰 승인 후 시작한다.

## 8단계 — 2026-11-02

- 변경: 팀 카드 제목에서 `overlay-kit`으로 SidePanel을 열고 원본 팀 정보·직군 구성·원본 팀원을 표시한다. 회원 추가를 누르면 회원 목록 위에 패널 내부 검색 영역이 펼쳐지고, 다른 팀/미배정 회원을 현재 팀에 추가 예정으로 지정할 수 있다.
- 변경 예정: 기존 팀원은 SEED `Select`에서 다른 팀 이동·제외를 지정한다. 회원별 예정 취소와 전체 취소를 제공하며, 원본 팀원 목록·팀 카드·전체 통계는 변경하지 않는다. 초안은 패널 인스턴스 메모리에만 유지되고 패널 닫기 시 제거된다.
- 규칙: `getTeamChangeIssues`로 모든 예정 변경을 합산해 기존 팀의 최소 1명 유지를 검사한다. 마지막 팀원 이동·제외는 반영하지 않고 차단 사유를 `role="alert"`로 표시한다. 팀 정보 수정·삭제·변경 반영은 비활성화했다.
- 화면 근거: 개발 서버 `http://localhost:3001/members/teams?preview=draft`에서 Orbit 카드 제목을 선택해 SidePanel·직군 배지·원본 팀원·회원 추가·변경 메뉴·비활성 하단 동작을 확인했다. 실제 추가 예정·취소·이동·최소 인원 차단은 DOM 테스트로 확인했다.
- 근접 테스트: `mise exec -- pnpm --filter @yapp-plus/admin test --run src/pages/team-mapping/ui/team-detail-panel.test.tsx src/pages/team-mapping/ui/team-mapping-page.test.tsx` 실행. 2개 파일·10개 테스트가 새로 통과했다.
- 전체 테스트: `mise exec -- pnpm --filter @yapp-plus/admin test --run` 실행. 68개 파일·638개 테스트가 새로 통과했다. SidePanel/react-drawer의 기존 jsdom pointer-up 경고 로그가 있었지만 실패 테스트는 없다.
- 품질 검사: `mise exec -- node --run check` 통과. 포맷·admin lint/typecheck/test는 새 실행, 나머지 패키지는 Turbo 캐시 재사용이다. `mise exec -- node --run build` 통과. admin build는 새 실행, Storybook·web 및 기타 build는 Turbo 캐시 재사용이다.
- 포맷·diff: `oxfmt` 및 `git diff --check` 통과.
- 변경량: Stage 8 증분은 신규 패널·스타일·테스트·변경 예정 컴포넌트 666줄과 기존 페이지 연결 30줄, 문서 변경을 포함해 약 720줄이다. 650줄을 넘어 분리를 검토했으나 상세와 변경 예정이 동일 패널 상태·검증 계약에 강하게 결합되어 하나의 8단계 리뷰 단위로 유지했다. 800줄 미만이다.
- 사용자 피드백 반영: 회원 추가 시 검색 영역을 팀원 목록 위에 배치하고, 기존 회원 변경 메뉴를 SEED `Select`로 교체했다. SidePanel 안에서 Select 메뉴가 접근성 레이어에 가려지지 않도록 패널 컨테이너에 렌더링하며, 회원명·변경 메뉴가 같은 행에서 자연스럽게 배치되도록 너비를 조정했다.
- 추가 피드백 반영: 팀 목록이 긴 경우에도 생성 진입점을 찾을 수 있도록 `팀 만들기` 버튼을 목록 헤더 오른쪽으로 이동하고, 하단 고정 영역은 제거했다. 팀 빌딩 전 빈 화면에서는 `첫 팀 만들기`를 유지한다.
- 구조 개선: `TeamDetailPanel`의 변경 예정 상태·검증·Select 표시를 `useTeamMemberChanges`로, 회원 검색·후보 선택을 `useTeamMemberSearch`로 분리했다. 순수 검증 규칙은 기존 기능 모델에 남기고 패널은 화면 조합을 담당한다.
- UI 구조 개선: `TeamMemberSearchPanel`과 `TeamMemberList`를 분리해 검색 후보·팀원 Select의 렌더링과 테스트 경계를 나눴다. 팀 요약과 SidePanel 골격은 `TeamDetailPanel`에 유지했다.
- 범위 결정 반영: PM·Design 누락 판정과 `complete`·`needs-check` 필터, 카드·패널의 구성 상태/경고 UI를 제거했다. 직군별 인원 배지는 유지하고 필터는 `all|unassigned`만 제공한다. 기존 `needs-check` URL은 검색 스키마의 안전한 기본값(`all`)으로 복원한다.
- 피드백 후 검증: 관리자 lint/typecheck와 전체 테스트 68개 파일·638개 테스트, `node --run check`, 관리자 build를 새로 실행해 통과했다. `git diff --check`와 `oxfmt`도 통과했다. SidePanel/react-drawer의 기존 jsdom pointer-up 경고는 테스트 실패로 이어지지 않았다.
- 미실행·위험: 패널을 닫거나 다른 팀으로 전환할 때 변경 예정 폐기 확인은 10단계에서 통합한다. 미배정 본문 일괄 배정, 확정 후 편집, 실제 API 반영은 후속 단계다. 375px·스크린 리더·터치·Figma 픽셀 비교는 12단계에서 수행한다.
- 사용자 리뷰: 대기. 회원 추가 검색 위치·SEED Select 메뉴·회원명 배치를 확인한 뒤 9단계 미배정 회원 개별·일괄 선택을 시작한다.
- 범위 조정 후 검증: PM·Design 누락 판정과 구성 상태/경고 UI를 제거하고 `all|unassigned` 필터만 유지했다. 기존 `needs-check` URL은 `teamMappingSearchSchema`에서 `all`로 복원한다.
- 조정 후 근접 테스트: 팀 매핑 모델·fixture·검색·페이지·카드·라우터 관련 5개 파일 123개 테스트 통과. 관리자 lint·typecheck와 전체 68개 파일·638개 테스트도 새로 통과했다.
- 조정 후 품질 게이트: `mise exec -- node --run check` 통과(관리자 lint·typecheck·test는 새 실행, 나머지는 Turbo 캐시 재사용), `mise exec -- pnpm --filter @yapp-plus/admin build` 통과. `git diff --check` 통과.

## 9단계 — 미배정 회원 개별·일괄 선택

- 변경: `UnassignedMembers` 화면을 추가해 미배정 회원의 이름·직군·과거 기수 이력·체크 상태·개별 대상 팀을 표시한다. 개별 선택은 회원별 배정 예정으로 기록하고, 일괄 선택은 체크된 회원의 기존 예정 대상을 선택한 팀으로 덮어쓴다.
- 원본 보존: 체크 상태와 배정 예정 상태를 분리했다. 체크 해제는 일괄 작업 대상에서만 제외하며, 이미 정한 배정 예정은 회원별 `배정 예정 취소`로 제거한다. 원본 팀 인원·미배정 집계·카드는 변경하지 않는다.
- 상태 경계: `confirmed`에서는 체크와 Select를 읽기 전용으로 표시한다. 팀이 없는 `before` fixture에서는 일괄 작업 대신 `배정할 팀이 없어요`를 표시한다. 실제 배정 요청·저장·성공 알림은 추가하지 않았다.
- 화면 연결: `filter=unassigned`일 때 팀 카드 대신 미배정 회원 작업 영역을 표시하도록 `TeamMappingPage`를 연결했다. 기존 라우터 회귀 테스트는 필터 변경 후 미배정 회원 영역을, 뒤로가기 후 팀 목록을 확인하도록 갱신했다.
- 근접 검증: 집중 테스트 3개 파일·113개 테스트와 관리자 전체 테스트 69개 파일·643개 테스트를 새로 실행해 통과했다.
- 품질 게이트: `mise exec -- node --run check` 통과(7개 작업 중 1개 새 실행, 6개 Turbo 캐시 재사용), `mise exec -- pnpm --filter @yapp-plus/admin build` 통과. `oxfmt`와 `git diff --check`를 실행했다.
- 변경량: Stage 9 증분은 미배정 회원 컴포넌트·스타일·테스트와 페이지/라우터 연결 및 문서 변경으로 약 370줄이다. 650줄 미만이며 독립 PR 분리 없이 하나의 리뷰 단위로 유지한다.
- 구조 개선: `UnassignedMembers`에서 상태·검증을 `useUnassignedMembers`로, 회원 한 행을 `UnassignedMemberRow`로, 개별·일괄 팀 선택을 `UnassignedTeamSelect`로 분리했다. 상위 컴포넌트는 빈 상태·툴바·목록 조합만 담당한다.
- 구조 개선 후 검증: 집중 테스트 2개 파일·11개 테스트, `mise exec -- node --run check`를 다시 실행해 통과했다. 관리자 전체 테스트는 앞선 실행과 동일하게 69개 파일·643개 테스트 통과 상태다.
- 사용자 리뷰: 대기. 체크 해제와 배정 예정 취소의 차이, 일괄 덮어쓰기, 실제 반영 비활성 상태를 확인한 뒤 10단계 이탈 보호를 시작한다.

## 10단계 — 이탈 보호

- 변경: `TeamLeaveDialog`와 `useTeamLeaveGuard`를 추가해 팀 생성 모달·팀 상세 패널의 닫기/취소/배경 이탈을 공통 처리한다. 변경이 없으면 바로 닫고, 변경이 있으면 `overlay.openAsync`로 `계속 편집`·`변경 버리기` 결과를 기다린다. 로컬 guard는 React state/effect 없이 overlay를 열고 종료 결과만 처리한다.
- dirty 공급: `TeamMappingDraftProvider`가 생성·상세·미배정 초안의 dirty 상태와 합산값을 한 곳에서 관리한다. overlay-kit 포털로 열리는 모달·패널에도 같은 Context 값과 dispatch를 주입해 라우트 blocker가 동일한 상태를 읽는다.
- TanStack Form: 생성 폼은 `listeners.onChange`에서 `formApi.state.isDefaultValue`를 기준으로 Context를 갱신하고, `useStore(form.store, state => !state.isDefaultValue)`로 로컬 종료 여부를 계산한다. 따라서 검색·검증 blur는 dirty가 아니며 값을 원래대로 되돌리면 확인창이 사라진다.
- 라우터 보호: 팀 매핑 라우트에 TanStack Router `useBlocker`와 `enableBeforeUnload`를 연결했다. 미배정 배정 예정이 있는 상태에서 필터·화면 상태·뒤로가기·다른 페이지 이동을 시도하면 URL과 초안을 유지한 채 확인한다.
- dirty 기준: 팀 생성은 이름·서비스명·선택 회원이 원래 값과 다를 때만 dirty로 보고, 검색어·검증 blur만으로는 확인하지 않는다. 상세 패널은 회원 변경 예정이 있을 때만, 미배정 화면은 배정 예정이 있을 때만 dirty로 보고 체크만 한 경우에는 확인하지 않는다.
- 폐기 정책: `계속 편집`은 현재 입력·패널·필터와 URL을 보존한다. `변경 버리기`는 로컬 초안을 제거한 뒤 원래 닫기 또는 Router 이동을 실행한다. 실제 저장·API 요청·성공 알림은 추가하지 않았다.
- 포커스: SEED Dialog·AlertDialog·SidePanel의 기본 포커스 관리에 위임하고, 확인창을 닫으면 현재 편집 UI로 돌아간다. 로컬 확인창은 기본 Dialog가 닫힌 뒤 표시되도록 제어해 접근성 레이어가 서로 가리지 않게 했다.
- 근접 검증: 이탈 확인 단위 테스트 3개, 생성 모달·상세 패널 테스트 11개, 라우터 테스트 103개가 통과했다. 관리자 전체 테스트는 70개 파일·650개 테스트가 통과했다.
- 품질 게이트: `node --run check` 통과(이번 변경이 있는 admin lint/typecheck/test는 새 실행, 나머지는 Turbo 캐시 재사용), `node --run build` 통과(admin build는 새 실행, 나머지는 Turbo 캐시 재사용). `oxfmt`와 `git diff --check`도 통과했다.
- 변경량: Stage 10 증분은 공통 이탈 확인·guard·라우트 연결·테스트·문서 변경으로 약 260줄이다. 650줄 미만이며 독립 PR 분리 없이 하나의 리뷰 단위로 유지한다.
- 사용자 리뷰: 대기. 생성 모달·상세 패널 닫기, 미배정 배정 예정 후 필터 이동, 계속 편집/변경 버리기, 체크만 한 상태에서 확인창이 뜨지 않는 동작을 확인한 뒤 11단계 확정 화면을 시작한다.
