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
  목록 오류 또는 빈 배열이면 관리자 작업 영역 전체가 재시도 화면으로 대체된다. 401은 오류 화면을
  표시하지 않고 access token을 삭제한 뒤 즉시 `/login`으로 이동한다.
- 이 결정은 문서 단계에서 반영했다. 제품 코드·전체 check는 변경하지 않았다.
