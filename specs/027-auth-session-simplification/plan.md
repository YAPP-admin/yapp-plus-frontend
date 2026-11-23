# 구현 계획: 인증 세션 단순화

**기준 이슈**: #329
**기준 커밋**: `origin/main` (2026-11-20 확인)

## 요약

기존 세대·single-flight 모델은 유지한다. 그 위에서 개발 전용 단계 로그를 추가하고, 서버 revoke 실패를 로컬 로그아웃 실패로 취급하지 않으며, 탈퇴와 refresh 저장 실패의 세대 검사를 명확히 한다.

## 기술 맥락

- TypeScript, Expo/React Native 0.88, Vite/React WebView
- 저장소: Expo SecureStore의 기존 세션 레코드
- 테스트: Vitest
- 변경 위치: `apps/mobile/src/auth`, `apps/web/src/features/auth/model`
- 공개 계약: `@yapp-plus/app-bridge`는 변경하지 않음

## 설계 결정

1. 개발 로그는 각 앱 내부 인증 모듈에만 둔다. `getSession`은 웹 요청·native 진입·native 반환·웹 수신을 결과 상태와 오류 코드로만 구분한다. 토큰·nonce·사용자 ID·응답 본문은 인자로도 전달하지 않는다.
2. 로그아웃은 revoke 결과를 관찰만 하고 `clear()`를 항상 호출한다. `clear()`의 저장소 실패는 기존 재시도로 남긴다.
3. 탈퇴 API adapter는 204와 transport/HTTP 실패를 구분한다. `AuthActions`가 요청 전 세대를 기록하고 응답 후 다시 검사한다.
4. refresh의 `commit()` 저장 실패는 lock 밖에서 `clear()`를 호출한다. 이전 토큰을 보관하거나 갱신 재시도를 만들지 않는다.
5. native WebView bootstrap은 RPC 응답 문제를 해결하지 못해 제거한다. 세션 복원은 웹의 최초 `getSession()`과 사용자의 명시적 재시도만 수행한다.

## 헌법 점검

- 최소 범위: 적용. 기존 `SessionManager`와 adapter를 확장하고 새 상태 계층을 만들지 않는다.
- 공용 계약: 적용. 생성 API와 app bridge 공개 계약은 변경하지 않는다.
- 의존성: 적용. 새 의존성 없음.
- 검증: 적용. 경합·저장 실패 테스트를 가장 가까운 auth 테스트에 둔다.
- 복구: 적용. 각 정책은 독립된 함수와 테스트로 되돌릴 수 있다. commit/push/PR은 별도 승인 필요.

## 검증 순서

1. `apps/mobile/src/auth`와 `apps/web/src/features/auth/model`의 단위 테스트
2. `mise exec -- node --run check`
3. `mise exec -- node --run build`
4. 개발 빌드에서 native 세션 복원 뒤 WebView가 마운트되는지, Apple·Google 성공/취소, 로그아웃, 재로그인, 앱 재시작을 수동 확인
