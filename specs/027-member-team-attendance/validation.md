# 검증 기록

## T032 — 정규 코드 출석 경계·서버 정정 반영

- 앞선 홈 연결·확인 사항은 b85661a1에 커밋했다. 사용자 지시로 이어서 T032를 구현했다.
- 코드 화면은 useSuspenseQuery로 조회한 세션이 REGULAR·AVAILABLE일 때만 위치 확인을 시작한다.
  사용자 리뷰에 따라 주 1회 세션 운영을 전제로 위치 응답 후 getQueryData 재검사와 관련 테스트는 제거했다.
  유형·출석 가능 여부는 화면 활성화에만 사용하며 제출 함수에서 중복 검사하지 않는다.
  실제 접수 가능 여부는 서버가 판정하고 실패 응답은 기존 오류 안내로 처리한다.
- 홈과 코드 입력의 출석 가능 여부에서 과거 성공 mutation 의존을 제거했다.
  성공 기록은 완료 화면의 직접 진입 방지에만 사용하며 최신 서버 정정을 덮어쓰지 않는다.
- 목업의 주간 조회도 코드 출석 성공 후 CHECKED_IN을 반환하도록 정리했다.
- TEAM 직접 진입 시 위치·코드 요청 0회와 성공 후 AVAILABLE 응답의 재진입을 회귀 테스트로 확인했다.
- node --run check, node --run build, git diff --check 통과. 웹 lint·typecheck·테스트
  70개 파일 566건과 웹 build는 새 실행, 나머지 패키지와 admin·storybook build는 캐시 재사용이다.
- 실제 iPhone·브라우저 수동 검증은 미실행이다. 이 변경은 커밋하지 않았고 사용자 리뷰를 기다린다.
- origin/main 대비 누적 변경은 기존 생성 코드·선행 커밋을 포함해 800줄을 넘으므로
  PR 생성 전 독립 PR 분리가 필요하다. 이번 작업에서는 PR을 생성하지 않았다.

## 홈 팀 인증 연결 — 2026-11-24 사용자 리뷰 반영

- 사용자가 홈 유형·상태 분기와 사진 상세 표시를 검토하고 커밋 및 다음 작업 진행을 승인했다.
- 정규 세션은 코드 출석, 팀 세션의 AVAILABLE은 사진 조회 없이 안내 시트로 연결한다.
  PENDING_APPROVAL에서만 사진을 조회하고, 사진 없음·첫 조회 실패에도 검토 중 상태를 유지한다.
- 홈 출석 상태는 본인 기준이고 사진 상세는 팀 기준이다. 사진 존재로 본인의 출석 여부를 추정하지 않는다.
- 주간 세션·사진 재조회 실패 시 기존 화면을 유지한다. 별도 오류 안내나 출석 버튼 차단을 추가하지 않는다.
- 팀원 조회 실패 화면은 안내 문구만 표시하며 현재 재시도 버튼은 없다.
- 제출 결과가 불확실한 오류에서는 중복 제출을 막고 홈으로 돌아가기를 표시한다.
- 선택 사진은 Context의 selectedPhoto(File·미리보기 URL)로 보관한다. 최종 버튼에서
  presign → PUT → 접수를 실행하며 완료 또는 이탈 시 폐기한다. isSubmissionComplete는 화면 단계에서 계산한다.
- 이 기록의 사용자 결정은 초기 명세의 선택 즉시 업로드·사진 존재 기반 제출 차단·조회 실패 미제출 정책을 대체한다.
- node --run check와 node --run build, git diff --check 통과. 웹 lint·typecheck·테스트와
  웹 build는 새 실행이며 다른 패키지 작업과 admin·storybook build는 Turbo 캐시를 재사용했다.
  웹 테스트 70개 파일 564건 통과. 브라우저 호스트 미연결로 시각 확인은 미실행이며 실제 iPhone 검증도 남아 있다.
- 다음 작업은 T032 정규 코드 출석의 시작·제출 유형 검증과 최신 서버 정정 반영이다.

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

사용자가 1A 커밋과 다음 단계 진행을 승인해 1B를 시작했다.

## 1단계 1B — 진행 중

- 임시 operationId 변환을 제거한 뒤 동일 OpenAPI 원본으로 재생성했다. 새 팀원·사진 GET 제외는 유지한다.
- 관리자 기수 세션은 `find1`에서 `find2`, 프로필은 `find2`에서 `find3`, 알림은 `find3`에서 `find4`로 이관했다. 앱 호출·MSW pick·공용 API mock과 Query key 검증이 모두 같은 HTTP 경로를 계속 가리킨다.

## 1B 검증 결과

- `pnpm --filter @yapp-plus/api typecheck`, `pnpm --filter @yapp-plus/admin typecheck`, `pnpm --filter @yapp-plus/web typecheck`, `git diff --check`: 새로 실행해 통과.
- 관리자 세션 회귀 18개 파일 229건, 웹 프로필·알림·세션 경계 회귀 5개 파일 33건: 새로 실행해 통과. 관리자 테스트의 의도된 404 오류 경계 로그는 기존 수용 사례이며 실패가 아니다.
- 현재 1B 변경은 17개 파일, +134/-151줄이다. 전체 check·build·실제 기기 확인은 이 단계 범위에서 아직 미실행이다.

## 다음 리뷰

사용자가 최신 API 전체 생성을 요청해 1C·1D를 통합 실행했다.

## 1단계 1C·1D — 전체 생성 완료

- 사용자 요청에 따라 팀원·사진 GET을 별도 단계로 나누지 않았다. `openapi-ts.config.ts`에서 모든 임시 parser filter·patch를 제거하고 같은 OpenAPI 원본으로 전체 생성했다.
- `find1`은 팀 사진 조회, `find5`는 팀원 조회로 생성됐다. SDK·Zod·TanStack Query·MSW export를 확인했고 `packages/api/README.md`의 현재 생성 함수명과 MSW 예시를 갱신했다.

## 1C·1D 검증 결과

- 같은 `.context/api-027-openapi.json`으로 재생성 전후의 전체 diff SHA-256이 일치했다.
- `find1`·`find5`의 SDK·Query key/options, `zFind1Response`·`zFind5Response`, `handleFind1`·`handleFind5`와 MSW `pick` 연결을 생성물에서 확인했다.
- API·관리자·웹 타입 검사와 `git diff --check`: 새로 실행해 통과.
- 팀 사진 기능 UI·실제 HTTP 성공 시나리오는 다음 US1 단계에서 생성 API를 소비하며 검증한다. build·실기기는 아직 미실행이다.

## 다음 리뷰

최신 API 전체 생성과 1B 소비자 이관을 함께 검토한 뒤, US1(실제 팀·기존 사진 확인) 진행 확인을 받는다.

## 2단계 US1 — 생성 Query 옵션 직접 소비로 조정

- `TeamAttendanceTarget`의 `teamId`와 기존 fixture·제출 테스트 입력만 갱신했다.
- 별도 조회 모델·상태 축소·Query 래퍼는 추가하지 않는다. 이후 화면 연결에서 생성 `find5Options`·`find1Options`를 직접 소비한다.
- 그러므로 T014·T016은 미완료로 되돌렸고, 이 단계의 팀원·사진 조회 전용 테스트도 유지하지 않는다.
- `mise exec -- node --run check`: 통과. format과 web lint·typecheck·test는 새로 실행했으며, web 테스트는 70개 파일 579건 통과했다. 나머지 패키지 작업은 Turbo 캐시를 재사용했다.
- `mise exec -- node --run build`, `git diff --check`: 통과. web build는 새로 실행했고 admin·storybook build는 Turbo 캐시를 재사용했다. Vite의 기존 500KiB chunk 경고는 실패가 아니다.

## 다음 리뷰

생성 Query 옵션을 실제 화면에서 소비할 때 필요한 상태 변환과 오류 정책을 함께 검토한다.
