# Quickstart: 세션 시작일·종료일 분리

## 자동 검증

저장소 루트에서 실행한다.

```sh
node --run check
```

다음 테스트가 범위를 검증한다.

- `apps/admin/src/pages/sessions/model/session.test.ts`: 날짜 범위와 전체 종료 일시 검증
- `apps/admin/src/pages/sessions/model/session-api-model.test.ts`: API 응답·요청 변환
- `apps/admin/src/pages/sessions/ui/session-form.test.tsx`: 두 날짜 입력과 오류 표시
- `apps/admin/src/pages/sessions/ui/session-card.test.tsx`: 기간 표시

2026-11-27 검증 결과:

- 세션 관련 8개 테스트 파일 68건 통과
- `node --run typecheck`, 관리자 앱 build, 변경 파일 lint·format 통과
- `node --run check`는 기존 작업 중인 `tools/discord-github-issue-bridge/README.md` 포맷 오류와 `packages/api/src/mocks/handlers.ts` lint 오류로 전체 통과하지 못함
- 전체 테스트의 기존 관리자 출석 라우터 테스트 5건도 별도 실패함

## 수동 확인

1. `VITE_API_MOCKING=true`로 관리자 앱을 실행한다.
2. 세션 관리에서 `세션 추가`를 연다.
3. 시작일을 `2026-11-20`, 종료일을 `2026-11-21`, 시작 시간을 `23:00`, 종료 시간을 `01:00`으로 입력한다.
4. 저장 요청에 두 날짜가 포함되고 목록 카드가 `2026.11.20 · 23:00 – 2026.11.21 · 01:00`처럼 표시되는지 확인한다.
5. 종료일을 시작일보다 빠르게 바꿔 종료일 오류가 표시되고 저장 요청이 발생하지 않는지 확인한다.

실서버 확인은 백엔드 OpenAPI와 저장 모델이 새 계약으로 배포된 뒤에만 수행한다.
