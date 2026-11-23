# 검증 기록

## 0단계 — 2026-11-23

- 실제 브랜치 DongjaJ/api-v4, HEAD·origin/main cc90b35ed70b9c1cca466f1d256fd20739017aef.
  시작 시 작업 트리가 깨끗했고 브랜치를 생성·전환·변경하지 않았다.
- 사용자가 기준 이슈로 승인한 #501을 조회했다. #503은 읽기 전용으로 확인했고 수정·머지하지 않았다.
- OpenAPI 원본을 .context/api-027-openapi.json에 저장하고 research.md에 해시·수신 시각을 기록했다.
- Spec Kit의 spec·plan·tasks 템플릿을 사용해 한국어 문서를 작성했다.
  .specify/feature.json은 gitignored 로컬 선택 값이며 실제 브랜치명과 구분한다.
- .specify/extensions.yml이 없어 specify·plan·tasks 전후 extension hook은 실행할 항목이 없었다.
- 요구사항 품질 체크리스트는 문서 작성자의 검토 결과이며 사용자 단계 리뷰는 대기다.
- 제품·생성 코드 수정, 새 의존성, 실제 사진 쓰기·삭제·배포는 수행하지 않았다.

## 검증 결과

- Spec Kit check-prerequisites --require-tasks --include-tasks: 통과. 문서 9개·로컬 링크·작업 ID/경로·템플릿 잔여 표기 검증 통과.
- 작업 40개: 준비 5, 기반 8, US1 4, US2 8, US3 4, US4 6, 통합 5개. 문서 작성·검증 4개만 완료했고 사용자 리뷰와 제품 구현은 미완료다.
- mise exec -- node --run check: 통과. format:check와 web lint·typecheck·test를 새로 실행했다.
  web 테스트는 70개 파일·577건 통과. 나머지 lint/typecheck 각 6개 작업과 admin·mobile·app-bridge·ui 테스트는 Turbo 캐시를 재사용했다.
- 기록 갱신 후 변경 문서 format 검사·로컬 링크·작업 형식·git diff --check도 새로 실행해 통과했다. 제품 코드 변경이 없어 build는 실행하지 않았다.
- origin/main 대비 문서 10개(신규 9·기존 1), +581/-0줄이다. 미추적 새 문서도 포함했다. 후속 API 생성 변경과 별도 PR 단위로 유지한다.
  제품 빌드·사진 기능의 신규 테스트·브라우저·실제 iPhone 제출은 0단계 범위가 아니며 미실행이다.

## 1A 진행 확인

- 사용자가 0단계 문서 커밋 뒤 1A 진행을 승인했다. 이에 따라 T005를 완료했다.

## 1단계 1A — 진행 중

- `packages/api/openapi-ts.config.ts`에 팀 사진·팀원 GET을 임시 제외하고, 관리자 세션·프로필·알림의 생성 이름을 유지하는 파서를 추가했다. 같은 원본으로 생성기를 실행했으며 생성 파일은 직접 편집하지 않았다.
- 주간 조회는 `find4`에서 `find6`, 현재 기수 일정은 `find5`에서 `find7`, 출석 이력은 `find6`에서 `find8`, 보존 이력은 `find7`에서 `find9`로 이관됐다. 웹의 query 옵션·무효화 키·개발 mock과 공용 API mock을 같은 의미로 옮겼다.
- 새 주간 세션 필수 필드 `type`과 `endTime`을 공용·웹 fixture에 넣고, 웹 응답 스키마에서 `endTime` 형식을 검증한다. 생성 Zod가 `type` 열거값을 검증한다.
- 생성 API의 새 팀 사진·팀원 응답 모델은 아직 생성 대상에 포함하지 않았다. 팀원 GET은 1C, 사진 GET은 1D에서 순서대로 해제한다.

## 1A 검증 결과

- `pnpm --filter @yapp-plus/api typecheck`, `pnpm --filter @yapp-plus/web typecheck`, `git diff --check`: 새로 실행해 통과.
- 웹 관련 회귀 10개 파일 136건과 `apps/admin/src/mocks/api-contract.test.ts` 6건: 새로 실행해 통과.
- `mise exec -- node --run check`는 format·lint·typecheck 단계를 통과했다. web은 lint·typecheck 새 실행, 나머지는 대부분 Turbo 캐시를 재사용했다. 전체 test 단계는 도구 출력 제한 뒤에도 완료됐으나 종료 상태를 별도로 수집하지 못해, 다음 리뷰 전에는 전체 check를 다시 실행해 최종 결과를 기록한다.
- 현재 1A 제품·생성 코드 변경은 29개 파일, +307/-258줄이다. build와 실제 기기 확인은 이 단계 범위가 아니며 미실행이다.

## 다음 리뷰

1A diff와 검증을 검토한 뒤, 1B 진행 확인을 받는다. 1B 전에는 관리자 세션·프로필·알림의 생성 이름 변환을 제거하지 않는다.
