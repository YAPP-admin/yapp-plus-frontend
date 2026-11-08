# 요청 처리 계약

API client에 설정된 origin과 base 경로에서만 적용한다. 그 외 요청은 원래 fetch로 전달한다.

| 요청                                  | 처리                         |
| ------------------------------------- | ---------------------------- |
| GET /api/sessions/current-week        | 이번 주 세션 없음            |
| GET /api/generations/current/sessions | 미래 정규 일정 3개           |
| GET /api/posts                        | 유형·커서 검증 후 공지 목록  |
| GET /api/posts/:id                    | 정적 상세, 없으면 404        |
| PUT /api/posts/:id/read               | 계정별 읽음 표시, 없으면 404 |
| POST /api/attendance-verifications    | 409, 실서버 전달 금지        |
| 그 외 경로·method                     | 실제 API 유지                |

Response는 기존 생성 SDK가 파싱·변환한다. 모드별 응답 타입을 추가하지 않는다.
