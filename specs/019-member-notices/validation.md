# 검증 기록

## 1단계 — 문서·계획·작업 목록

- 기준: `32f4c3d0f52e4b43bcc34326267b497fc2a17feb`. fetch한 origin/main과 동일하며 실제 브랜치는 DongjaJ/api를 유지했다.
- 범위: Spec Kit 문서·요구사항 체크리스트·이슈 초안. 제품 코드·생성 코드·의존성 변경 없음.
- Spec Kit resolver·setup-plan·setup-tasks 실행. gitignored .specify/feature.json은 specs/019-member-notices를 가리킨다.
- setup-plan JSON의 BRANCH는 feature fallback 식별자이며 실제 Git 브랜치를 바꾸지 않았다. extension 설정이 없어 before/after hooks는 적용 대상이 아니다.
- 이전 조사에서 받은 OpenAPI 원본의 SHA-256과 임시 생성물 diff 0줄을 다시 확인했다. 이 단계에서 서버 재배포 여부·실회원 조회·PUT을 새로 검증한 것은 아니다.
- 읽기 전용 조사 검토의 5개 지적을 계약·작업에 반영했다: 강제 GET 복구, callback 격리, 무효 커서 초기화, URL 정규화 경계, 현재 주 필터.
- 문서 교차 검토에서 발견한 오류 UI 이동의 의존 방향 문제를 보완했다. feature에는 탐색 비의존 콘텐츠만 두고 헤더·BackButton은 페이지에 유지한다.
- 이슈 제목 제안: `feature: 회원 공지 조회와 읽음 저장 연동`. 담당자 제안: DongjaJ. 라벨·milestone 없음. 초안은 .context/member-notices-issue.md이며 원격 이슈는 생성하지 않았다.

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
- T005는 사용자 리뷰·다음 단계 진행 확인과 이슈 생성 대기다. 제품 구현·commit·push·PR은 수행하지 않았다.
- 이번 문서 검증만으로 본문 렌더링·읽음 경합·계정 격리가 구현 또는 검증됐다고 보지 않는다.
