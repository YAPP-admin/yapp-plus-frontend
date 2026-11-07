# 계약: 선택적 세션 이름

## 공개 인터페이스

`@yapp-plus/app-bridge`의 `AuthSession`에 `readonly name?: string`을 추가한다.
기존 인증 RPC, status, userId, sessionId, tokenVersion과 계정 경계는 유지한다.
공유 `sessionNameSchema`는 unknown을 받아 양끝 공백을 제거한 비어 있지 않은 문자열 또는
undefined로 정규화한다. 누락·null·숫자·공백은 오류를 던지지 않고 undefined가 된다.
native API 입력·저장 복구와 웹 이름 표시에서 이 schema를 사용한다.

## 저장·갱신

1. 로그인·가입의 `toCredentials`가 서버 user.name을 정규화한다. 이름 오류만으로 인증을 실패시키지 않는다.
2. `SessionCredentials`, `StoredSession`에 선택적 이름을 추가한다. version 1과 기존 저장 key를 유지한다.
3. 기존 필수 자격 검증 후 이름만 별도로 정규화한다. 잘못된 이름 때문에 저장 레코드를 삭제하지 않는다.
4. 기존 직렬화된 commit 안에서 userId·refreshToken·name을 함께 저장하고 공개 세션에 name을 포함한다.
5. refresh·restore는 저장된 name을 credentials에 전달한다. 갱신 응답 user의 존재에 의존하지 않는다.
6. 새 establish는 새 credentials만 저장한다. 이전 이름과 null 병합하지 않는다.
7. 기존 clear·세대 검사로 로그아웃·탈퇴·계정 변경 및 늦은 응답을 처리한다. 이름은 로그에 출력하지 않는다.

## 웹·호환성·롤백

- 웹은 세션 이름을 다시 정규화해 표시하고 없으면 `—`를 사용한다. 고정 샘플 이름·프로필 alt를 제거한다.
- 이름을 localStorage, 별도 query, 계정 키에 보관하지 않는다. 기존 AuthResult 전체 전달 흐름을 사용한다.
- 구버전 native 및 기존 저장 데이터에는 이름이 없어도 된다. 다음 정상 로그인·가입까지 `—`일 수 있다.
- 새 native와 구버전 웹은 추가 필드를 무시한다. native 롤백 시 이름이 사라질 수 있지만 로그인 자격은 유지한다.
- 프로필 API가 추가되면 표시 출처 변경은 별도 작업이다. 이번에는 인증 프로토콜 전체 검증을 재설계하지 않는다.
