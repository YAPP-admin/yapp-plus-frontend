# 실행·검증 안내

이 문서는 단계별 구현 후 사용할 절차다. 미완료 단계의 기능이 이미 구현되었다고 간주하지 않는다.
각 명령은 해당 단계의 리뷰 승인 후 실행한다. 루트에서 mise에 고정된 Node·pnpm을 사용한다.

## 2~3단계: 설치와 생성

```sh
mise exec -- pnpm install --frozen-lockfile
OPENAPI_INPUT=https://44nk4mnqi7.execute-api.ap-northeast-2.amazonaws.com/v3/api-docs \
  mise exec -- pnpm --filter @yapp-plus/api generate
mise exec -- pnpm --filter @yapp-plus/api typecheck
```

2단계의 의존성 추가는 catalog·package.json과 lockfile을 함께 갱신한다. 위 frozen 설치는
갱신된 lockfile의 재현성을 확인하는 절차다. 설치 보호 정책을 전역 해제하지 않는다.
SDK와 MSW를 같은 입력으로 생성하고 operation을 대조한다. 재현성 비교는 같은 로컬 snapshot으로
두 번 생성해 진행한다. 실패한 다운로드나 파싱 결과로 기존 생성물을 덮어쓰지 않는다.

## 5단계: 개발 브라우저

```sh
VITE_API_MOCKING=true mise exec -- pnpm --filter @yapp-plus/admin dev
NEXT_PUBLIC_API_MOCKING=true mise exec -- node --run dev:web
```

각 앱에서 worker 정적 파일이 200으로 열리는지 확인하고, 준비 안내 후 기존 화면이 표시되는지 본다.
기존 화면은 직접 mock 호출을 유지하므로 화면만 열었다고 SDK 가로채기를 검증한 것으로 기록하지 않는다.
브라우저 Network 또는 개발 도구에서 계약의 다섯 대표 API를 명시적으로 요청해 모의 응답을 확인한다.
로그인 검증에는 합성 입력만 사용한다. 자동·수동 응답이 모두 없는 알려진 API는 501, 알 수 없는 대상 경로는 오류여야 한다.
명세의 응답 전체 예제가 있으면 자동 응답으로 활용하며, 부족한 대표 사례만 수동 보완한다.
정적 자원·HMR·외부 서비스는 정상이어야 한다. worker 실패 시 자식 화면이 열리지 않아야 한다.
worker 준비와 첫 SDK 요청의 순서는 초기화 경계 테스트와 브라우저 요청 기록으로 확인한다.

두 변수를 false로 바꾸고 개발 서버를 재시작하면 기존 화면이 즉시 렌더되어야 한다.
모킹 활성 상태의 SSR와 첫 hydration은 같은 준비 안내를 사용하며 hydration 경고가 없어야 한다.

## 4·6단계: 테스트

```sh
mise exec -- pnpm --filter @yapp-plus/admin test
mise exec -- pnpm --filter @yapp-plus/web test
```

- 생성 SDK를 테스트 전용 base URL로 호출하고 성공·빈 결과·401·network error·204·501을 확인한다.
- path·query·body가 resolver에 전달되는지 필요한 요청에서 확인한다.
- 생성 Zod로 대표 응답을 검증하고 read 누락 거부·readAt null 허용을 확인한다.
- 한 테스트의 server.use override가 다음 테스트에 남지 않는지 확인한다.
- 준비 전 호출 없음, 준비 후 렌더, 실패 시 호출 없음, 비활성 시 즉시 렌더를 확인한다.

## 7단계: 전체 품질과 배포 산출물

```sh
mise exec -- node --run check
mise exec -- node --run build
```

개발 플래그를 true로 둔 프로덕션 빌드에서도 worker가 등록되지 않아야 한다.
fixture의 고유한 합성 문자열과 초기화 모듈을 기준으로 client/server 실행 번들을 검사한다.
정적 `mockServiceWorker.js`가 남는 것은 별도로 기록하고 등록 코드·fixture 포함과 혼동하지 않는다.
원격 실제 인증·회원 데이터 요청으로 검증하지 않는다. 결과와 실행하지 못한 항목은 validation.md에 남긴다.

## 복구

개발 플래그를 끄고 서버를 재시작한다. 코드 복구가 필요하면 앱 초기화 → 수동 mocks → 생성 설정 순으로
관련 변경을 되돌린다. 실제 데이터·인증 저장소를 바꾸지 않으므로 데이터 마이그레이션은 없다.
