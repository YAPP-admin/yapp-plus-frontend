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
