# 실행과 검증

1. mise의 Node 24.20.0·pnpm 12.3.4로 `pnpm install --frozen-lockfile`을 실행한다.
2. `pnpm --filter @yapp-plus/admin dev` 후 `http://localhost:3001/login`을 연다.
3. 빈 입력 제출, 틀린 입력 제출, 수정 후 `admin-demo` / `demo-password` 성공 이동을 확인한다.
4. 1440×1080·768px·375px에서 기본·오류 상태, 키보드 포커스·Enter와 화면 넘침을 확인한다.
5. `pnpm --filter @yapp-plus/admin test`, `node --run check`, `node --run build`를 실행한다.
6. admin의 빌드된 서버로 `/login`을 열어 비활성 안내를 확인한다. `.output`에서 테스트 계정
   문자열과 모의 모듈이 없는지 확인한다. Vercel Preview도 모의 로그인을 제공하지 않는다.

스크린샷은 `.context/`에 저장한다. 스크린 리더와 실제 터치 기기를 확인하지 못하면 별도로 기록한다.
실제 API·세션·접근 제어는 연결되어 있지 않으며 `/`는 직접 접근할 수 있다.
