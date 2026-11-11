# 사진 입력·제출 계약

## 사진 RPC

`pickAttendancePhoto({ source: 'library' | 'camera' })`를 `AppBridgeState`와 공용 `photo.ts`에 추가한다.

- 성공: `SUCCESS`, `photo: { filename, contentType: 'image/jpeg', sizeBytes, width, height, base64 }`.
- 취소: `CANCELLED`; 기존 선택을 지우지 않는다.
- 실패: `ERROR`, `INVALID_INPUT | BUSY | PERMISSION_DENIED | INVALID_IMAGE | TOO_LARGE | PROCESSING_FAILED`.
- 권한 거부에만 `canAskAgain`을 포함한다. URI·EXIF·원문 OS 오류는 넘기지 않는다.
- 결과 파일명은 `team-attendance.jpg`, 수치 필드는 양의 정수다. source·결과·Base64 디코딩 크기를 양쪽에서 검증한다.
- 연속 호출은 BUSY, 취소도 busy 해제다. JPEG 품질 0.9, 긴 변 2,560px 이하, 비확대, 최종 10MiB 이하를 적용한다.
- 이번 작업이 생성한 캐시만 삭제하고 앨범 원본은 보존한다. 웹은 Blob 변환 후 Base64 참조를 해제한다.

## 화면 입력과 수명

입력은 `sessionId`, `teamName`, `selfMembershipId`, `members: { membershipId, name, positionLabel }[]`다. 모든 ID는 양의 안전 정수이고 본인은 정확히 한 명 있어야 한다. 본인은 선택·잠금으로 시작하며, 완료 데이터는 유효한 응답의 photoId·서버 시각·PENDING과 제출 당시 명단 스냅샷이다. 개인정보를 URL params로 보내지 않는다.

## 기존 서버 API

1. `presign`: `POST /api/sessions/{sessionId}/team-attendance-photos/presign`에 filename, contentType, sizeBytes, 최종 JPEG 바이트의 SHA-256 Base64를 보낸다.
2. imageKey·HTTPS uploadUrl·signedHeaders·미래 expiresAt을 검증하고 S3 PUT에 정확한 JPEG 바이트와 headers를 사용한다. API Bearer는 보내지 않으며 2xx만 성공이다.
3. `submit`: `POST /api/sessions/{sessionId}/team-attendance-photos`에 imageKey와 selectedMembershipIds를 보낸다.
4. 성공은 201, 양의 안전 정수 photoId, 파싱 가능한 submittedAt, 정확히 PENDING인 status다.

presign·PUT 실패는 입력 유지 후 새 URL로 시작한다. 400/401/403/404/409는 정규화된 안내를 표시하고 서버 원문은 노출하지 않는다. submit 후 네트워크 단절·timeout·5xx·잘못된 성공 응답은 결과 불명으로 처리한다. 자동 재전송·성공 추정·key 재사용은 없다.
