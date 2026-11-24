# 검증 기록

## Draft PR 준비 — 시뮬레이터 검증 제한

- iOS 17.5 iPhone 15 Pro에서 개발 앱과 `http://localhost:3000` 웹뷰를 연결했다.
- 네이티브 `getSession` 호출은 도달했지만 저장소 복구에서 `ERR_KEY_CHAIN`이 발생했다.
  로그인 시도도 서버 API 전의 공급자 단계에서 `PROVIDER_FAILURE`로 실패했다.
- 인증 이후 앨범 선택·미리보기·팀원 선택·실제 업로드·접수는 시뮬레이터에서 검증하지 못했다.
  이 제한을 기능 테스트 통과로 계산하지 않으며, 실기기 검증 T039도 미완료로 유지한다.
- 원인 확인을 위한 임시 인증 로그를 제거하고 브리지 `debug: false`를 복원했다.
- 스택별 `node --run check`, `node --run build`를 실행했다. 첫 기반 단계의 웹
  lint·typecheck·테스트·build는 새 실행, 다른 패키지는 Turbo 캐시를 재사용했다.
  이후 화면 연결·홈 상태·통합 검증 단계는 해당 트리의 기존 Turbo 캐시를 재사용했다.
- 열린 PR #503은 홈 출석 상태 처리와 겹치며 `location === null` 기반의 이전 팀 세션
  판별 정책을 포함한다. #502는 동일 기능의 이전 명세, #505는 일부 동일 파일의 명명 변경이다.
  해당 PR의 종료·변경은 수행하지 않았다.

## 최종 자동 검증 — T037·T038·T040

- 현재 승인 범위는 구현·자동 검증·문서 정리 완료이며 실제 iPhone 확인(T039)은 사용자 요청으로 보류한다.
- 실제 Stackflow를 사용해 앨범·카메라 각각 홈 → 안내 → 취소 → 재선택 → 팀원 선택 →
  presign·PUT·접수 → 완료 → 홈 복귀를 통합 검증했다. 브리지·HTTP는 모의 응답이며 실제 서버에 쓰지 않았다.
- 제출 전 전송 0회, 본인 선택 고정, 선택 명단·JPEG 바이트 전달, 요청 순서와 단일 접수,
  staleTime Infinity에서도 복귀 후 검토 중 상태 표시를 확인했다.
- 이 테스트로 완료 단계 replaceStep에서 sessionId가 빠져 NotFound로 전환되는 버그를 재현하고
  sessionId를 유지하도록 수정했다. 기존 receipt 없는 완료 직접 진입 차단은 그대로 통과한다.
- spec·plan·data-model·contract·quickstart·tasks를 현재 결정에 맞췄고 초기 research는 역사적 기록임을 명시했다.
  즉시 업로드·별도 Query 래퍼·제출 직전 명단 비교 등 폐기한 계획을 미구현 필수 작업과 구분했다.
- node --run check 통과: format과 웹 lint·typecheck·테스트 70개 파일 574건은 새 실행,
  나머지 패키지 lint·typecheck·test는 Turbo 캐시 재사용이다.
- node --run build 통과: 웹 새 실행, admin·storybook 캐시 재사용. 기존 Vite chunk 크기 경고는 남아 있다.
  git diff --check 통과. 브라우저 시각 확인·실제 터치·VoiceOver·사진 촬영·승인 후 실기기 복귀는 미실행이다.
- 실패 시 팀 인증 진입을 차단하고 해당 기능 변경을 되돌린다. SDK 복구는 소비자와 함께 수행한다.
  프런트 복구로 서버의 사진을 삭제하지 않는다. 이번 작업에서 commit·push·PR·배포는 수행하지 않았다.
- 현재 결과는 사용자 최종 리뷰용이다. PR 생성 시 누적 변경의 800줄 제한을 만족하도록 분리해야 한다.

## T036 — 개발 모킹의 사진 전송 경계

- 사용자 리뷰에 따라 browser.ts의 presign·submit passthrough 제거만 유지한다.
  별도 모의 업로드·상태 갱신 핸들러, 전용 시나리오와 추가 테스트는 제거했다.
- presign·submit은 기존 생성 MSW의 responseFallback: error 정책으로 501을 반환한다.
  presign이 실패하므로 PUT을 시작하지 않는다. 실제 제출 검증은 모킹을 끈 iPhone에서 진행한다.
- team-photo-development.ts에는 고정 대상이 이미 없고 개발 진입 조건만 남아 있어 삭제하지 않았다.
- node --run check, node --run build, git diff --check 통과. 웹 테스트 70개 파일 572건과
  웹 lint·typecheck·build는 새 실행, 다른 패키지 및 admin·storybook build는 캐시 재사용이다.
- 브라우저·실기기 수동 확인은 미실행이다. T035 문서와 이번 T036 변경은 미커밋 상태다.

## T035 — 6단계 자동 검증·리뷰 기록

- 사용자 승인으로 T034를 8374a7e8에 커밋했다. T030~T034의 홈·코드 출석·복귀·운영 진입 변경을 검토했다.
- home-page.test.tsx, attendance-code.test.tsx, query-recovery.test.tsx를 새로 실행해
  3개 파일 78건 통과했다. TEAM 코드 화면 직접 진입에서 위치 요청·코드 POST 0회를 확인한다.
- 홈의 정규·팀 경로, AVAILABLE·CHECKED_IN·NOT_OPEN·NOT_ELIGIBLE·PENDING_APPROVAL,
  사진 상세·오류 fallback·재조회 기존 데이터 유지 및 fresh 캐시 복귀를 검증했다.
- 접근성 자동 검증 범위는 주간 조회 오류의 키보드 재시도, 코드 입력·Enter 제출,
  이름 있는 버튼·상태 출력·비활성 상태다. 실제 터치·VoiceOver·iPhone 카메라는 미실행이며 T039에 남긴다.
- quickstart.md의 즉시 업로드·사진 존재 기반 차단·사진 오류 미제출 정책을 최신 사용자 결정으로 갱신했다.
- 이번 단계는 문서만 변경했다. 전체 check 통과: format 검사는 새 실행, Turbo lint·typecheck·test는
  캐시 재사용이다. git diff --check 통과. 제품 build는 다시 실행하지 않고 직전 T034 성공 결과를 유지한다.
- origin/main 대비 누적 변경은 선행 API 생성·소비자 이관 포함 800줄 초과다. PR 생성 전 분리가 필요하다.
- 다음 T036은 개발 모킹의 실서버 presign·submit passthrough를 제거하고 생성 MSW 시나리오로 대체한다.

## T034 — 운영 진입·직접 URL 검증

- 사용자 승인으로 T033을 d41387e1에 커밋하고 T034를 진행했다.
- 안내·업로드 Activity 직접 진입에서도 로그인 또는 개발 모킹 조건과 정적 모드 차단을 적용했다.
  기존 sessionId·선택 사진·접수 정보 조건은 유지한다. 서버 인증·권한 계약은 변경하지 않았다.
- 운영 로그인 사용자의 sessionId 포함 안내 진입, 비로그인 브라우저·정적 모드의 안내 차단,
  접수 정보 없는 완료 단계 차단을 추가 검증했다. 기존 개발 전용 전제를 담은 테스트 이름도 수정했다.
- node --run check, node --run build, git diff --check 통과. 웹 테스트 70개 파일 572건,
  웹 lint·typecheck·build는 새 실행이며 나머지 패키지 및 admin·storybook build는 캐시 재사용이다.
- 실제 iPhone 사진 선택·제출·VoiceOver 검증은 미실행이다. T034 변경은 사용자 리뷰를 위해 미커밋 상태다.
- 복구 시 이번 Activity 진입 조건 변경을 되돌리며, 서버 데이터·계정·사진은 변경하지 않는다.

## T033 — 홈·앱 복귀 시 주간 출석 갱신

- T032 리뷰 반영분은 사용자 승인으로 9759af31에 커밋했다.
- useRefetchOnScreenReturn의 기본 stale 정책을 유지하고 홈 주간 조회만 always를 지정했다.
  홈 화면이 활성화된 상태의 앱 복귀도 refetchOnWindowFocus로 강제 갱신한다.
- 최초 마운트의 기존 주 경계 처리는 유지한다. polling·별도 타이머·사진 조회 정책 변경은 없다.
- staleTime이 Infinity인 캐시에서도 홈 복귀와 앱 복귀 각각 CHECKED_IN → AVAILABLE
  서버 정정을 반영하는 회귀 테스트를 추가했다. 기존 일정·MY의 stale 복귀 테스트도 통과했다.
- node --run check, node --run build, git diff --check 통과. 웹 lint·typecheck·테스트
  70개 파일 568건과 웹 build는 새 실행, 다른 패키지 및 admin·storybook build는 캐시 재사용이다.
- 실제 기기의 앱 백그라운드 복귀 검증은 미실행이다. 이번 변경은 사용자 리뷰를 위해 미커밋 상태로 둔다.

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
