# Data Model: 세션 시작일·종료일 분리

## SessionSchedule

| Field       | Type            | Rules                                         |
| ----------- | --------------- | --------------------------------------------- |
| `startDate` | ISO date string | 필수, `YYYY-MM-DD`                            |
| `endDate`   | ISO date string | 필수, `YYYY-MM-DD`, 시작일 이후 또는 같음     |
| `startTime` | API time string | 필수, `HH:mm` 또는 기존 조회의 초 단위 값     |
| `endTime`   | API time string | 필수, 시작일과 같은 날이면 시작 시간보다 늦음 |

전체 순서는 `startDate + startTime < endDate + endTime`으로 검증한다. 날짜는 한국 시간의 달력 값으로 처리한다.

## Session

기존 이름·유형·장소·출석 집계 필드와 `SessionSchedule`을 가진다. 관리자 API 응답과 폼 ViewModel은 같은 시작일·종료일 의미를 사용하고, 폼은 화면 표시용 분 단위 시간과 API 원본 초 단위 시간 보존을 분리한다.

## Compatibility

단일 날짜 응답이 남아 있는 동안 변환 경계에서 `startDate = date`, `endDate = date`로 보정할 수 있다. 새 요청은 두 날짜를 모두 전송해야 하며, 보정은 조회 응답에만 적용한다.
