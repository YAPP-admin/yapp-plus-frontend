# 회원 팀 출석 인터페이스 계약

## API

| 메서드·경로                                                   | 생성 함수 | 용도                                |
| ------------------------------------------------------------- | --------- | ----------------------------------- |
| GET /api/sessions/current-week                                | find6     | 유형·본인 출석 상태                 |
| GET /api/sessions/{sessionId}/team-members                    | find5     | 팀과 참석자 명단                    |
| GET /api/sessions/{sessionId}/team-attendance-photos          | find1     | 검토 중 사진 상세                   |
| POST /api/sessions/{sessionId}/team-attendance-photos/presign | presign   | 최종 제출 시 업로드 URL             |
| PUT uploadUrl                                                 | ky PUT    | JPEG 전송                           |
| POST /api/sessions/{sessionId}/team-attendance-photos         | submit    | imageKey·selectedMembershipIds 접수 |

생성 SDK·타입·Zod·Query·Mutation 옵션을 직접 소비한다. 생성 파일은 수동 수정하지 않는다.
PUT에는 signedHeaders와 JPEG만 전달하며 credentials omit·redirect error·자동 재시도 없음 정책을 유지한다.
체크섬은 SHA-256/Base64이며 파일 이름·contentType·sizeBytes와 함께 presign에 전달한다.
최종 접수는 HTTP 201과 유효한 응답을 확인한 뒤 완료로 표시한다.

## UI 계약

- TeamGuideSheet의 onPhotoSource 클릭에서 브리지를 호출한다. 성공 콜백에서 File을 Context에 저장한다.
- Activity params에는 sessionId와 완료 stage만 넣는다. initialPhotoSource는 사용하지 않는다.
- useTeamAttendance는 참석자 폼·제출 수명을 소유하고 최종 버튼에서 전체 전송을 시작한다.
- 선택 사진은 미리보기용 object URL과 함께 메모리에서만 유지한다.
- sessionId 없는 진입, 선택 사진 없는 입력, receipt 없는 완료는 차단한다.

## 홈

| 조건                    | 동작                                               |
| ----------------------- | -------------------------------------------------- |
| 세션 없음               | 예정 세션 없음                                     |
| REGULAR + AVAILABLE     | 코드 출석                                          |
| TEAM + AVAILABLE        | 사진 조회 없이 안내 진입                           |
| TEAM + PENDING_APPROVAL | 사진 상세 조회·표시, 사진 없음·실패는 검토 중 유지 |
| CHECKED_IN              | 출석 완료·비활성                                   |
| NOT_OPEN / NOT_ELIGIBLE | 상태 안내·비활성                                   |

주간·사진 재조회 실패는 기존 화면을 유지한다.
주간 조회는 홈·앱 복귀 시 fresh 캐시도 갱신한다. polling은 없다.
코드 제출의 상태 중복 검사나 제출 직전 명단 재조회는 하지 않고 서버 판정에 맡긴다.
개발 모킹의 presign·접수는 실서버로 전달하지 않으며 기존 생성 MSW의 501 정책을 따른다.
