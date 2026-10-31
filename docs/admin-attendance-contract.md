# 어드민 출석 관리 계약 메모

이 문서는 현재 화면 ViewModel과 OpenAPI 계약 사이의 경계를 기록합니다. 현재 화면은 mock 기반이므로 생성된 API 타입을 화면에서 직접 import하지 않고, 실제 연동 시 서비스 계층에서 변환합니다. 배포 OpenAPI와 현재 `packages/api/src/generated`가 다를 수 있으므로 API 연동 전에 명세를 다시 내려받아 생성 코드를 갱신합니다.

## 현재 생성 API에서 확인한 계약

- 출석 조회: `GET /api/admin/generations/{generationId}/sessions/{sessionId}/attendance`
- 회원 출결 수정: `PATCH /api/admin/generations/{generationId}/sessions/{sessionId}/attendance/{membershipId}`
- 명찰 확인 수정: `PATCH /api/admin/generations/{generationId}/sessions/{sessionId}/attendance/{membershipId}/badge`
- 출석 마감: `POST /api/admin/generations/{generationId}/sessions/{sessionId}/attendance/close`
- 마감 취소: `POST /api/admin/generations/{generationId}/sessions/{sessionId}/attendance/close/cancel`
- 출석 코드 조회: `GET /api/admin/generations/{generationId}/sessions/{sessionId}/attendance-code`
- 출석 코드 최초 발급: `POST /api/admin/generations/{generationId}/sessions/{sessionId}/attendance-code`
- 출석 코드 재발급: `POST /api/admin/generations/{generationId}/sessions/{sessionId}/attendance-code/reissue`
- 팀 사진 조회: `GET /api/admin/generations/{generationId}/sessions/{sessionId}/team-attendance-photos`
- 팀 사진 승인·반려: `POST /api/admin/generations/{generationId}/sessions/{sessionId}/team-attendance-photos/{photoId}/decision`

출석 응답에는 회원별 `status`, 최근 사전 보고 요약, 점수 변화, 명찰 확인 여부가 포함됩니다. 세션 생성 응답은 `sessionId`만 반환합니다. 세션 생성 시 출석이 자동 생성되는지 여부는 명세만으로 확정하지 않으며, 출석 코드 발급 API의 “출석 대상 생성” 설명과 함께 백엔드에 확인합니다.

출석 코드 응답은 `status`, `code`, `revision`, `issuedAt`, `issuedByStaffId`를 반환합니다. 응답에는 `expiresAt`이 없으므로 화면 ViewModel의 `expiresAt`은 mock에서만 표시하는 임시 값이며, 실제 API 연동 시 만료를 추론하지 않습니다.

출석 요약의 세션 상태는 `NOT_STARTED`·`STARTED`만 제공되고, 마감·마감 취소 응답에는 본문이 없습니다. 화면에서 `CLOSED`를 표시하려면 별도 필드나 재조회 규칙을 백엔드와 확정해야 합니다.

## 화면에서 사용하는 독립 ViewModel

| 화면 개념 | ViewModel 필드                           | 생성 API와의 경계                                           |
| --------- | ---------------------------------------- | ----------------------------------------------------------- |
| 세션 상태 | `AttendanceSessionViewModel.phase`       | `NOT_STARTED`·`STARTED`와 마감 조회 결과를 화면 상태로 변환 |
| 실제 출결 | `AttendanceMemberViewModel.attendance`   | `status`와 사유를 출결 상태로 변환                          |
| 사전 보고 | `AttendanceMemberViewModel.latestReport` | 최근 보고를 별도 필드로 유지하며 실제 출결을 덮어쓰지 않음  |
| 검수 사진 | `TeamReviewViewModel.photo`              | 팀 사진 조회 응답의 사진·팀원·사전 보고를 화면 상태로 변환  |

## 팀 사진 검수 계약

배포 OpenAPI에는 다음 팀 사진 검수 API가 있습니다.

```text
GET  /api/admin/generations/{generationId}/sessions/{sessionId}/team-attendance-photos
POST /api/admin/generations/{generationId}/sessions/{sessionId}/team-attendance-photos/{photoId}/decision
```

조회 응답은 제출된 사진 항목으로 `photoId`, `teamId`, `teamName`, `uploaderId`, `uploaderName`, `submittedAt`, `status`, `readUrl`, `members`를 반환합니다. 팀원 항목은 `membershipId`, `userName`, `selected`, `provisionalStatus`, `priorReports`를 포함하고, `readUrl = null`은 사진 URL을 사용할 수 없는 상태로 변환할 수 있습니다.

수정 요청은 `decision`(`APPROVED`·`REJECTED`)과 선택적 `reason`을 받습니다. 다만 팀 사진 목록은 제출된 사진만 반환하고 `status`, `provisionalStatus`, 사전 보고 `type`은 문자열로 정의되어 있으므로, 미제출 팀 표시와 허용 값은 백엔드 확인이 필요합니다.

현재 mock의 `TeamReviewViewModel`은 화면 요구사항에 맞춰 `NOT_SUBMITTED`·`PENDING`·`APPROVED`·`REJECTED`와 사진 접근 불가 상태를 사용합니다. 이는 화면용 임시 모델이며 배포 API의 문자열 값을 그대로 확정한 것이 아닙니다.

## 마감 규칙

- `PENDING` 사진이 하나라도 있으면 출석 마감을 거절합니다. 이 검사는 화면 비활성화와 별개로 백엔드에서도 원자적으로 수행해야 합니다.
- 현재 mock 화면은 `PENDING`만 마감 차단 대상으로 취급합니다. 배포 API의 마감 응답에는 `TEAM_ATTENDANCE_PENDING` 충돌이 정의되어 있으나, `NOT_SUBMITTED`·`UNAVAILABLE`의 처리 정책은 별도로 확인해야 합니다.
- 마감 성공 시 미정 출결은 결석으로 변환하고, 마감 취소 시 출결 결과는 유지한 채 편집 가능 상태만 복구합니다.

## UI mock에서만 사용하는 가정

- mock 출석 코드의 `expiresAt`은 임시 10분 값이며 실제 API 응답을 의미하지 않습니다.
- mock은 사진을 제출하지 않은 팀도 검수 목록에 표시하지만, 배포 API 응답에는 미제출 팀 항목이 없습니다.
- mock은 `PENDING` 사진이 있으면 마감 버튼을 비활성화하며, 백엔드의 원자적 마감 검사를 대체하지 않습니다.
- 누적 점수는 mock에서 출결 `scoreDelta`를 합산하며, 실제 관리자 총점의 서버 제공 여부는 확정하지 않습니다.

## 기획·백엔드 확인 필요 사항

- 세션 생성 시 출석 생성 시점과 출석 코드 발급 시 출석 대상 생성의 관계
- 마감 상태를 `CLOSED`로 조회·표시할 필드 또는 재조회 규칙
- 사진 미제출 팀을 목록에 포함할지, 포함한다면 어떤 API에서 팀 목록을 조합할지
- 팀 사진 `status`, `provisionalStatus`, 사전 보고 `type`의 허용 값
- `NOT_SUBMITTED`·`UNAVAILABLE` 사진이 마감을 막는지 여부
- 승인·반려가 선택 회원의 실제 출결을 언제 생성·갱신하는지
- 마감 응답이 현재 세션 상태를 반환하는지, 별도 재조회가 필요한지
- 마감 취소 후 사진 검수 결과와 출결 수정 가능 범위
- 출석 코드 만료 정책과 `expiresAt` 응답 제공 여부
- 관리자 누적 점수의 서버 제공 여부와 사전 보고 이력 범위
