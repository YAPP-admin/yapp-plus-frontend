# 데이터와 상태 경계

새 도메인 모델이나 영속 저장소를 만들지 않는다. 요청·응답의 구조는 OpenAPI에서 생성한 타입이 기준이다.

## 대표 응답

| 계약                           | 응답 사례                    | 검증할 조건                                       |
| ------------------------------ | ---------------------------- | ------------------------------------------------- |
| StaffLoginResponse             | 가상 운영진과 개발 전용 토큰 | 실제 계정·토큰 사용 금지                          |
| 운영진 logout                  | 204, body 없음               | 빈 본문을 JSON으로 파싱하지 않음                  |
| SessionListResponse            | 일정 목록, 빈 목록           | sessions는 AdminSessionResponse, 개수와 목록 일치 |
| CurrentWeekSessionResponse     | 세션 객체, session null      | 주간 날짜와 선택 세션의 정합성                    |
| AdminPostRecipientListResponse | 읽음·미열람 사용자           | readCount와 items 정합성, nullable 필드 유지      |
| ErrorResponse                  | 운영진 인증 실패             | 명세에 있는 code와 nullable message               |

- `AdminPostRecipientResponse.read`는 생략 불가 Boolean이다. `isRead`를 추가하지 않는다.
- `readAt`은 필수 키이며 미열람 사례에서는 null, 읽음 사례에서는 고정된 ISO 시각이다.
- ID·이름·날짜·토큰은 합성 고정값을 사용한다. 현재 시각이나 난수에 의존하지 않는다.
- fixture는 생성 타입으로 정적 확인하고 생성 Zod로 실행 검증한다. SDK validator 기본값은 별개다.
- 성공·빈 결과·오류는 독립 fixture다. 로그인 후 상태 유지, CRUD 저장, 토큰 갱신 로직은 없다.

## 브라우저 초기화 상태

`disabled → 즉시 기존 화면`, `pending → ready → 화면`, `pending → failed → 오류 안내`로 제한한다.
활성 모드의 서버 렌더와 첫 hydration은 pending이다. 브라우저 초기화는 effect에서만 수행한다.
모듈 단위 시작 Promise를 재사용하고 unmount 이후 상태 갱신은 취소한다.
failed에서 실제 API로 우회하지 않는다. 사용자는 환경을 고친 뒤 새로고침한다.

## 테스트 수명

테스트 파일별 server 시작 → 각 테스트의 응답 override → cleanup·resetHandlers → server 종료 순서다.
모의 비즈니스 상태를 저장하지 않으므로 별도 데이터 reset API는 만들지 않는다.
