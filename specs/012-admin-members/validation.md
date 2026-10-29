# 검증 기록

## 1단계 — 명세·작업 목록

- 작성일: 2026-10-29. 기준: origin/main 93b74f4. 브랜치: brussels-v2/member-management-plan.
- 범위: 문서 10개와 로컬 Spec Kit 기능 선택 상태. 앱 코드·의존성 manifest/lockfile·생성 API·Git 이력은 변경하지 않았다.
- .specify/feature.json은 기존 .specify/.gitignore 규칙으로 제외되며 기능 디렉터리를 선택한다. PR 줄 수에는 포함되지 않는다.
- Spec Kit setup-plan·setup-tasks와 check-prerequisites --require-tasks --include-tasks가 완료됐다.
- setup-plan 출력의 BRANCH는 기능 이름 fallback이다. 실제 브랜치는 Git으로 확인했으며 변경하지 않았다.

## 새로 실행한 검증

- 문서 10개의 상대 링크·미치환 표식·46개 연속 작업 ID·18개 FR의 작업 대응·기능 선택 경로: 통과.
- 변경 문서의 oxfmt 적용과 전체 format:check: 통과. 전체 포맷 검사 대상은 482개 파일이었다.
- git diff --check와 untracked 문서의 줄 수·파일 목록을 별도로 확인했다.
- node --run check: 종료 코드 0. 포맷은 새 실행, 나머지 결과는 아래 Turbo 캐시를 재사용했다.

## 재사용한 Turbo 결과

| 검사      | 성공 task | 캐시 재사용 | 새 task 실행 |
| --------- | --------- | ----------- | ------------ |
| lint      | 7         | 7           | 0            |
| typecheck | 7         | 7           | 0            |
| test      | 4         | 4           | 0            |

캐시 로그의 admin 478·web 29·app-bridge 17·ui 6 테스트는 이번 작업에서 새로 실행한 테스트가 아니다.

## 환경 문제와 실행 방식

최초 pnpm exec 시 의존성이 준비되었지만 prepare의 lefthook install이 작업 트리 인식 오류로 실패했다.
공유 Git 설정의 core.bare=true를 확인했다. 저장소·전역 설정은 수정하지 않았다.
설치된 실행 파일로 문서 포맷을 적용하고 GIT_WORK_TREE에 현재 작업 디렉터리를 명시해 check를 실행했다.
명령 범위의 작업 트리 지정으로 Git 조회가 가능하지만 환경 문제 자체를 수정한 것은 아니다.

## 미실행과 남은 범위

- 앱 build: 문서만 변경했으므로 미실행. 의존성 파일·제품 코드는 변경하지 않았다.
- 제품 브라우저·실기기·스크린 리더·터치·Figma 구현 비교: 코드 미구현이므로 미실행.
- 신규 제품 테스트는 없다. 문서 검증이 화면 구현·실제 파일 파싱 통과를 의미하지 않는다.
- 1단계 제출 당시 이슈 초안 준비 완료, 생성·사용자 문서 리뷰 대기였다. 당시 2a단계는 시작하지 않았다.
- 1단계는 단일 문서 리뷰 단위로 제출하며 다음 단계는 별도 리뷰·변경 단위다. commit·push·PR은 수행하지 않았다.

## 2a단계 — 이슈 연결·화면 모델·전화번호

- 사용자 승인으로 [#182](https://github.com/YAPP-admin/yapp-plus-frontend/issues/182)를 생성하고 제목·본문·OPEN 상태·담당자 DongjaJ를 재조회했다. 게시된 초안의 중복 로컬 파일은 정리했다.
- 회원·기수별 활동·팀·출석·기존 변경 이력의 readonly 스키마/타입과 공개 진입점을 추가했다. 같은 회원의 기수 중복을 거절한다.
- 전화번호 두 형식을 숫자 문자열로 정규화하고 하이픈 표시를 제공한다. 앞자리 유실·숫자 입력·잘못된 구분자는 복구하지 않는다.
- 대상 테스트 새 실행: 2개 파일·13개 통과. 초기 lint에서 발견한 테스트 작성 규칙 2건을 수정했다.
- 전체 check 통과: 포맷 신규 실행, admin lint/typecheck/test 신규 실행. admin은 41개 파일·491개 테스트 통과다.
- 나머지 lint 6개·typecheck 6개·test 3개 task는 Turbo 캐시를 재사용했다.
- 전체 build 통과: admin 신규 실행, web·Storybook은 캐시 재사용. 청크 크기 경고는 남아 있다.
- 실행은 명령 범위의 GIT_WORK_TREE를 사용했다. pnpm 준비 과정의 lefthook install도 이번에는 성공했다. Git 설정은 수정하지 않았다.
- fixture·UI·API·저장 기능·의존성 파일은 변경하지 않았다. 따라서 화면 비교·실기기·접근성 검증은 미실행이다.
- 2a 완료, 사용자 리뷰 대기. 2b는 미착수이며 commit·push·PR은 하지 않았다.
- 문서와 2a 코드의 누적 변경량이 650줄을 넘어 PR 분리를 검토했다. PR 작성 시 문서와 모델을 별도 리뷰 단위로 분리하는 것을 권장하며 현재 누적 합계는 800줄 미만이다.

## 2b단계 — 초기 구현 기록 (아래 리뷰 수정으로 대체)

- 사용자 “커밋하고 다음 진행해”로 2a 리뷰를 확인했다. 문서 bf3055d·모델 9ca4901 커밋과 훅 검증을 완료했다.
- 후속 승인으로 brussels-v2/member-management-fixtures를 생성·전환했다. 이번 변경의 base는 brussels-v2/member-management-plan(9ca4901)이며 origin/main은 93b74f4다.
- 고정 합성 회원 6명과 빈 명단·팀 매핑 전후 입력을 제공한다. 과거 32기·현재 33기·비활동·팀장·미배정·0점/기록 없음·기존 변경 이력을 포함한다.
- 개발 클라이언트 마운트 이후에만 fixture를 동적 로딩한다. SSR·첫 렌더·프로덕션은 준비 상태다. 두 소비자가 같은 읽기 전용 입력을 받는다.
- 새 저장소·Query·타이머·가짜 CRUD·API·의존성을 추가하지 않았다. fixture는 공개 진입점에서 정적으로 내보내지 않는다.
- 대상 테스트 신규 실행: 3개 파일·19개 통과(2b 추가 6개). 초기 전체 검사에서 발견한 중괄호·중첩 삼항식·반환 스타일 오류를 수정했다.
- 최종 check 통과: 포맷 신규 실행, admin lint/typecheck/test 신규 실행. admin 42개 파일·497개 테스트 통과.
- 나머지 lint 6개·typecheck 6개·test 3개는 Turbo 캐시 재사용이다.
- 최종 build 통과: admin 신규 실행, web·Storybook 캐시 재사용. 기존 청크 크기 경고는 남아 있다.
- 화면에는 아직 연결하지 않았다. 브라우저·실기기·스크린 리더·터치·Figma 화면 비교는 미실행이며 3단계 이후 해당 화면에서 검증한다.
- 2b 구현·검증 완료, 사용자 리뷰 대기. 3단계는 미착수다. 이번 브랜치에서 commit·push·PR은 수행하지 않았다.

## 2b 리뷰 수정 — 고정 props 입력으로 단순화

- 사용자 요청에 따라 MemberPreviewData 공통 포장 타입과 useMemberPreview 훅·동적 import·preparing/error 상태를 제거했다.
- 개발용 fixtures.ts 진입점에서 고정 입력만 제공한다. 목록에는 명단·기수·매핑 상태를, 업로드에는 명단만 props로 전달할 계획이다.
- 개발 SSR과 클라이언트는 같은 고정 입력을 사용한다. 프로덕션 준비 안내·합성 명단 비노출은 실제 페이지 연결 작업 T017·T018·T036·T043에서 구현·검증한다.
- 훅 테스트 4개를 제거하고 합성 데이터 사례 테스트 2개를 유지했다. 화면 로딩·오류는 필요 시 별도 테스트 입력으로 검증하며 실제 조회는 후속 SDK/Query 연결에서 처리한다.
- check 통과: 포맷·admin lint/typecheck/test 새 실행, admin 42개 파일·493개 테스트 통과. 다른 lint 6개·typecheck 6개·test 3개는 캐시 재사용.
- build 통과: admin 새 실행, web·Storybook 캐시 재사용. 기존 청크 크기 경고는 남아 있다.
- 화면 연결·브라우저·접근성 검증은 아직 미실행이다. 이번 변경은 미커밋 상태이며 3단계는 시작하지 않았다.

## 3단계 — 회원 탐색·가입 대기

- 사용자 승인으로 2b를 7af086c에 커밋했다. format·lint·commitlint 훅 통과 후 3단계에 착수했다.
- 회원 관리 하위에 회원 목록·가입 신청(0건)을 추가하고 상단 탭·권한/상태 필터를 제거했다. 부모 메뉴는 그룹 제목이며 업로드에서 현재 위치로 표시한다.
- team URL을 검증하고 구형 role/status는 무시·제거한다. 하위 메뉴 이동은 검색·직군·팀을 보존하고 업로드 진입/명시적 복귀는 초기화한다.
- Figma 223:26805의 빈 화면을 SEED·vanilla-extract로 구현했다. 상단 탭은 확정 정책에 따라 사이드바로 옮겼고 회원 총원은 목록 단계의 실제 화면 입력 연결 전까지 표시하지 않는다.
- 원본 SVG를 로컬에 저장했다. 원본·렌더링 모두 23×23이며 Chrome에서 이미지 로딩을 확인했다. 공통 셸·브랜드 색상은 기존 프로젝트 테마를 유지했다.
- 기존 라우팅 테스트를 갱신하고 모바일 하위 메뉴 선택·조건 보존 검증을 추가했다. 첫 실행의 메뉴 접근성/키보드 순서 실패를 수정했다.
- 최종 check 통과: 포맷·admin lint/typecheck/test 새 실행, admin 42개 파일·493개 테스트 통과. 다른 lint 6개·typecheck 6개·test 3개는 캐시 재사용.
- build 통과: admin 새 실행, web·Storybook 캐시 재사용. 기존 청크 크기 경고가 남아 있다.
- Chrome 데스크톱·375px 화면, 모바일 메뉴 닫힘·트리거 포커스 복귀, 업로드 진입·목록 복귀를 확인했다. 화면 캡처는 .context/member-3-desktop.jpg와 member-3-mobile.jpg에 저장했다.
- 실제 스크린 리더·터치 기기 검증은 미실행이다. 공용 packages/ui 변경은 없으며 Storybook 갱신 대상도 없다. 라우트 경로는 유지되어 생성 파일 변경이 없다.
- 3단계 완료·사용자 리뷰 대기. 현재 변경은 미커밋이며 4a는 시작하지 않았다.

## 3단계 리뷰 수정 — SEED 조합과 Lucide

- 사용자 요청으로 Figma SVG 파일과 장식 CSS를 제거하고 lucide-react의 UserRound로 교체했다.
- PageHeader를 회원 목록·가입 대기에서 재사용하고 EmptyState를 앱 내부 shared/ui로 분리했다. main/header/section과 h1/h2/h3 계층·이름이 있는 영역을 유지한다.
- SEED VStack·HStack·Box·Text로 간격·정렬·테두리·반응형 여백을 구성한다. Result Section은 별도 미설치 스니펫이므로 새 의존성 없이 설치된 기본 컴포넌트를 조합했다.
- 참고 문서: https://seed-design.io/llms/react/components/layout/v-stack.txt, https://seed-design.io/llms/react/components/result-section.txt
- URL middleware는 스키마 재검증 대신 tab/q/part/team만 남기고 기본값을 생략한다. 입력 검증은 validateSearch가 담당한다. 기존 URL 회귀 테스트로 구형 조건 제거·기본값 생략·탐색 조건 보존을 확인했다.
- check 통과: admin lint/typecheck/test 새 실행, 43개 파일·494개 테스트 통과. 다른 lint 6개·typecheck 6개·test 3개는 캐시 재사용. build도 admin 새 실행, web·Storybook 캐시 재사용으로 통과했다.
- 제목 계층·빈 상태·버튼 부재를 검증하는 화면 테스트를 추가했다. 공용 패키지 변경이나 상호작용·상태 변경은 없으며 Storybook 사례는 추가하지 않았다.
- Chrome 데스크톱·375px 확인 완료. 최신 캡처는 .context/member-3-review-desktop.jpg와 member-3-review-mobile.jpg다. 실제 스크린 리더·터치 기기 검증은 미실행이다.
- 3단계 리뷰 수정이며 아직 커밋하지 않았다. 4a는 시작하지 않았다.

## 3단계 리뷰 수정 — 공식 Result Section 적용

- 사용자 요청에 따라 공식 React registry의 result-section 스니펫을 packages/ui/src/seed-design/ui/result-section.tsx에 추가하고 공개 진입점에서 내보냈다. 직접 만든 EmptyState는 삭제했다.
- 원본의 기능·기본 스타일을 유지하며 저장소 lint 규칙(type 선언·nullish 연산자)에 맞췄다. 의미 있는 제목 요소를 전달하는 titleAs 옵션을 추가해 페이지의 h3를 유지한다.
- 가입 대기는 size=medium과 Lucide UserRound asset을 전달한다. 패키지·lockfile 변경은 없다. Storybook에 빈 상태·재시도 사례를 추가했다.
- 공식 출처: https://seed-design.io/__registry__/react/ui/result-section.json 및 https://seed-design.io/components/result-section
- SEED CLI 1.7.3 compat ui:result-section 통과. 최초 실행은 cwd를 shorthand 옵션으로 잘못 전달해 실패했고 packages/ui에서 다시 실행해 확인했다.
- 최종 check 통과: UI·admin·web·Storybook lint/typecheck 새 실행, 나머지 3개씩 캐시 재사용. 테스트는 admin 494·UI 6·web 29개 새 실행, app-bridge 17개 캐시 재사용.
- 최종 build 통과: admin·web·Storybook 모두 새 실행. 기존 청크 경고가 남아 있다. Chrome 데스크톱·375px 확인 및 .context/member-result-section.jpg·member-result-section-mobile.jpg 저장. 실기기·스크린 리더는 미검증이다.
- 공식 스니펫·Storybook 추가로 계획 브랜치 대비 누적 변경량이 800줄을 넘었다. 2b는 기존 브랜치의 7af086c로 유지하고, 3단계는 이 커밋을 base로 하는 종속 PR로 분리해야 한다. 브랜치 생성·커밋·push·PR은 수행하지 않았다.

## 4a단계 — 회원 행 목록

- 사용자 승인에 따라 3단계를 873029a에 커밋하고 종속 브랜치를 분리했다. 현재 브랜치는 `brussels-v2/member-list`, 실제 PR base는 `brussels-v2/member-management-fixtures`(873029a)다.
- 현재 기수 회원의 이름·직군·과거 기수 이력·권한·출석 점수·가입일을 시맨틱 표로 표시한다. 긴 이름은 줄바꿈하고, 0점과 미제공·비활동을 구분한다.
- SEED Badge·Text·ActionButton·ResultSection과 Lucide를 사용한다. 더보기는 5b 연결 전까지 준비 중인 비활성 버튼이다.
- 개발 진입점에서만 고정 입력을 전달하고 운영 환경은 준비 안내를 유지한다. 합성 입력 생성과 참조에 순수 호출 표시를 적용해 운영 클라이언트·SSR 산출물에서 예시 식별자·전화번호 생성 코드가 제거됨을 확인했다.
- 빈 명단은 ResultSection으로 표시한다. 검색 빈 결과는 실제 필터를 구현하는 4b에서 연결한다. 고정 입력에는 로딩·오류·재시도를 만들지 않는다.
- `node --run check` 통과: admin lint·typecheck·테스트 499개를 새로 실행했다. 다른 패키지 lint·typecheck와 web 29개·ui 6개·app-bridge 17개 테스트는 Turbo 캐시를 재사용했다.
- `node --run build` 통과: 최종 admin 빌드는 새로 실행했고 web·Storybook은 캐시를 재사용했다. 두 앱의 초기 빌드와 Storybook 빌드는 이번 단계 앞선 실행에서 새로 통과했다.
- Chrome 데스크톱 및 375px 화면을 확인했다. 모바일 문서 너비 375px, 표 스크롤 영역 327px로 페이지 넘침이 없고 키보드 오른쪽 방향키로 표 내부 scrollLeft가 40px 이동했다. 접근성 트리에서 표·행·버튼 이름을 확인했다.
- 화면 근거: `.context/member-4a-desktop.jpg`, `.context/member-4a-mobile.jpg`. 실제 스크린 리더 낭독과 터치 실기기 검증은 미실행이다.
- 4a 리뷰 대기. 이번 단계 변경은 미커밋이며 push·PR은 수행하지 않았다. 검색·직군 필터·정렬은 4b, 팀 표시는 4c에서 진행한다.
