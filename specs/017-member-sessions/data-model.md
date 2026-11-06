# 데이터와 상태 모델

## 서버 데이터

생성 타입·스키마가 원천이며 아래는 소비 범위다. 계약을 별도 공용 타입으로 복제하지 않는다.

| 개체                                 | 소비 필드                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| CurrentWeekSessionResponse           | weekStartDate, weekEndDate, session 또는 null                                  |
| CurrentWeekSessionDetailResponse     | sessionId, name, date, startTime, location 또는 null, attendanceStatus         |
| CurrentGenerationSessionsResponse    | generationId, generationNumber, sessions                                       |
| CurrentGenerationSessionItemResponse | sessionId, name, date, dayOfWeek, location 또는 null, startTime, endTime, type |

`attendanceStatus`는 NOT_ELIGIBLE·NOT_OPEN·AVAILABLE이며 출석 완료를 나타내지 않는다.
이번 주 응답에 type과 endTime이 없으므로 다른 조회와 조인하거나 이름으로 타입을 추정하지 않는다.
생성 Zod의 int64 출력은 bigint이다. 화면 key에는 문자열로 변환하며 number 타입 단언으로 되돌리지 않는다.
JSON number가 안전 정수 범위를 벗어난 ID는 정밀도를 복구할 수 없으므로 성공 데이터로 사용하지 않는다.
날짜는 유효한 달력 날짜, 시간은 범위가 유효한 HH:mm 또는 HH:mm:ss로 확인한다.

## 인증 연동 요구

기존 인증 상태를 소비한다. 이 기능에서 provider·전환 세대·인증 결과 적용기를 추가하지 않는다.
로그아웃·탈퇴·계정 또는 로그인 세션 변경 시 전체 query·mutation 캐시 제거가 필요하다.
같은 userId/sessionId의 토큰 갱신은 기존 데이터를 유지한다.
실패·취소를 확정 전환으로 처리하지 않는다. 늦은 인증 응답과 화면 수명 처리는 인증 작업과 통합 검증한다.
캐시 초기화 연결이 완료되기 전에는 계정 격리 요구를 완료 처리하지 않는다.

## 조회 상태

- 최초 로딩: 접근성 상태 안내를 표시하며 성공 목록이나 빈 결과를 먼저 노출하지 않는다.
- 성공: 검증된 응답을 표시한다. 홈 null과 일정 []는 각각 빈 결과다.
- 최초 오류: 오류 안내와 재시도를 제공한다. 401·403은 인증/권한 오류로 구분한다.
- 재조회 중: 같은 로그인 세션의 기존 데이터를 유지한다.
- 재조회 오류: 같은 세션의 기존 내용과 갱신 실패 안내를 함께 표시한다.
- 인증 전환/복귀 확인 중: 보호 조회를 중단하고 다른 계정의 이전 내용을 렌더링하지 않는다.

## 날짜와 수명

모든 비교의 기준은 Asia/Seoul이다. 날짜-only 문자열을 기기 로컬 자정으로 파싱하지 않는다.
목록 순서와 표시 요일은 서버 계약을 따른다. 종료 비교는 date + endTime의 한국 시각으로 한다.
정각에는 분을 생략하고 그 외에는 분을 표시한다. 초는 표시하지 않되 종료 비교에는 반영한다.
홈 달력은 weekStartDate부터 weekEndDate까지의 날짜를 사용하고 오늘과 세션 날짜를 구분한다.
지난 일정 표시는 마지막 조회 성공 시각(dataUpdatedAt)을 기준으로 계산하며 별도 타이머를 두지 않는다. 오늘 표시는 홈 화면 단계에서 다룬다.
복귀 시 현재 시간을 재계산한다. 응답의 weekEndDate 다음 한국 자정이 지났다면 다음 화면 진입·복귀에서 새 주를 조회한다. 화면을 켜둔 동안 자정 타이머로 조회하지 않는다.
주 시작 요일은 클라이언트에서 추정하지 않고 서버 응답 범위를 사용한다.
