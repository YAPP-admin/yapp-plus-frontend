# 작업 목록: 인증 세션 단순화

- [x] T001 `specs/027-auth-session-simplification/spec.md`에 범위와 수용 기준 기록
- [x] T002 `apps/mobile/src/auth`의 세션·API adapter·경합 정책 확인
- [x] T003 [US1] `apps/mobile/src/auth`에 개발 전용 로그인 단계 진단 추가
- [x] T004 [US1] `apps/web/src/features/auth/model`에 브릿지 요청·응답·반영 진단 추가
- [x] T005 [US2] `apps/mobile/src/auth/session.ts`에서 revoke 실패 뒤 로컬 삭제 보장
- [x] T006 [US2] `apps/mobile/src/auth/auth-api.ts`와 `actions.ts`에서 204 전용 탈퇴와 세대 폐기 구현
- [x] T007 [US3] `apps/mobile/src/auth/session.ts`에서 갱신 저장 실패 뒤 세션 정리
- [x] T008 `apps/mobile/src/auth/*.test.ts`와 웹 모델 테스트에 회귀 사례 추가
- [x] T009 `specs/027-auth-session-simplification/validation.md`에 실행·수동 검증·미검증 항목 기록
- [x] T010 `node --run check`, `node --run build` 실행
