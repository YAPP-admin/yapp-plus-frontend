# 구현 계획: 관리자 로그인 API와 세션 연동

**브랜치**: `DongjaJ/login-api` | **작성일**: 2026-10-31

**명세**: [spec.md](spec.md) | **이슈**: [#241](https://github.com/YAPP-admin/yapp-plus-frontend/issues/241)

## 요약

기존 관리자 로그인 폼의 개발 전용 판정을 생성된 Staff 로그인 SDK로 교체한다. 성공 응답은 생성
Zod 스키마로 검증한 뒤 access token만 versioned localStorage key에 저장한다. 생성 client의 auth
callback은 요청 시점에 저장소를 읽고 `staffBearerAuth`에만 token을 제공한다. 화면을 떠난 뒤 도착한
성공은 세션 저장과 이전 화면의 탐색을 분리해 #157을 방지한다.

## 기술 맥락

**언어·버전**: Node.js 24.20.0, TypeScript 6, React 19

**주요 의존성**: TanStack Start·Router·Query·Form, 생성 Hey API Ky client, Zod 4, MSW 2

**저장소**: 브라우저 `localStorage`의 `yapp-plus-admin.access-token.v1`; 서버·데이터베이스 변경 없음

**테스트**: Vitest 5, Testing Library, happy-dom, MSW 기능 테스트와 브라우저 수동 검증

**대상 플랫폼**: `apps/admin`의 SSR 가능한 웹 앱과 현대 브라우저

**성능 목표**: 기존 로그인 제출 외 추가 네트워크 요청 없음; token은 Staff 요청 직전에 동기 조회

**제약**: refresh token·만료 정보 없음, 실제 비밀 값 기록 금지, 생성 코드 직접 수정 금지,
단계별 사용자 승인 전 다음 단계 금지

**범위**: 로그인·token 저장·Staff SDK 인증·늦은 성공 격리. 접근 가드·로그아웃 UI·전역 401·
Query 캐시 정리는 제외

## 헌법 점검

### 설계 전

- **제품 맥락과 최소 범위**: 운영진의 실제 로그인과 후속 관리자 요청만 연결하고 회원 인증·권한·
  접근 가드는 추가하지 않는다.
- **앱과 공용 계약 경계**: `apps/admin`만 수정하고 `@yapp-plus/api/generated` 공개 진입점을 사용한다.
  API 명세와 생성 파일은 변경하지 않는다.
- **재현 가능한 도구**: 고정된 Node.js·pnpm과 기존 의존성만 사용하며 새 패키지를 추가하지 않는다.
- **변경에 가까운 검증**: 저장소·API 어댑터·폼 수명 경계별 회귀 테스트 뒤 `node --run check`와
  `node --run build`를 실행한다.
- **검토와 복구**: 각 단계 결과를 보고한 뒤 승인받는다. 비밀 값을 기록하지 않고, 롤백 시 코드와
  versioned 저장 key를 함께 고려한다.

### 설계 후 재점검

- singleton client의 auth callback은 서버에서 token을 반환하지 않고 Staff 인증 종류만 허용하므로
  요청 간 관리자 token 공유와 회원 인증 유출을 막는다.
- API 응답을 런타임 검증하고 저장 성공 뒤에만 로그인 성공을 반환하므로 신뢰 경계를 지킨다.
- 기존 token은 새 로그인이 완전히 성공한 뒤 교체해 서비스 장애가 기존 세션을 파괴하지 않는다.
- localStorage의 XSS 노출 기간은 사용자가 브라우저 재시작 후 유지 요구와 함께 선택한 제약이며,
  token·자격 증명 비기록과 Staff 전용 전달로 범위를 제한한다.
- 위반이 필요한 헌법 항목은 없다.

## 프로젝트 구조

```text
apps/admin/src/
├── features/login/
│   ├── admin-session.ts
│   ├── admin-session.test.ts
│   ├── login.ts
│   ├── login.test.ts
│   ├── login-form.tsx
│   └── login-form.test.tsx
├── pages/login/ui/login-page.tsx
├── providers.tsx
└── routes/login.tsx

specs/014-admin-login-api/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/login-session.md
├── quickstart.md
├── tasks.md
├── validation.md
└── checklists/requirements.md
```

**구조 결정**: 인증 구현은 현재 유일한 소비자인 admin 로그인 feature 안에 둔다. 공용 패키지나
추상화를 추가하지 않고, 앱 provider가 feature 공개 진입점의 client 설정만 호출한다.

## 기술 설계

### token 저장과 client 인증

- `readAdminAccessToken()`은 브라우저에서만 non-empty 문자열을 반환하고 접근 예외는 `undefined`로
  처리한다.
- `saveAdminAccessToken(token)`은 non-empty 문자열의 저장 성공 여부를 boolean으로 반환한다.
- `configureAdminApiClient()`는 client auth callback을 설정하고 `auth.key === 'staffBearerAuth'`일
  때만 저장 값을 읽는다. 호출은 여러 번 실행되어도 같은 설정으로 수렴한다.
- provider 모듈 초기화에서 client 설정을 적용한다. 테스트의 base URL 설정은 `setConfig` merge로
  유지한다.

### 로그인 어댑터

- 폼의 trim된 `username`을 `loginId`로 바꾸고 password는 원문을 전달한다.
- 생성 SDK는 HTTP 응답을 판정할 수 있도록 throw하지 않는 기본 모드로 호출한다.
- 200은 `zStaffLoginResponse`로 검증하고 token 저장까지 성공해야 `success`다.
- 401만 `invalid-credentials`, 그 밖의 HTTP·네트워크·검증·저장 실패는 `unavailable`이다.
- Staff 요약, 아이디와 비밀번호는 저장하지 않는다. 기존 token은 성공 시에만 원자적으로 교체한다.

### 폼 수명과 환경

- `available` prop과 개발 전용 직접 mock을 제거해 모든 환경이 같은 로그인 함수를 사용한다.
- 개발 MSW를 켜면 생성 SDK 요청을 기존 handler가 가로채고, 끄면 실서버로 보낸다.
- 화면 이동 callback은 mutation hook 전역이 아니라 제출별 observer에 둔다. unmount 뒤에는 token
  저장이 끝나도 이전 화면의 이동 callback은 실행되지 않는다.

## 단계와 리뷰 경계

1. 이슈·명세·계획·계약·작업 목록을 작성하고 리뷰받는다.
2. token 저장소·Staff auth 설정과 단위 테스트만 구현하고 리뷰받는다.
3. 실제 로그인 어댑터·MSW 기능 테스트를 구현하고 리뷰받는다.
4. 폼·라우트 활성화와 #157 회귀 테스트를 구현하고 리뷰받는다.
5. 전체 check·build·브라우저 검증과 validation 기록을 제출한다.

각 단계 승인은 다음 단계 구현만 허용한다. commit·push·PR·issue 종료는 별도 승인을 받는다.

## 검증과 복구

- [quickstart.md](quickstart.md)의 집중 테스트, 전체 품질 게이트와 브라우저 시나리오를 단계에 맞춰
  실행한다. Turbo 캐시와 새 실행을 구분한다.
- 실제 base 대비 추가·삭제가 650줄이면 분리를 검토하고 800줄 이상이면 독립 PR로 나눈다.
- 로그·문서·스크린샷에는 실제 자격 증명, 발급 token과 Authorization header를 남기지 않는다.
- 복구는 앱 변경을 되돌리고 필요 시 `yapp-plus-admin.access-token.v1`을 제거한다. 이전 앱은 이
  key를 읽지 않으며 서버 데이터 마이그레이션은 없다.
- 만료·폐기된 token의 자동 갱신과 401 이동은 후속 범위이므로 남은 위험으로 기록한다.
