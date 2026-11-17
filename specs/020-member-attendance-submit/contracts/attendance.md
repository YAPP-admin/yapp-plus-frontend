# 출석·보고 연동 계약

기존 생성 SDK를 사용한다. 아래는 새 API 명세가 아니라 소비 범위다.

| 목적      | 기존 요청                                             | 성공 확인                  |
| --------- | ----------------------------------------------------- | -------------------------- |
| 코드 출석 | POST /api/attendance-verifications, {sessionId, code} | verified=true, checkedInAt |
| 사전 보고 | POST /api/attendance-reports, {type, reason?}         | 생성 SDK 응답 타입         |

- 두 요청 모두 현재 회원의 Bearer 인증을 사용한다. native 인증 공개 API를 사용하고 토큰을 화면·URL·로그에 남기지 않는다.
- API의 `reason?` 계약은 유지하되 회원 웹에서는 필수다. 원문 UTF-16 길이 30 이하·trim 결과 비어 있지 않음을 검사하고 trim한 사유를 전송한다. 코드 출석에만 sessionId를 보내며 보고 요청에는 추가하지 않는다.
- 주간 조회는 기존 `currentWeekQueryOptions`를 재사용한다. 웹은 세 유형 모두 세션 시작 전에만 제출하고, 다음 주 보고는 한국 시간 일요일 00:00부터 연다. 서버의 토요일 종료 후 다음 주 대상 선택과 결석 48시간 감점 기준은 바꾸지 않는다.
- 주간 데이터는 `useQuery` 또는 `useSuspenseQuery`로 구독하고, 생성 `submit1Mutation`의 `mutate`를 사용한다. 제출 직전 GET·강제 refetch·토큰 재조회는 없으며 확보한 유효한 주간 데이터·입력·현재 시각을 검사해 POST한다. `mutateAsync`·POST 자동 재시도·오프라인 예약은 사용하지 않는다.
- 검증에는 생성 Zod 스키마를 재사용한다. 코드 출석은 `verified=true`와 `checkedInAt`을 확인하고, 보고는 응답 본문을 화면에서 사용하지 않아 별도 앱 측 응답 검증을 추가하지 않는다. 보고 응답 `sessionId`에 별도 제약을 추가하지 않는다.
- 출석 오류: INVALID_ATTENDANCE_CODE는 코드 수정, ATTENDANCE_SESSION_NOT_FOUND는 대상 재조회, ATTENDANCE_UNAVAILABLE은 현재 출석 불가 안내다.
- 보고 오류: INVALID_ATTENDANCE_REPORT는 입력 확인, ATTENDANCE_REPORT_NOT_ELIGIBLE은 자격 안내, ATTENDANCE_SESSION_NOT_FOUND는 대상 없음 안내다.
- ATTENDANCE_REPORT_UNAVAILABLE은 현재 제출 불가·운영진 문의로 안내한다. ATTENDANCE_REPORT_SESSION_CHANGED와 ATTENDANCE_REPORT_SESSION_CONFLICT는 현재 주를 재조회하고 명시적으로 다시 제출하도록 한다. 이 오류 복구는 제출 전 재조회와 구분한다.
- AUTHENTICATION_FAILED는 기존 GET 복구 경로에서 인증을 확인한다. POST 자동 재시도를 추가하지 않는다.
- 네트워크 실패·알 수 없는 오류·잘못된 성공 응답은 완료 전환을 금지한다. 서버 문자열을 그대로 사용자 문구로 출력하지 않는다.
- 응답 유실은 이미 접수됐을 수 있음을 안내하고 수동 재제출을 허용한다. 같은 유형의 최신 보고가 적용되고 이전 이력이 남는 서버 정책을 따른다.
- mutation `onSuccess`는 주간 조회 무효화, 제출 성공 콜백은 시트 닫기·스낵바를 담당한다. `mutation.error`를 오류 UI로 변환한다. 실패한 후속 조회가 제출 성공을 취소하지 않는다.
- 기존 Activity 이름·경로를 유지한다. 출석·보고 진입은 로그인 또는 개발 mock에서만 허용하고, 직접 진입 때에도 실제 대상과 인증을 확인한다.
- 보고 Activity의 내부 타입에 `step?: 'reason'`을 추가하되 URL에는 step·유형·사유를 넣지 않는다. `/attendance/report`와 부모 홈 복원은 유지한다. 일반 브라우저 실제 제출·정적 콘텐츠 모드는 차단한다.

## 보고 오류별 복구

| 상황                                                                       | 안내·다음 동작                                                |
| -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 조회 실패 / 대상 없음 / 시작 이후                                          | POST하지 않고 조회 재시도 / 대상 없음 / 마감·운영진 문의 안내 |
| 400 INVALID_ATTENDANCE_REPORT                                              | 입력 확인·수정 후 수동 제출                                   |
| 401 AUTHENTICATION_FAILED                                                  | 기존 GET 인증 복구 후 수동 제출                               |
| 403 ATTENDANCE_REPORT_NOT_ELIGIBLE                                         | 자격 없음 안내·홈 복귀                                        |
| 404 ATTENDANCE_SESSION_NOT_FOUND                                           | 대상 없음 안내·수동 재조회                                    |
| 409 ATTENDANCE_REPORT_UNAVAILABLE                                          | 제출 불가·운영진 문의                                         |
| 409 ATTENDANCE_REPORT_SESSION_CHANGED / ATTENDANCE_REPORT_SESSION_CONFLICT | 오류 복구 재조회·명시적 수동 제출                             |
| 오프라인                                                                   | 요청하지 않고 연결 확인 안내                                  |
| 응답 유실·잘못된 성공 응답                                                 | 접수 불확실·재제출 의미 안내 후 수동 재제출                   |
| 성공 뒤 주간 조회 실패                                                     | 성공 유지·조회만 재시도                                       |
