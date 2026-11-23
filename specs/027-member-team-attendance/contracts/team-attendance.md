# 회원 팀 출석 인터페이스 계약

## 생성 API와 사용 범위

동일 원본에서 생성한 SDK·타입·Zod·Query 옵션을 사용한다. 공용 client의 인증·오류 정책은 유지한다.

| 메서드·경로                                                   | 최종 생성 함수 | 사용                                |
| ------------------------------------------------------------- | -------------- | ----------------------------------- |
| GET /api/sessions/current-week                                | find6          | 유형·시간·본인 출석 상태            |
| GET /api/sessions/{sessionId}/team-members                    | find5          | 현재 팀과 참석 선택 명단            |
| GET /api/sessions/{sessionId}/team-attendance-photos          | find1          | 기존 제출 확인만                    |
| POST /api/sessions/{sessionId}/team-attendance-photos/presign | presign        | 현재 사진의 새 업로드 URL           |
| PUT 응답 uploadUrl                                            | ky PUT         | signedHeaders와 JPEG 전송           |
| POST /api/sessions/{sessionId}/team-attendance-photos         | submit         | imageKey·selectedMembershipIds 접수 |

기존 이름 변경은 plan.md의 1A~1D를 따른다. 단계별 생성 함수 이름은 실제 경로와 대조한다.
주간 type·endTime은 필수이며 시간은 기존 startTime과 같은 형식을 검증한다.
사진 조회 실패는 공용 ApiError나 생성 스키마를 변경하지 않고 해당 소비 경계에서만 미제출로 변환한다.
취소 신호는 먼저 확인해 전파한다. 사진 조회 403·404·409·503·네트워크·검증 실패는 진행을 허용하지만
다른 조회나 쓰기의 실패를 성공으로 바꾸지 않는다.

## 웹 공개 입력·출력

- TeamAttendanceTarget에 teamId를 추가한다. 본인은 isMe로 확인하고 내부 명단은 생성 응답 경계에서 검증한다.
- 사진 준비 훅은 취소·준비 실패에는 기존 사진을 보존하고 준비 성공에서 업로드를 시작한다.
- 업로드 책임과 최종 접수를 분리한다. 현재 사진의 성공한 imageKey만 최종 접수 입력으로 전달한다.
- useTeamAttendance는 참석자 폼과 최종 접수 수명을 소유한다. selectedMembershipIds는 본인을 포함한다.
- TeamGuideSheet는 실제 시작·종료 시간과 onSelectSource(source)를 받아 선택한 도구를 상위 Activity에 전달한다.
- Activity의 sessionId는 문자열로 전달하고 경계에서 안전한 양의 정수로 확인한다.
  기존 URL 경로는 유지하며 sessionId 없는 직접 진입은 현재 주간 TEAM 대상으로 확인한다.
- initialPhotoSource는 library/camera이며 URL에 영속화하지 않는다. 진입 조회 후 활성 Activity에서 한 번 소비한다.
- receipt 없는 완료 직접 진입은 완료 내용을 만들지 않고 홈 복귀를 제공한다.

## 전송과 재시도

사진 준비 성공 → SHA-256/Base64 체크섬 → presign(filename·contentType·sizeBytes·checksumSha256) →
S3 PUT 성공 → imageKey 보관 순서다. 업로드 중 사진 교체·최종 제출은 차단하고 참석자 선택은 허용한다.
업로드 실패 재시도마다 새 presign을 호출한다. 서명 URL의 expiresAt은 imageKey 만료를 의미하지 않는다.
PUT에는 signedHeaders만 사용하고 사용자 인증을 전달하지 않는다. credentials omit·redirect error,
기존 timeout과 자동 재시도 없음 정책을 유지한다.

최종 버튼은 전송 Mutation 안에서 생성 SDK로 주간·팀원·사진을 새로 조회한다.
같은 팀의 실질적 명단 변경이면 사진·키를 보존하고 선택을 본인으로 초기화한 뒤 재확인을 기다린다.
팀·세션 변경이면 전체 초안을 폐기한다. 기존 사진이 확인되거나 세션이 제출 불가면 접수하지 않는다.
조건 통과 후 imageKey·selectedMembershipIds만 POST한다. 최종 버튼에서 presign·PUT을 반복하지 않는다.

HTTP 201·유효한 photoId·submittedAt·PENDING을 확인한 뒤에만 완료한다.
명시적인 접수 거절은 입력을 유지하고 오류를 표시한다. 사진 재업로드는 사용자가 명시적으로 선택한다.
최종 POST 이후 네트워크·5xx·잘못된 성공 응답은 결과 불명으로 취급하고 자동·수동 재접수를 막는다.
접수 성공 뒤 주간·사진 Query를 무효화하되 재조회 실패로 접수를 실패 처리하지 않는다.

## 홈 판정과 갱신

| 조건                                        | 동작                                            |
| ------------------------------------------- | ----------------------------------------------- |
| 세션 없음                                   | 출석 진입 없음                                  |
| NOT_ELIGIBLE / NOT_OPEN                     | 안내·비활성화                                   |
| CHECKED_IN                                  | 출석했어요!·비활성화                            |
| PENDING_APPROVAL                            | 인증 사진 검토 중·비활성화                      |
| REGULAR + AVAILABLE                         | 코드 출석                                       |
| TEAM + AVAILABLE + 기존 사진 확인           | 팀 인증 사진이 제출됐어요·비활성화, 운영진 문의 |
| TEAM + AVAILABLE + 사진 없음/사진 조회 실패 | 팀 인증 안내                                    |

사진 확인은 TEAM + AVAILABLE일 때 수행한다. 조회 중에는 중복 진입을 막고 실패 후 진행을 허용한다.
정규 코드 제출 자체도 REGULAR 조건을 검사해 TEAM에서 위치·인증 요청이 나가지 않게 한다.
주간 조회 오류·갱신 중에는 출석 진입을 막는다. 오래된 mutation 성공을 홈 판단 기준으로 사용하지 않는다.
홈·앱 복귀와 접수 직후 주간·관련 사진 상태를 강제 갱신한다. 공용 훅의 기본 stale 정책과
다른 화면은 유지하고 출석 소비부에서만 강제 갱신한다. polling·동시 제출 잠금은 추가하지 않는다.
