# 외부 Vercel 캐시·권한 확인 (I10 · #139)

## 저장소에서 확인한 범위

2026-10-29, 기준 `7898ee6`에서 다음을 확인했다.

- [배포 액션](../../.github/actions/vercel-deploy/action.yml)은 Vercel CLI 59.13.1로 프로젝트 설정을
  pull하고 build한 뒤 prebuilt를 업로드한다. 실제 Build Command는 외부 프로젝트 설정의 영향을 받는다.
- [Turbo outputs](../../turbo.json)는 `.next`, `.output`, `dist`, `storybook-static`이며
  `.vercel/output`은 명시하지 않는다. 따라서 외부 Build Command가 Turbo로 실행되는지,
  캐시 hit 이후 Vercel 어댑터가 최종 산출물을 다시 만드는지 확인하지 않고 배포 실패를 단정할 수 없다.
- CI와 내부 PR Preview는 `VERCEL_TOKEN`을 Turbo/배포에 사용한다. Preview는 같은 저장소 PR 및
  Dependabot 제외 조건을 검사한다. 현재의 1인 운영 신뢰 정책은 승인된 계약이며 이 조사에서 바꾸지 않는다.

## 외부 조회 결과와 제한

로컬 Vercel CLI의 로그인은 확인되지만 `yapp-plus` scope 조회가 `The specified scope does not exist`로
실패했다. 저장소와 같은 59.13.1 CLI로 project inspect도 시도했다. 실제 팀 프로젝트 설정·권한을
조회한 증거가 없으므로 아래 항목은 미확인이다. 토큰·환경 변수 원문을 문서나 로그에 출력하지 않았다.

## 읽기 및 격리된 검증 절차

팀 프로젝트를 조회할 수 있는 환경에서 web/admin 각각 다음 증거를 기록한다.

1. Project Settings의 Root Directory·Framework·Build Command·Install Command·Node 버전.
   값이 저장소 명령과 다르면 설정 소유자와 변경 의도를 확인한다.
2. 검증된 동일 SHA의 Preview 빌드에서 Turbo task별 cache miss/hit 로그를 구분한다.
   실행 환경·환경 변수 이름만 기록하고 비밀 값은 포함하지 않는다.
3. 별도 임시 checkout에서 산출물 없이 cache hit를 재현한 뒤 `.vercel/output/config.json`,
   정적 파일·함수 엔트리의 존재와 Preview 응답을 확인한다. 실제 사용 중인 산출물을 지우지 않는다.
4. miss/hit의 결과가 같지 않으면 Vercel 출력 생성 단계가 캐시 밖에서 실행되는지 먼저 확인한다.
   단순히 outputs에 `.vercel/output`을 추가하기 전에 환경별 재사용 안전성을 검토한다.
5. Preview에서만 검증하고 Production 배포를 시험 목적으로 실행하지 않는다. 변경이 필요하면
   Spec Kit 계획에 이전 프로젝트 설정·원본 커밋으로 복구할 절차를 포함한다.

## 팀 확대 전에 재검토할 권한

내부 PR 코드가 실행되는 곳에 어떤 토큰이 제공되는지 목록을 만들고, preview 배포·Turbo cache·
production 승격 권한을 분리할 수 있는 실제 Vercel 계약을 확인한다. 전용 자격 증명/OIDC의
지원 범위·만료·폐기·환경 보호 규칙을 검토하되 지원 여부나 정책 도입을 이 문서에서 확정하지 않는다.
외부 fork에 Secret을 제공하는 방식으로 검증 경로를 넓히지 않는다.

완료 증거는 두 프로젝트 설정, cache hit/miss별 산출물 복원, Preview 결과, 현재 토큰 권한 검토다.
외부 접근·실행 증거가 없는 현재 PR은 조사 기록이며 #139를 자동 종료하지 않는다.
