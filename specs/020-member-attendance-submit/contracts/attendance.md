# 출석·보고 연동 계약

기존 생성 SDK를 사용한다. 아래는 새 API 명세가 아니라 소비 범위다.

| 목적      | 기존 요청                                               | 성공 확인                  |
| --------- | ------------------------------------------------------- | -------------------------- |
| 코드 출석 | POST /api/attendance-verifications, {sessionId, code}   | verified=true, checkedInAt |
| 보고 조회 | GET /api/attendance-reports/current-week                | 생성 스키마 기반 응답 검증 |
| 보고 생성 | POST /api/attendance-reports, {types, reason}           | 생성 SDK 응답 타입         |
| 보고 수정 | PUT /api/attendance-reports/{reportId}, {types, reason} | 생성 SDK 응답 타입         |

- 모든 요청은 현재 회원의 Bearer 인증을 사용한다. native 인증 공개 API를 사용하고 토큰을 화면·URL·로그에 남기지 않는다.
- 보고는 types 배열과 필수 공통 reason을 보낸다. LATE·EARLY_LEAVE만 함께 선택할 수 있고 ABSENT는 단독이다. 빈 배열·중복 유형은 거절하고 구형 type은 함께 보내지 않는다.
- 사유는 Unicode 코드포인트 2~30자이고 공백만 있는 값은 거절한다. 앞뒤 공백을 포함한 원문을 보존한다. 코드 출석에만 sessionId를 보내며 보고 요청에는 추가하지 않는다.
- 생성 `currentWeekOptions`의 응답에서 reportId가 null이면 생성, 있으면 `replaceMutation`의 path.reportId로 수정한다. types·reason을 초기값으로 쓰고 null 사유는 빈 문자열로 표시한다. 구형 단일 type으로 전체 유형을 대체하지 않는다.
- 보고 조회는 생성 응답 스키마를 활용해 검증하고 실패하면 폼 대신 오류·재시도를 표시한다. 미제출과 조회 실패를 구분한다. 작성 중 재조회는 입력을 덮어쓰지 않고 닫았다 다시 열면 서버 저장값으로 초기화한다.
- 주간 조회는 기존 `currentWeekQueryOptions`를 재사용한다. 웹은 세 유형 모두 세션 시작 전에만 제출하고, 다음 주 보고는 한국 시간 일요일 00:00부터 연다. 서버의 토요일 종료 후 다음 주 대상 선택과 결석 48시간 감점 기준은 바꾸지 않는다.
- 주간·보고 데이터는 생성 Query 옵션으로 구독하고 생성 `submit1Mutation`·`replaceMutation`의 `mutate`를 사용한다. 정상 제출 직전 강제 refetch·토큰 재조회는 없으며 유효 데이터·입력·현재 시각을 검사한다. 자동 재시도·오프라인 예약·POST↔PUT 자동 전환은 하지 않는다.
- 검증에는 생성 Zod 스키마를 재사용한다. 입력 사유의 UTF-16 min/max는 코드포인트 검증으로 대체한다. 코드 출석은 `verified=true`와 `checkedInAt`을 확인하고, 보고 저장 응답은 화면에서 사용하지 않아 별도 앱 측 검증을 추가하지 않는다. 저장 응답 `sessionId`에 별도 제약을 추가하지 않는다.
- 출석 오류: INVALID_ATTENDANCE_CODE는 코드 수정, ATTENDANCE_SESSION_NOT_FOUND는 대상 재조회, ATTENDANCE_UNAVAILABLE은 현재 출석 불가 안내다.
- 보고 오류: INVALID_ATTENDANCE_REPORT는 입력 확인, ATTENDANCE_REPORT_NOT_ELIGIBLE은 자격 안내, ATTENDANCE_SESSION_NOT_FOUND는 대상 없음 안내다.
- ATTENDANCE_REPORT_UNAVAILABLE은 현재 제출 불가·운영진 문의로 안내한다. ATTENDANCE_REPORT_SESSION_CHANGED와 ATTENDANCE_REPORT_SESSION_CONFLICT는 현재 주를 재조회하고 명시적으로 다시 제출하도록 한다. 이 오류 복구는 제출 전 재조회와 구분한다.
- AUTHENTICATION_FAILED는 기존 GET 복구 경로에서 인증을 확인한다. POST 자동 재시도를 추가하지 않는다.
- 네트워크 실패·알 수 없는 오류·잘못된 성공 응답은 완료 전환을 금지한다. 서버 문자열을 그대로 사용자 문구로 출력하지 않는다.
- 응답 유실은 이미 접수됐을 수 있음을 안내한다. 생성 중복·수정 대상 없음은 입력을 유지하고 보고 재확인을 안내하며 다른 API로 자동 재제출하지 않는다. 수정은 보고 전체를 교체하고 같은 내용이면 기존 제출 시각을 유지하는 서버 정책을 따른다.
- mutation `onSuccess`는 보고·주간 조회 무효화, 제출 성공 콜백은 시트 닫기·기존 스낵바를 담당한다. `mutation.error`를 오류 UI로 변환한다. 실패한 후속 조회가 저장 성공을 취소하지 않는다.
- 기존 Activity 이름·경로를 유지한다. 보고는 로그인 WebView에서만 진입하고 개발 mock으로 일반 브라우저 진입을 열지 않는다. 코드 출석의 기존 조건은 유지한다.
- 보고 Activity의 내부 타입에 `step?: 'reason'`을 추가하되 URL에는 step·유형·사유를 넣지 않는다. `/attendance/report`와 부모 홈 복원은 유지한다. 일반 브라우저 실제 제출·정적 콘텐츠 모드는 차단한다.

## 보고 오류별 복구

| 상황                                                                       | 안내·다음 동작                                                |
| -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 조회 실패 / 대상 없음 / 시작 이후                                          | POST하지 않고 조회 재시도 / 대상 없음 / 마감·운영진 문의 안내 |
| 400 INVALID_ATTENDANCE_REPORT                                              | 입력 확인·수정 후 수동 제출                                   |
| 401 AUTHENTICATION_FAILED                                                  | 기존 GET 인증 복구 후 수동 제출                               |
| 403 ATTENDANCE_REPORT_NOT_ELIGIBLE                                         | 자격 없음 안내·홈 복귀                                        |
| 404 ATTENDANCE_SESSION_NOT_FOUND                                           | 대상 없음 안내·수동 재조회                                    |
| 404 ATTENDANCE_REPORT_NOT_FOUND                                            | 입력 보존·보고 재확인 안내, 생성으로 자동 전환 없음           |
| 409 ATTENDANCE_REPORT_ALREADY_EXISTS                                       | 입력 보존·기존 보고 재확인 안내, 수정으로 자동 전환 없음      |
| 409 ATTENDANCE_REPORT_UNAVAILABLE                                          | 제출 불가·운영진 문의                                         |
| 409 ATTENDANCE_REPORT_SESSION_CHANGED / ATTENDANCE_REPORT_SESSION_CONFLICT | 오류 복구 재조회·명시적 수동 제출                             |
| 오프라인                                                                   | 요청하지 않고 연결 확인 안내                                  |
| 응답 유실·잘못된 성공 응답                                                 | 접수 불확실·재제출 의미 안내 후 수동 재제출                   |
| 성공 뒤 주간 조회 실패                                                     | 성공 유지·조회만 재시도                                       |
