# 출석·보고 연동 계약

기존 생성 SDK를 사용한다. 아래는 새 API 명세가 아니라 소비 범위다.

| 목적      | 기존 요청                                             | 성공 확인                  |
| --------- | ----------------------------------------------------- | -------------------------- |
| 코드 출석 | POST /api/attendance-verifications, {sessionId, code} | verified=true, checkedInAt |
| 사전 보고 | POST /api/attendance-reports, {type, reason?}         | sessionId, submittedAt     |

- 두 요청 모두 현재 회원의 Bearer 인증을 사용한다. native 인증 공개 API를 사용하고 토큰을 화면·URL·로그에 남기지 않는다.
- 검증에는 생성 Zod 스키마를 재사용하고 양의 안전한 ID·시각·verified=true를 추가 확인한다.
- 출석 오류: INVALID_ATTENDANCE_CODE는 코드 수정, ATTENDANCE_SESSION_NOT_FOUND는 대상 재조회, ATTENDANCE_UNAVAILABLE은 현재 출석 불가 안내다.
- 보고 오류: INVALID_ATTENDANCE_REPORT는 입력 확인, ATTENDANCE_REPORT_NOT_ELIGIBLE은 자격 안내, ATTENDANCE_SESSION_NOT_FOUND는 대상 없음 안내다.
- ATTENDANCE_REPORT_UNAVAILABLE은 현재 제출 불가로 안내한다. ATTENDANCE_REPORT_SESSION_CHANGED/CONFLICT는 현재 주를 재조회하고 명시적으로 다시 제출하도록 한다.
- AUTHENTICATION_FAILED는 기존 GET 복구 경로에서 인증을 확인한다. POST 자동 재시도를 추가하지 않는다.
- 네트워크 실패·알 수 없는 오류·잘못된 성공 응답은 완료 전환을 금지한다. 서버 문자열을 그대로 사용자 문구로 출력하지 않는다.
- 기존 Activity 이름·경로를 유지한다. 출석·보고 진입은 로그인 또는 개발 mock에서만 허용하고, 직접 진입 때에도 실제 대상과 인증을 확인한다.
