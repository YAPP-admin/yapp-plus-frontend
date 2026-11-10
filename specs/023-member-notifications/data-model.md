# 데이터 모델과 수명

| 개체          | 필드·책임                                             | 수명·검증                                                                       |
| ------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| 알림 항목     | id, content, sentDate, type, postId                   | 생성 SDK 계약을 따르는 Query 캐시                                               |
| 알림 페이지   | items, nextCursor                                     | 서버 순서 유지; null 종료                                                       |
| 설치 선택     | enabled                                               | Firebase project·FID별 SecureStore; 없음 ON, 손상 OFF, 읽기 실패 자동 등록 금지 |
| OS 권한       | notDetermined/denied/authorized/provisional/ephemeral | OS 조회 결과, 저장 선택과 별개; 허용 세 상태는 등록 가능                        |
| 등록 캐시     | 세션 식별자, FID, FCM token                           | 네이티브 메모리만; 같은 조합 PUT 생략, OFF는 DELETE 생략하지 않음               |
| 대기 탐색     | eventId, destination, 세션 경계                       | 최신 탭 한 건; cold start 복원 대기, 계정 변경/로그아웃 폐기                    |
| 수신 revision | 단조 증가 정수                                        | 앱 프로세스; 웹 캐시 갱신만, 알림 내용을 전달하지 않음                          |

POST의 postId가 null이면 목록 내용은 표시하되 링크는 만들지 않는다. GENERAL은 postId가 있더라도
링크를 만들지 않는다. 잘못된 ID·날짜·알 수 없는 목록 enum은 경계 오류로 처리한다.
푸시의 notificationId는 발송 ID이며 목록 항목 id와 대응하지 않는다. POST 중복 식별은
postPushDeliveryId, GENERAL은 notificationId, 없으면 FCM messageId를 사용한다. 모두 없으면
해당 콜백의 로컬 eventId를 만들며 서로 다른 콜백의 동일성을 추정하지 않는다.

## 상태 전이

- 설정: 조회 → 이전 선택 표시 → 권한 확인/요청 → PUT 또는 DELETE → 저장 → 새 선택 확정.
- 실패: 이전 선택 유지·재시도; 저장 실패는 이전 선택으로 동기화. 늦은 응답은 세션 경계 검사 후 폐기.
- 자동 동기화: 인증 없음은 등록 금지; ON+허용이면 PUT; OFF/권한 차단이면 DELETE.
- 로그아웃: 신규 등록·갱신 보류 → 진행 중 작업 완료 → 최신 refresh token 읽기 → revoke 204 → 세션 삭제·대기 폐기.
- revoke 실패: 세션 유지·보류 해제·재시도. 성공 후 삭제 실패: 복원 차단·로컬 삭제 재시도.
- 탐색: 수신만으로 이동하지 않음 → 탭 검증 → 최신 한 건 대기 → 인증/화면 준비 → 이동 → eventId ack.
- 인증 복원 실패·SIGNED_OUT: 원래 공지 대상 폐기 후 Login. 다른 계정 로그인 뒤 원래 대상을 재사용하지 않음.

토큰·본문은 URL·문서·로그·브리지에 기록하지 않는다. 알림 본문은 회원 API의 웹 응답으로만 표시한다.
DB migration과 기존 선택값 migration은 없다. SecureStore 키는 인증 세션 삭제와 분리한다.
