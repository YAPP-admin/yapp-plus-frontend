# 조사와 결정

## 복수 선택·기존 보고 수정 — 2026-11-28

- 사용자 승인으로 [#664](https://github.com/YAPP-admin/yapp-plus-frontend/issues/664)를 생성했다. 아래 과거 기록의 조회·수정 제외, 단일 유형·trim·UTF-16 길이·같은 유형 POST 재제출 정책은 이번 합의로 대체한다.
- 현재 생성 SDK는 보고 currentWeek 조회, submit1 생성, replace 수정을 제공한다. types는 지각·조퇴 복수 선택을 지원하고 결석은 단독이다. 실제 배포 서버의 인증된 요청은 이번 조사에서 실행하지 않았다.
- 기존 보고의 전체 types·reason을 초기값으로 사용하며 reportId 유무로 생성·수정을 구분한다. 구형 단일 type 사용과 조회 실패를 신규로 간주하는 대안은 배제한다.
- 사용자는 결석과 지각·조퇴 간 선택 시 기존 선택을 해제하고, 수정도 유형 단계부터 표시하도록 확정했다. 사유 제목·예시는 선택 유형에 맞추고 제목 아래 6px 간격으로 둔다.
- 사유는 서버 계약의 원문 보존·Unicode 코드포인트 2~30자를 따른다. HTML maxLength의 UTF-16 제한과 자동 자르기는 사용하지 않는다. 사용자는 초과 입력을 보존하고 편집 후 blur·제출 시 검증하는 방식을 승인했다.
- 생성 Zod 입력 스키마의 문자열 min/max는 UTF-16 기준이므로 그대로 적용하면 서버가 허용하는 이모지를 거절할 수 있다. 생성 파일을 수정하지 않고 앱 입력 경계에서 reason 검증만 대체한다.
- 생성 조회 스키마의 reportId bigint와 SDK의 number 차이는 기존 안전한 ID 검증 패턴으로 다룬다. 무검증 타입 단언과 새 공용 계약은 추가하지 않는다.
- 명세·데이터·계약·계획·작업·검증 절차를 기존 Spec Kit 디렉터리에서 갱신한다. 새 기능 디렉터리·브랜치·전역 기능 포인터는 만들지 않는다. `.specify/extensions.yml`은 없다.

## 최초 코드 출석 조사 — 2026-11-08

- Android 기준은 `2b837e3cb21762c6a73f1db205be6a3ef2749a97`(2026-10-30)이다. 오늘 한국 시간 커밋 `0beb1416`, `2dc0db4d`는 팀 사진 UI이므로 제외한다. 출석·보고 구현은 두 커밋에서 바뀌지 않았다.
- 서버 기준은 `27ccce69b99166e4cd63275cd1e17bf14f37e886`의 APIDOC다. 로컬 생성 SDK는 해당 출석·보고 요청과 오류 계약을 이미 제공한다.
- 출석 제출은 홈 상태 `AVAILABLE`와 실제 세션 ID를 사용한다. 시간·권한을 클라이언트에서 별도로 계산하는 대안은 서버 판정과 달라질 수 있어 제외한다.
- 보고 요청에는 sessionId가 없다. 사용자가 보고 화면을 열 때의 세션을 서버 요청에 임의로 추가하지 않는다. 대상 변경 오류 뒤에는 조회와 명시적 재시도로 복구한다.
- 기존 nativeAuthClientOptions는 GET만 401 복구 재시도한다. 이번에는 POST 자동 재전송을 확대하지 않고 기존 GET 복구 후 수동 제출을 유지한다.
- Android는 `HomeInteractionViewModel.attendedSessionId`를 성공 후 메모리에 보관한다. 웹도 생성된 `verifyMutation` 성공 상태를 사용하며 별도 완료 query는 만들지 않는다. 영구 저장이나 출석 내역으로 실시간 상태를 추정하는 대안은 제외한다.
- 개발 시연의 `0000` 거절, 보고 무조건 성공, 운영 Activity 차단은 실제 제출 연동으로 교체한다. 팀 사진 시연은 범위 밖이다.
- 동일 목적의 열린 frontend 이슈를 제목 검색과 전체 열린 목록에서 찾지 못했다. 사용자 승인 후 [#385](https://github.com/YAPP-admin/yapp-plus-frontend/issues/385)를 생성했다.

## 근거

- [Android](https://github.com/YAPP-admin/yapp-plus-android/tree/2b837e3cb21762c6a73f1db205be6a3ef2749a97)
- [서버 계약](https://github.com/YAPP-admin/yapp-plus-backend/blob/27ccce69b99166e4cd63275cd1e17bf14f37e886/APIDOC.md)
- 로컬 `apps/web/src/pages/home`, `apps/web/stackflow/src/activities/home-sheets.tsx`, `apps/web/src/features/auth/model/native-auth-client.ts`, `packages/api/src/generated/types.gen.ts`.

## 사전 보고 인터뷰와 후속 조사 — 2026-11-17

- 사용자가 기존 #385와 이 디렉터리의 후속 작업을 선택했다. 이번 실행은 문서 갱신까지만 승인했으며 제품 코드 구현은 단계별 리뷰 후 진행한다.
- 범위는 제출·실패 안내·완료 스낵바까지다. 보고 조회·수정·취소, 예외 심사, 백엔드·관리자·다른 앱 변경은 제외한다.
- Hand off의 유형 미선택·한 줄 사유·카운터·완료 스낵바를 채택했다. 사용자가 사유 필수를 선택하여 최초 명세의 선택 입력을 대체했다. 서버의 선택적 reason 계약은 유지한다.
- 시간 정책은 최종 답변을 기준으로 한다. 결석의 날짜 기준 자정 차단·48시간 차단은 채택하지 않는다. 세 유형 모두 시작 전까지 허용하고 정각부터 막는다. 결석 이틀 전은 규정 안내이며 서버 감점은 기존 48시간 기준이다.
- 서버는 토요일 세션 종료 뒤 다음 토요일을 보고 대상으로 선택하지만 웹은 일요일부터 새 주간을 연다. 기존 홈 주간 조회만 재사용하고 전체 일정·보고 가능 여부의 새 조회 계약은 추가하지 않는다.
- 사용자는 데이터 요청에 `useQuery`·`useSuspenseQuery`, 제출에 `useMutation`의 `mutate` 사용을 명시했다. 정상 제출의 사전 요청은 없으며 401·대상 변경·충돌 뒤 오류 복구 조회와 수동 제출은 유지한다.
- 생성 SDK의 보고 응답 타입만 사용하고, 현재 화면이 응답 본문을 소비하지 않으므로 앱 측 `responseValidator`는 추가하지 않는다. 응답 sessionId의 양의 안전한 정수 검증이나 현재 주간 대상과의 비교는 추가하지 않는다.
- 사유 단계 뒤로가기는 입력을 유지한 유형 선택 복귀, 시트 닫기는 초안 폐기다. 응답 유실은 접수 가능성과 최신 보고 반영을 알린 뒤 수동 재제출을 허용한다.
- 자동·브라우저 검증을 구현 완료 기준으로 하고 실서버·실기기는 별도 기록한다. 코드 출석의 과거 테스트·리뷰 기록을 새로 통과한 것으로 처리하지 않는다.
- `currentWeekQueryOptions`는 생성 `find4Options`를 사용하며 날짜·시작 시각을 제공한다. 기존 `attendanceStatus`는 코드 출석용이므로 보고 진입 조건으로 사용하지 않는다.
- 서버 dev `c7685e86a9c6d2514ab158444a1f4812de57d919`의 APIDOC·CommandService·저장 어댑터를 확인했다. reason은 Kotlin 문자열 길이 30 이하, 같은 유형의 최신 보고 적용·이전 이력 보존, 사용자 취소 불가다. 배포 서버 SHA까지 확인한 것은 아니다.
- 기존 문서의 `70:56437`은 과거 Wireframe이다. 최신 Hand off UI 페이지 `9:58487`의 보고 화면과 스크린샷을 직접 확인했다.
- Modern Web Guidance 1.0.0의 `forms`, `validate-input-after-interaction`을 조회했다. Form의 입력·오류 연결, 제출 후 검증·수정 시 해제, 중복 제출 잠금에 적용하며 프로젝트 SEED·Stackflow·지원 범위가 우선한다.

### 후속 근거

- [서버 계약](https://github.com/YAPP-admin/yapp-plus-backend/blob/c7685e86a9c6d2514ab158444a1f4812de57d919/APIDOC.md)
- [사유 길이 검증](https://github.com/YAPP-admin/yapp-plus-backend/blob/c7685e86a9c6d2514ab158444a1f4812de57d919/application/src/main/kotlin/backend/yappplus/attendance/application/AttendanceReportCommandService.kt)
- [보고 대상과 접수](https://github.com/YAPP-admin/yapp-plus-backend/blob/c7685e86a9c6d2514ab158444a1f4812de57d919/infra/src/main/kotlin/backend/yappplus/attendance/persistence/PostgresAttendanceReportCommandAdapter.kt)
- [유형 미선택](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=652-5376), [빈 사유](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=652-5880), [입력 사유](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=526-13531), [완료 스낵바](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=526-13920)
