# 조사와 결정

## 기준과 확인 수준

- 프런트엔드 기준: `4fc4cd837bc04df3d7c2c99152af5ce6ba68c744`. 기존 홈·일정 조회와 native 인증·캐시 경계를 읽었다.
- [안드로이드 기준](https://github.com/YAPP-admin/yapp-plus-android/tree/2b837e3cb21762c6a73f1db205be6a3ef2749a97): 이름 저장, 미지원 값 `—`, 결석 10회 경고, 출결·운영진 판단 매핑을 확인했다.
- [백엔드 dev 기준](https://github.com/YAPP-admin/yapp-plus-backend/tree/27ccce69b99166e4cd63275cd1e17bf14f37e886): 로그인 UserResponse와 출결 조회 Controller를 확인했다.
- 배포 `GET /v3/api-docs`는 30초 타임아웃이었다. 최신 배포 명세·실제 API 응답 검증을 완료했다고 보지 않는다.
- [Hand off 마이페이지](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=222-40302): 메인 카드의 순서는 출석·지각·결석·지각 면제권이다. `222:40321` 스크린샷과 메타데이터를 확인했다.
- 과거 Wireframe `65:43324`의 구제 통계·카드 배치는 이번 기준에서 제외한다.

## 이름 전달

**결정**: 선택적 이름을 기존 credentials·SecureStore·AuthSession으로 전달한다.
**근거**: 서버 로그인 응답에는 이름이 있으나 native `toCredentials`가 userId만 취한다.
refresh 응답의 user는 없을 수 있어 저장된 이름을 보존해야 한다. 연구 검토에서도 기존 구조 확장으로 충분함을 확인했다.
**대안**: 별도 프로필 API는 아직 없고 사용자가 백엔드에 요청했다. 임의 API·별도 이름 캐시를 만들지 않는다.

기존 저장 버전의 선택적 필드로 확장하면 강제 로그아웃 없이 복구할 수 있다.
이름만 잘못된 경우 인증 자격을 폐기하지 않으며, 새 로그인에서 이전 이름을 보충하지 않는다.
웹의 기존 AuthResult는 타입 계약만 있으므로 새 이름의 표시 경계에서도 정규화한다.

## 조회와 화면 정책

**결정**: 생성 query 옵션·기존 인증 client를 사용하고 점수 조회만 두 화면이 공유한다.
**근거**: 이미 생성된 `mineOptions`, `find5InfiniteOptions`, Zod·MSW가 있고 네이티브 401 복구가 연결되어 있다.
**대안**: 새 HTTP 래퍼·공용 API 패키지·페이지 간 import는 소비 범위를 불필요하게 넓힌다.

생성 Zod의 int64는 bigint, 생성 TypeScript는 number다. 안전 범위를 검증한 뒤 number로 변환해
조회 반환값과 생성 타입을 맞춘다. SDK는 responseValidator 반환값을 버리므로 내역은
responseTransformer에서 검증·변환한 값을 반환하고 점수는 queryFn에서 parse 결과를 반환한다.
사용자 리뷰에 따라 생성 mineOptions의 queryFn·query key를 재사용하며 HTTP status와 code의
중복 판별을 제거했다. 생성 SDK가 던진 오류 본문에서 미대상 code는 unavailable 상태와 reason으로 보존하고 나머지 오류는 원형대로 전파한다.
점수는 `useSuspenseQuery`·Suspense·ErrorBoundary, 내역은 `useInfiniteQuery`로 독립 상태를 표시한다.
규칙 다이얼로그는 경계 밖에 두어 로딩 완료로 닫히지 않으며 재조회 실패 시 이전 값을 유지한다.

## 페이지네이션과 경고

**결정**: 사용자가 선택한 무한 스크롤, 서버 순서 유지, sessionId 중복 제거와 반복 커서 차단.
**근거**: 서버는 시작된 세션을 커서로 반환하므로 받은 목록의 결석 수는 전체 확정 결석 수가 아니다.
경고는 점수 응답만 사용한다. 부분 목록으로 통계나 진행률을 계산하지 않는다.
**대안**: 더 보기 버튼은 사용자 선택으로 제외했다. 진행률 계산도 이번 범위에서 제외했다.

## 후속과 승인

회원 구분·기수·직군·지각 면제권은 현재 계약에 없어 `—`로 남긴다.
백엔드 답변을 기다리지 않고 진행하며 새 계약 수신 시 별도 변경으로 검토한다.
같은 목적의 열린 이슈를 제목 `마이페이지`, `출석 내역`으로 조회했으나 결과가 없었다.
이슈 초안은 `.context/my-attendance-issue.md`에 준비했으며 사용자 승인 후 [#352](https://github.com/YAPP-admin/yapp-plus-frontend/issues/352)를 생성했다.
Spec Kit extension 설정 파일이 없어 before/after hooks는 적용 대상이 없다.
