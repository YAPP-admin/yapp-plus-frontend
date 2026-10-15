# 세션 데이터 모델과 내부 함수

이 문서는 관리자 내부 모의 동작의 계약이다. 서버 DTO가 아니며 실제 연동 시 생성된 API 계약에 맞춘다.
구현에서는 Zod 스키마에서 타입을 추론하고 같은 필드를 수동 type으로 중복 선언하지 않는다.

| 타입                     | 필드 또는 값                                               | 검증·의미                                                    |
| ------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------ |
| SessionType              | `offline`, `team`                                          | 전체는 저장값이 아니다.                                      |
| CreateSessionInput       | `name`, `location`, `date`, `startTime`, `endTime`, `type` | 여섯 항목 필수.                                              |
| UpdateSessionInput       | CreateSessionInput과 같은 여섯 항목                        | 생성 스키마를 재사용하며 수정 대상 id는 별도 인자다.         |
| SessionAttendanceSummary | `present`, `late`, `absent`, `pending`, `reported`         | 각각 0 이상의 정수. 화면 집계만 표현한다.                    |
| Session                  | 생성 입력 + `id`, `attendance`                             | id는 비어 있지 않은 문자열이며 모의 생성 시 UUID를 부여한다. |

## 검증과 표시

- `name`, `location`: trim 후 비어 있으면 오류. 별도 최대 길이는 정하지 않는다.
- `date`: 실제 달력에 존재하는 `YYYY-MM-DD`. 윤년과 월별 일수를 검증한다.
- `startTime`, `endTime`: 24시간제 `HH:mm`. 같은 날짜에서 종료 시간이 시작보다 늦어야 한다.
- 날짜·시간은 한국의 현지 일정이다. date-only 문자열을 브라우저 로컬 Date로 바꾸어 날짜가 밀리지 않게 한다.
- 정렬은 date와 startTime 내림차순이며 동일 일시는 원래 순서를 유지한다.
- 모든 외부 입력과 서비스 결과는 스키마로 검증한다. 직군·출석받기 필드를 저장하지 않는다.
- 출석 집계는 단순 표시값이다. 합계·참여 대상·점수를 유추하거나 새로 계산하지 않는다.

## 내부 서비스

| 함수          | 입력                        | 성공 결과            | 실패                                     |
| ------------- | --------------------------- | -------------------- | ---------------------------------------- |
| listSessions  | 없음                        | `Promise<Session[]>` | 조회 오류를 throw한다.                   |
| createSession | CreateSessionInput          | `Promise<Session>`   | 검증·생성 오류를 throw한다.              |
| updateSession | 세션 id, UpdateSessionInput | `Promise<Session>`   | 없는 id 또는 검증·수정 오류를 throw한다. |
| deleteSession | 세션 id                     | `Promise<void>`      | 없는 id 또는 삭제 오류를 throw한다.      |

- 모의 저장소는 목록 복사본을 반환한다. 반환값 수정이 내부 배열을 바꾸지 않도록 중첩 집계도 복사한다.
- 생성은 저장된 세션을 반환하고 모든 출석 집계를 0으로 시작한다. 삭제는 해당 id만 제거한다.
- 수정은 기존 id·attendance를 보존하고 여섯 필드만 교체한 세션을 반환한다. 없는 id로 새 항목을 만들지 않는다.
- 브라우저 전용 모듈은 저장소 하나를 유지하고 테스트는 생성 함수를 사용해 매번 독립 인스턴스를 만든다.
- Query key는 `['admin', 'sessions']` 하나다. 기본 staleTime을 유지하고 오류 자동 재시도는 끈다.
- 성공한 mutation 결과만 캐시에 반영한다. 진행 중 목록 조회가 옛 결과로 덮지 않게 취소 후 갱신한다.
- UI 상태는 목록의 loading/error/success, 생성·수정·삭제의 idle/pending/error/success로 제한한다.
