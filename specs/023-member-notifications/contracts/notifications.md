# 알림 API·브리지·탐색 계약

## 서버 계약

기준은 [백엔드 명세](https://github.com/YAPP-admin/yapp-plus-backend/blob/e2c2612a8652dc9c76f6ce7b6c26e97dbe8348c6/APIDOC.md)와 main의 생성 SDK다.

| 경로                                                    | 입력·결과                                                  | 오류·처리                                                |
| ------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| GET /api/users/me/notifications                         | cursor 선택, 20건 고정·생성 시각/id 역순, items·nextCursor | 400 cursor 재시작, 401 기존 갱신 1회, 503 재시도         |
| PUT /api/users/me/notification-devices/{installationId} | FID, platform=IOS, registrationToken=FCM token, 204        | 400 잘못된 입력, 401 갱신 1회, 409 등록 충돌, 503 재시도 |
| DELETE 동일 기기 경로                                   | 현재 user+session+FID 해제, 없어도 204                     | 서버 성공 전 선택 확정 금지                              |

SDK는 find3/find3InfiniteOptions/register/remove를 사용한다. 생성 파일은 직접 수정하지 않는다.
동일 FID+platform 등록은 현재 계정·세션으로 이전한다. 다른 FID의 동일 token 또는 platform 변경은
409다. 갱신은 기기 등록의 세션 귀속을 이전하고, 서버 로그아웃은 현재 유효한 refresh token을 보낸 경우 해당 세션 등록을 해제한다.
token 없음/이미 회전된 token의 204는 해제를 보장하지 않으므로, 진행 중 갱신 완료 뒤 token을 읽는다.
탈퇴는 사용자의 모든 등록을 해제한다. 별도 선행 DELETE로 로그아웃을 두 단계 서버 변경으로 만들지 않는다.

## AppBridgeState 추가 계약

| 공개 계약                                | 입력·출력                                                           |
| ---------------------------------------- | ------------------------------------------------------------------- |
| getNotificationSettings()                | 결과: SUCCESS + enabled·permission 또는 ERROR + code·retryable      |
| setNotificationEnabled({ enabled })      | boolean 입력 검증; 권한 충족·서버 성공·저장 후 SUCCESS              |
| requestNotificationPermission()          | OS 권한만 요청·반환; 이 호출 자체가 수신 선택을 변경하지 않음       |
| notificationOpen                         | null 또는 eventId + destination(ALERTS / POST와 양의 안전한 postId) |
| acknowledgeNotificationOpen({ eventId }) | 현재 대기 ID와 같을 때만 제거; 반복 확인은 무해                     |
| notificationRevision                     | 수신 후 증가하는 정수; 본문·토큰 없음                               |

권한 enum과 수명은 [데이터 모델](../data-model.md)을 따른다. 오류 code는 UNSUPPORTED,
AUTH_REQUIRED, PERMISSION_REQUIRED, BUSY, NETWORK, SERVER, STORAGE, CONFLICT,
INVALID_INPUT, INVALID_RESPONSE로 제한한다. 재시도 여부는 개별 결과에 둔다.
모든 공개 계약은 Zod·한국어 계약 주석을 제공한다. 위치 계약처럼 공개 root/web 진입점을 사용한다.
기본 웹 상태는 notificationOpen=null, revision=0이다. native 메서드 지원 여부를 확인해
구버전·브라우저에서 호출하지 않고 미지원 안내를 제공한다. openAppSettings는 기존 계약을 재사용한다.

## 탐색과 수신

- POST payload의 source와 postId를 검증해 NoticeDetail로, 일반·잘못된 대상은 Alerts로 보낸다.
- 탭 처리만 탐색한다. arbitrary URL·notificationId를 공지 ID로 해석하지 않는다.
- 콜드 스타트 대상은 네이티브가 보관하고 Stackflow가 준비된 뒤 typed flow로 처리한다.
- Alerts의 부모 Tabs(home), NoticeDetail의 부모 Tabs(notices)는 기존 route 계약을 재사용한다.
- 이미 같은 대상이 최상단이면 push 없이 ack한다. 다른 탭 이벤트가 도착해도 이전 ack로 지우지 않는다.
- 네이티브 세션 경계는 내부적으로 확인한다. 로그아웃·계정 교체는 미처리 이벤트를 폐기한다.
- 수신 revision 변화는 활성 화면에서 목록 갱신, 비활성은 복귀 후 갱신한다. 폴링은 없다.
- foreground는 RNFirebase banner/list 표시만 사용한다. 로컬 알림 복제·배지·소리 추가 정책은 없다.
