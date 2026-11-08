# 조사와 결정

- Android 기준은 `2b837e3cb21762c6a73f1db205be6a3ef2749a97`(2026-10-30)이다. 오늘 한국 시간 커밋 `0beb1416`, `2dc0db4d`는 팀 사진 UI이므로 제외한다. 출석·보고 구현은 두 커밋에서 바뀌지 않았다.
- 서버 기준은 `27ccce69b99166e4cd63275cd1e17bf14f37e886`의 APIDOC다. 로컬 생성 SDK는 해당 출석·보고 요청과 오류 계약을 이미 제공한다.
- 출석 제출은 홈 상태 `AVAILABLE`와 실제 세션 ID를 사용한다. 시간·권한을 클라이언트에서 별도로 계산하는 대안은 서버 판정과 달라질 수 있어 제외한다.
- 보고 요청에는 sessionId가 없다. 사용자가 보고 화면을 열 때의 세션을 서버 요청에 임의로 추가하지 않는다. 대상 변경 오류 뒤에는 조회와 명시적 재시도로 복구한다.
- 기존 nativeAuthClientOptions는 GET만 401 복구 재시도한다. 이번에는 POST 자동 재전송을 확대하지 않고 기존 GET 복구 후 수동 제출을 유지한다.
- Android는 `HomeInteractionViewModel.attendedSessionId`를 성공 후 메모리에 보관한다. 웹도 생성된 `verifyMutation` 성공 상태를 사용하며 별도 완료 query는 만들지 않는다. 영구 저장이나 출석 내역으로 실시간 상태를 추정하는 대안은 제외한다.
- 개발 시연의 `0000` 거절, 보고 무조건 성공, 운영 Activity 차단은 실제 제출 연동으로 교체한다. 팀 사진 시연은 범위 밖이다.
- 동일 목적의 열린 frontend 이슈를 제목 검색과 전체 열린 목록에서 찾지 못했다. 사용자 승인 후 [#385](https://github.com/YAPP-admin/yapp-plus-frontend/issues/385)를 생성했다.

## 근거

- [Android](https://github.com/YAPP-admin/yapp-plus-android/tree/2b837e3cb21762c6a73f1db205be6a3ef2749a97)
- [서버 계약](https://github.com/YAPP-admin/yapp-plus-backend/blob/27ccce69b99166e4cd63275cd1e17bf14f37e886/APIDOC.md)
- 로컬 `apps/web/src/pages/home`, `apps/web/stackflow/src/activities/home-sheets.tsx`, `apps/web/src/features/auth/model/native-auth-client.ts`, `packages/api/src/generated/types.gen.ts`.
