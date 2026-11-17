# YAPP+ 어드민

모든 명령은 저장소 루트에서 실행합니다. Node·pnpm은 mise에 고정된 버전을 사용합니다.

## 개발 서버

```sh
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm --filter @yapp-plus/admin dev
```

기본 주소는 `http://localhost:3001`입니다. 기존 화면의 직접 mock 서비스는 유지하며,
생성 API를 사용하는 브라우저 요청에 MSW를 적용할 수 있습니다.

## 세션 관리 기수 설정

세션 관리 화면은 API 경로에 사용할 실제 DB 기수 ID를 명시적으로 요구합니다.

```sh
VITE_ADMIN_GENERATION_ID=<확인한-기수-ID> mise exec -- pnpm --filter @yapp-plus/admin dev
```

반복해서 사용할 때는 `.env.local`의 `VITE_ADMIN_GENERATION_ID`에 확인한 값을 설정합니다.
로그인 응답은 운영진 정보와 토큰만 제공하며, 현재 어드민 API에는 접근 가능한 기수 ID 목록을
조회하는 계약이 없습니다. 표시 기수 번호를 ID로 추정하지 말고 백엔드·운영 경로에서 확인합니다.
설정이 없거나 숫자가 아니면 세션 API를 호출하지 않고 화면에 설정 안내를 표시합니다.

## API 모킹 켜기와 끄기

```sh
VITE_API_MOCKING=true mise exec -- pnpm --filter @yapp-plus/admin dev
```

반복해서 사용할 때는 앱 디렉터리에 `.env.local`을 만들고
[.env.example](.env.example)을 참고해 `VITE_API_MOCKING=true`를 설정합니다.
설정 변경 후 개발 서버를 재시작하고 페이지를 새로고침합니다.

- 미지정·`false`: 모킹 비활성. 기존 화면을 바로 표시합니다.
- `true`: development에서 worker 준비 후 화면을 표시합니다.
- 그 밖의 값: 개발 환경에서 오류 안내를 표시합니다.
- production·test: 이 플래그로 브라우저 worker를 시작하지 않습니다.

끄려면 `VITE_API_MOCKING=false`로 설정한 뒤 개발 서버와 페이지를 다시 시작합니다.
모킹은 생성 client의 base URL을 기준으로 구성합니다. 주소를 바꿀 때는 worker 초기화 전에
client 설정을 적용하고 페이지를 새로고침합니다.

## 초기화 실패와 worker 갱신

준비 안내가 오류 안내로 바뀌면 개발자 도구의 오류와 `/mockServiceWorker.js` 응답을 확인합니다.
Service Worker를 지원하는 localhost 또는 HTTPS 환경에서 사용합니다.
worker가 없거나 MSW 버전을 변경했다면 다음 명령으로 다시 생성합니다.

```sh
mise exec -- pnpm --filter @yapp-plus/admin exec msw init public --save
```

[public/mockServiceWorker.js](public/mockServiceWorker.js)는 생성 파일이므로 직접 수정하지 않습니다.
저장소는 고정 MSW 버전의 postinstall 복사를 비활성화하고 CLI로 명시적으로 갱신합니다.
생성 후 개발 서버를 재시작하고 새로고침합니다. 초기화 실패 중에는 자식 화면을 열지 않습니다.

## 기능 테스트

```sh
mise exec -- pnpm --filter @yapp-plus/admin test
```

[vitest.setup.ts](vitest.setup.ts)가 [테스트 서버](src/mocks/server.ts)를 시작하고,
각 테스트 전에 생성 client를 `https://api.yapp.test`로 설정합니다.
테스트 종료 후 기존 렌더 cleanup과 `resetHandlers`를 실행하고 파일 종료 시 서버를 닫습니다.
브라우저 플래그나 별도의 `listen` 호출은 필요하지 않습니다.

실제 기능 테스트에서 앱의 `server`와 `apiBaseUrl`을 import하고 `server.use`로 응답을 바꿉니다.
응답 타입·생성 handler 사용 예시는 [API 패키지 README](../../packages/api/README.md)를 참고합니다.
모킹 자체를 위한 별도 테스트는 추가하지 않습니다.

## 검증과 제한

```sh
mise exec -- node --run check
mise exec -- node --run build
```

미구현 응답은 501, 미등록 대상 API는 오류로 차단되며 실서버로 우회하지 않습니다.
정적 자원과 외부 서비스는 모킹 대상이 아닙니다. 프로덕션은 플래그와 관계없이 모킹을 시작하지 않으며,
정적 worker 파일이 배포 폴더에 존재하는 것만으로 worker가 등록되지는 않습니다.

브라우저 모킹은 클라이언트 요청에만 적용됩니다. SSR·route loader·네이티브·실기기 WebView 요청은
포함하지 않습니다. 전체 CRUD 상태나 실제 인증을 재현하지 않습니다.
API 재생성·응답 추가·현재 지원 범위는 [API 패키지 README](../../packages/api/README.md)에 있습니다.

세션 목록 MSW 응답은 정규·팀 세션 각 1개의 고정 합성 데이터입니다. 생성·수정·삭제 요청은 계약상
성공 응답을 반환하지만 고정 목록을 변경하지 않으므로, 브라우저에서 성공 알림 뒤 같은 항목이 다시
보일 수 있습니다. CRUD 이후 목록 변화·오류·경합은 요청별 응답을 지정한 자동 테스트로 검증합니다.

## 실서버 확인과 복구

실서버 확인은 `VITE_API_MOCKING=false`와 확인한 `VITE_ADMIN_GENERATION_ID`로 별도 실행합니다.
쓰기·삭제 전에 대상 테스트 세션과 정리 범위를 승인받고, 조회·생성·수정·삭제 후 새로고침 결과를
확인합니다. 인증 정보·실제 회원·주소 데이터는 문서나 로그에 남기지 않습니다.

문제가 생기면 `VITE_ADMIN_GENERATION_ID`를 제거하고 다시 빌드해 세션 API 요청을 차단할 수 있습니다.
프론트 코드를 롤백해도 이미 생성·수정·삭제된 서버 데이터는 복구되지 않으므로 서버 데이터 정리는
별도로 수행해야 합니다.
