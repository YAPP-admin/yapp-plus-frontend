# 어드민 출석 관리 계약 메모

이 문서는 현재 화면 ViewModel과 생성된 OpenAPI 계약 사이의 경계를 기록합니다. 생성된 API 타입을 화면에서 직접 import하지 않고, 실제 연동 시 서비스 계층에서 변환합니다.

## 현재 생성 API에서 확인한 계약

- 출석 조회: `GET /api/admin/generations/{generationId}/sessions/{sessionId}/attendance`
- 회원 출결 수정: `PATCH /api/admin/generations/{generationId}/sessions/{sessionId}/attendance/{membershipId}`
- 명찰 확인 수정: `PATCH /api/admin/generations/{generationId}/sessions/{sessionId}/attendance/{membershipId}/badge`
- 출석 마감: `POST /api/admin/generations/{generationId}/sessions/{sessionId}/attendance/close`
- 마감 취소: `POST /api/admin/generations/{generationId}/sessions/{sessionId}/attendance/close/cancel`

생성 API의 출석 응답에는 회원별 `status`, 최근 사전 보고 요약, 점수 변화, 명찰 확인 여부가 포함됩니다. 세션 생성 응답은 식별자만 반환하므로, 세션 생성 직후 출석 조회에서 자동 생성된 출석을 확인합니다.

## 화면에서 사용하는 독립 ViewModel

| 화면 개념 | ViewModel 필드                           | 생성 API와의 경계                                           |
| --------- | ---------------------------------------- | ----------------------------------------------------------- |
| 세션 상태 | `AttendanceSessionViewModel.phase`       | `NOT_STARTED`·`STARTED`와 마감 조회 결과를 화면 상태로 변환 |
| 실제 출결 | `AttendanceMemberViewModel.attendance`   | `status`와 사유를 출결 상태로 변환                          |
| 사전 보고 | `AttendanceMemberViewModel.latestReport` | 최근 보고를 별도 필드로 유지하며 실제 출결을 덮어쓰지 않음  |
| 검수 사진 | `TeamReviewViewModel.photo`              | 현재 생성 API에 없어 별도 백엔드 계약이 필요함              |

## 검수 대기 사진 제안 계약

현재 생성된 OpenAPI에는 팀 사진 조회·승인·반려 API가 없습니다. 다음 형태를 백엔드 계약 초안으로 제안합니다.

```text
GET   /api/admin/generations/{generationId}/sessions/{sessionId}/team-attendance-reviews
PATCH /api/admin/generations/{generationId}/sessions/{sessionId}/team-attendance-reviews/{photoId}
```

조회 응답은 팀별로 `teamId`, `teamName`, `reviewState`, `photo`, `members`를 반환합니다. `reviewState`는 `NOT_SUBMITTED`, `PENDING`, `APPROVED`, `REJECTED`를 사용하고, 사진은 `photoId`, `readUrl`, `submittedAt`, `uploaderName`, `selectedMembershipIds`를 포함합니다. 사진 접근 권한이 없거나 만료된 경우에도 미제출로 바꾸지 않고 `photo.access = UNAVAILABLE`로 구분합니다.

수정 요청은 `photoId`, `decision`(`APPROVE`·`REJECT`), 선택적 `reason`을 받습니다. 마감된 세션의 사진 검수 수정은 거절해야 합니다.

## 마감 규칙

- `PENDING` 사진이 하나라도 있으면 출석 마감을 거절합니다. 이 검사는 화면 비활성화와 별개로 백엔드에서도 원자적으로 수행해야 합니다.
- 현재 mock 화면은 `PENDING`만 마감 차단 대상으로 취급합니다. `NOT_SUBMITTED`·`UNAVAILABLE`의 마감 정책은 백엔드 확인 전까지 확정하지 않습니다.
- 마감 성공 시 미정 출결은 결석으로 변환하고, 마감 취소 시 출결 결과는 유지한 채 편집 가능 상태만 복구합니다.

## 백엔드 확인 필요 사항

- 팀 사진 조회·승인·반려 API의 실제 경로와 요청·응답 필드
- `NOT_SUBMITTED`·`UNAVAILABLE` 사진이 마감을 막는지 여부
- 승인·반려가 선택 회원의 실제 출결을 언제 생성·갱신하는지
- 마감 응답이 현재 세션 상태를 반환하는지, 별도 재조회가 필요한지
- 마감 취소 후 사진 검수 결과와 출결 수정 가능 범위
