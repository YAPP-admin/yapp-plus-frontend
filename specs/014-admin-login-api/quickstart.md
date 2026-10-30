# 검증 가이드: 관리자 로그인 API와 세션 연동

모든 명령은 저장소 루트에서 실행한다. 실제 자격 증명과 응답 token은 명령 인자, 파일, 로그와
스크린샷에 기록하지 않는다.

## 1. 집중 테스트

```sh
mise exec -- pnpm --filter @yapp-plus/admin test --run src/features/login
```

token 저장·재조회, Staff 전용 인증, 요청 변환과 오류 매핑, 기존 token 유지, unmount 뒤 탐색 차단을
확인한다.

## 2. 개발 MSW

```sh
VITE_API_MOCKING=true mise exec -- pnpm --filter @yapp-plus/admin dev
```

`http://localhost:3001/login`에서 제출·로딩·성공 이동을 확인한다. 요청은 생성 SDK 경로를 사용하고
실서버로 우회하지 않아야 한다. 테스트 입력과 token 값은 검증 기록에 남기지 않는다.

## 3. 개발 실서버

```sh
VITE_API_MOCKING=false mise exec -- pnpm --filter @yapp-plus/admin dev
```

- 성공 시 `/` 이동과 versioned 저장 key 생성을 확인한다.
- 잘못된 입력은 자격 증명 오류를 표시하고 재시도할 수 있어야 한다.
- 재시작 뒤 Staff 보호 요청에 인증이 적용되는지 확인한다.
- 요청 중 다른 화면으로 이동한 뒤 응답이 와도 현재 화면이 유지되는지 확인한다.

개발자 도구나 검증 이미지에 token과 Authorization 값을 노출하지 않는다.

## 4. 전체 품질 게이트

```sh
mise exec -- node --run check
mise exec -- node --run build
```

Turbo 출력에서 새 실행과 캐시 재사용을 구분한다.

## 5. 프로덕션 빌드 확인

```sh
mise exec -- pnpm --filter @yapp-plus/admin start
```

빌드 서버의 `/login`에서 버튼이 활성화되고 개발 전용 직접 mock이나 준비 중 안내가 없는지 확인한다.
MSW flag와 관계없이 프로덕션 worker는 시작하지 않아야 한다.

## 6. 변경량과 비밀 검토

```sh
git diff --stat origin/main...
git diff --check origin/main...
```

650줄부터 분리를 검토하고 800줄 이상이면 독립 PR로 분리한다. diff와 검증 산출물에 실제 비밀 값이
없음을 사람이 확인한다.
