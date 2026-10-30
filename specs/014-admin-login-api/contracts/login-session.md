# 내부 계약: 관리자 로그인과 세션

## 브라우저 세션 함수

```ts
readAdminAccessToken(): string | undefined
saveAdminAccessToken(token: string): boolean
configureAdminApiClient(): void
```

### `readAdminAccessToken`

- 브라우저가 아니거나 저장소 접근이 실패하면 `undefined`다.
- 저장 값이 빈 문자열이면 `undefined`다.
- token을 파싱·로그·복호화하지 않고 원문을 반환한다.

### `saveAdminAccessToken`

- non-empty 문자열만 `yapp-plus-admin.access-token.v1`에 저장한다.
- 저장 성공은 `true`, 잘못된 입력이나 저장소 예외는 `false`다.
- 실패 시 기존 저장 값을 명시적으로 삭제하지 않는다.

### `configureAdminApiClient`

- 생성 client의 기존 base URL과 다른 설정을 유지하면서 auth callback을 추가한다.
- callback은 `auth.key === 'staffBearerAuth'`일 때만 현재 저장 값을 반환한다.
- callback은 호출 때마다 값을 읽고 서버에서는 `undefined`를 반환한다.
- 여러 번 설정해도 interceptor를 누적하지 않는다.

## 로그인 함수

```ts
type LoginInput = { username: string; password: string };

type LoginResult =
  { status: 'success' } | { status: 'invalid-credentials' } | { status: 'unavailable' };

type Login = (input: LoginInput) => Promise<LoginResult>;
```

### 요청 변환

```text
LoginInput.username -> StaffLoginRequest.loginId
LoginInput.password -> StaffLoginRequest.password
```

폼이 username을 trim한 뒤 호출하며 login 함수는 password를 변형하지 않는다.

### 응답 매핑

| API 결과                | `LoginResult`         | 저장소 변화   |
| ----------------------- | --------------------- | ------------- |
| 유효한 200 + 저장 성공  | `success`             | 새 token 저장 |
| 401                     | `invalid-credentials` | 기존 값 유지  |
| 400·5xx                 | `unavailable`         | 기존 값 유지  |
| 네트워크·응답 파싱 실패 | `unavailable`         | 기존 값 유지  |
| 200 계약 검증 실패      | `unavailable`         | 기존 값 유지  |
| 200 token 저장 실패     | `unavailable`         | 기존 값 유지  |

## 폼과 화면 이동

- `LoginForm`은 `login`과 `onSuccess`만 받고 환경별 `available` flag를 받지 않는다.
- 제출 중에는 입력과 버튼을 잠그고 추가 제출을 무시한다.
- 현재 제출 observer가 유지된 성공만 `onSuccess`를 호출한다.
- unmount 뒤 성공은 login 함수의 token 저장까지만 완료하고 `onSuccess`를 호출하지 않는다.
- 인증 오류 문구, 입력 보존, 수정 후 재시도와 첫 필드 오류 포커스는 기존 계약을 유지한다.

## 보안 불변식

- 실제 아이디·비밀번호·발급 token·Authorization header를 코드, fixture, 문서, 로그와 이미지에
  기록하지 않는다.
- Staff 요약과 비밀번호를 localStorage에 저장하지 않는다.
- 관리자 token을 다른 인증 종류에 전달하지 않는다.
- 생성 API 파일과 명세를 직접 수정하지 않는다.
