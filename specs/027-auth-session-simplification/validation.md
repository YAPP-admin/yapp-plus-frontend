# 검증 기록: 인증 세션 단순화

## 자동 검증

2026-11-20 실행 결과:

- `apps/mobile` 인증 관련 Vitest: 4개 파일, 91개 통과 (새 실행)
- `apps/web` 인증 모델 Vitest: 2개 파일, 4개 통과 (새 실행)
- `mise exec -- node --run check`: 통과. mobile·web lint/typecheck/test은 새 실행, 나머지 Turbo 작업은 캐시 재사용이 섞여 있다.
- `mise exec -- node --run build`: 통과. web build는 새 실행, admin·storybook 일부는 Turbo 캐시 재사용이다.

## 수동 개발 빌드 확인

- Apple 로그인 성공·취소
- Google 로그인 성공·취소
- 서버 거절과 SDK 실패에서 개발 로그의 단계 확인
- 로그아웃·재로그인·앱 재시작

실기기 계정·개발 빌드가 필요한 항목은 자동 테스트 성공으로 대체하지 않는다.

이번 작업에서는 Apple·Google 실기기 성공·취소, 실제 SecureStore 실패 주입, 앱 재시작은 실행하지 못했다. 개발 빌드에서 `[auth] provider|exchange|storage` 및 `[auth-bridge]` 로그로 확인한다.

## 운영 주의 사항

로그아웃은 서버 revoke 실패·timeout에도 기기 로컬 자격을 삭제한다. 이때 서버 세션 또는 푸시 등록은 남을 수 있으며, 앱은 자동 재시도를 수행하지 않는다.
