# 데이터 모델

## 회원 표시 정보

| 값                  | 출처·검증                                                          | 사용                            |
| ------------------- | ------------------------------------------------------------------ | ------------------------------- |
| name                | 로그인 응답의 이름, 양끝 공백 제거 후 비어 있지 않은 문자열만 보존 | native 저장·웹 이름 표시        |
| userId / sessionId  | 기존 인증 계약                                                     | 계정 캐시 경계, 변경 없음       |
| 회원 구분·기수·직군 | 이번에는 없음                                                      | `—`, 활동회원으로 추정하지 않음 |

이름의 부재·null·숫자·공백은 undefined로 정규화한다. 로그인 자격 검증과 분리한다.
기존 세션 복구는 저장된 이름을 사용하고 새 세션은 새 credentials의 이름만 사용한다.

## 출결 점수

원천은 `MyAttendanceScoreResponse`다. generationId는 안전한 정수로 정규화하고
totalScore·attendanceCount·lateCount·absentCount·earlyLeaveCount는 생성 스키마의 0 이상 정수 규칙을 따른다.
화면은 점수·출석·지각·결석만 표시한다. earlyLeaveCount는 지각 면제권으로 변환하지 않는다.

공유 query 데이터는 `{ status: available, score }` 또는 `{ status: unavailable, reason }`이다.
reason은 `ATTENDANCE_SCORE_NOT_ELIGIBLE`·`CURRENT_GENERATION_NOT_FOUND` 중 하나이며 미대상 사유를 보존한다.
undefined/pending은 초기 로딩이며 error는 실패다. 기존 data가 있는 error는 재조회 실패다.
같은 query key를 쓰는 모든 소비자가 이 반환 형태를 사용해야 한다.

## 내역과 세션 요약

- 원천은 `AttendanceHistoryResponse`, `AttendanceHistoryItemResponse`, `AttendanceHistorySummaryResponse`다.
- sessionId는 안전한 정수로 정규화한다. summary의 두 횟수는 0 이상 정수이고 시작 횟수 ≤ 전체 횟수다.
- 남은 세션은 전체 − 시작, 진행률은 `—`다. 후속 페이지 성공 시 가장 최근 성공 페이지의 summary를 사용한다.
- 목록은 서버 페이지 순서대로 펼친다. 항목의 중복 제거는 서버 계약에 맡긴다.
- nextCursor는 불투명 문자열 또는 null이며 빈 문자열은 잘못된 응답으로 처리한다.

## 상태 전이

- 이름: 없음 → 로그인 이름 → 갱신·재시작 유지 → 로그아웃·탈퇴 시 제거.
- 점수: 초기 로딩 → 정상/미대상/오류. 정상 이후 실패는 이전 값과 안내 유지.
- 내역: 초기 로딩 → 목록/빈 결과/오류 → 추가 로딩 → 병합 또는 기존 목록+추가 오류.
- 추가 오류는 사용자 재시도 전 자동 요청을 멈춘다. 계정 전환 시 기존 업무 캐시와 함께 초기화한다.
