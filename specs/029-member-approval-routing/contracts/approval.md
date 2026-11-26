# API·브리지·화면 계약

## 서버 입력

- Google: `POST /api/auth/oidc/google/native-authentications`.
- Apple: `POST /api/auth/oidc/apple/native-authentications`.
- 가입 완료: 기존 생성 SDK `register1`의 AuthenticationResponse.
- SIGNUP_REQUIRED는 기존 가입 자격 처리 유지. SIGNED_IN에서 user.id와 user.reviewStatus를 검증한다.
- reviewStatus는 PENDING·APPROVED·REJECTED·null만 수용한다. 누락·다른 값은 INVALID_RESPONSE다.
- APPROVED만 기존 세션 자격 검증 후 저장한다. 제한 상태는 토큰이 없어도 사용자·상태가 유효하면 처리한다.
- 본인 조회·renew 계약은 변경하지 않는다. 생성 코드는 원본 명세로만 갱신한다.

## 공개 브리지 확장

AuthResult에 다음 결과를 추가한다. 이름·필드는 최종 구현과 계약 테스트의 기준이다.

```ts
type ReviewRequired = Readonly<{
  status: 'REVIEW_REQUIRED';
  userId: number;
  reviewStatus: 'PENDING' | 'REJECTED' | null;
}>;
```

새 native가 내보내는 SIGNED_IN 결과에는 필수
`reviewTransition: 'NONE' | 'PENDING_TO_APPROVED'`를 추가한다.
AuthSession과 signIn·completeSignup·getSession·refreshSession·signOut 메서드 인자는 유지한다.
승인 전환 정보는 직접 인증 성공 결과에만 붙이며 사용자별 1회 전환을 위한 정보다.
정상 세션을 조회·갱신할 때는 `NONE`을 사용한다. 웹 신뢰 경계도 필드 없는 SIGNED_IN을 INVALID_RESPONSE로 거부한다.
웹 내부와 native의 결과는 항상 필수 필드를 사용한다.
새 결과와 전환 정보는 신뢰 경계에서 검증하며 타입 단언으로 생략하지 않는다.
REVIEW_REQUIRED에는 토큰·이름·전화번호·원문 서버 오류를 포함하지 않는다.

## 웹 소비와 이동

| 결과·맥락                            | 목적지              |
| ------------------------------------ | ------------------- |
| REVIEW_REQUIRED / PENDING            | SignupStatus        |
| REVIEW_REQUIRED / REJECTED 또는 null | Error               |
| 로그인·가입 실패 / INVALID_RESPONSE  | 기존 오류 안내 유지 |
| 가입 성공 / SIGNED_IN                | SignupComplete      |
| 로그인 성공 / PENDING_TO_APPROVED    | SignupComplete      |
| 일반 로그인·기존 복원 / SIGNED_IN    | Tabs(home)          |
| SIGNUP_REQUIRED                      | Signup              |
| 제한 상태 정리 성공 / SIGNED_OUT     | Login               |

인증 결과를 먼저 캐시에 반영한 뒤 한곳에서 이동 대상을 정한다. SignupComplete가 보이기 전에
Login의 자동 리다이렉트가 Tabs를 먼저 만들지 않도록 통합 테스트한다.
로그인·가입의 제한 상태 이동은 mutation callback에서 바로 실행하지 않고, Activity가 반영된
인증 상태를 구독한 뒤 실행한다. 대기 화면 가드가 이전 로그아웃 상태를 읽어 Login으로 되돌리는
경합을 방지한다.
제한 상태의 AccountScreen은 children과 업무 Query를 만들지 않는다. public Error·SignupStatus는
허용하되 인증 결과가 없는 직접 대기 진입은 native에서 Login으로 복귀한다.
일반 브라우저 개발용 화면 확인은 기존 범위를 유지하며 실제 로그인으로 간주하지 않는다.

## 뒤로가기·오류

대기 화면: 기존 아이콘 → 확인 Dialog → signOut 정리 성공 → Login replace.
취소 시 현재 화면 유지. 정리 실패 시 버튼 재시도 허용, 중복 호출 금지.
현재 제한 상태를 정리해 Login에서 대기 화면으로 자동 왕복하지 않게 한다.
Error의 뒤로가기도 제한 상태를 정리하고 Login으로 이동한다. Error에서 별도 확인 Dialog는 추가하지 않는다.
기존 스와이프 차단을 유지하며 직접 URL·history pop으로 보호 화면을 우회할 수 없게 한다.
문의 링크는 최신 main의 값을 보존한다. 일반 BackButton 소비자의 동작은 바꾸지 않는다.

## 호환성

새 웹은 구버전 결과의 누락 필드를 INVALID_RESPONSE로 거부한다. 새 native보다 웹을 먼저 배포한다.
OTA 적용 전 로그인 실패는 허용하며, 재로그인만으로는 이전 앱 코드가 바뀌지 않는다.
강제 업데이트·자동 재시작 흐름은 추가하지 않는다.
새 앱에서 이미 저장된 세션을 복원할 때 승인 검사를 생략하는 정책은 유지한다.
웹의 차단은 서버의 업무 인가를 대체하지 않는다.
