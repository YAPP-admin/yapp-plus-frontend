# 단계별 검증 기록

**작성일**: 2026-11-18 · **상태**: 2단계 구현·검증 완료 · 사용자 리뷰 대기

## 작업 기준

- 실제 브랜치: `DongjaJ/akax9`. 이름 변경·전환·이력 변경 없음.
- 시작 HEAD: `4f96a09b86551a61129baf58187490c09d1c06fc`, fetch 후 origin/main: `ee7235a3`.
- main 대비 14커밋 뒤이며 회원 홈·위치 브리지 관련 diff는 없다. 관리자 세션 작업을 자동 merge하지 않았다.
- 원격에 025-admin-session-api가 있으므로 다음 번호 026을 선택했다.
- 사용자 승인: 1단계 결과 리뷰 후 이슈 생성과 2단계 판정 기반 진행을 확인했다.
- 열린 이슈의 위치·출석 검색에서 같은 목적 없음. #462는 관리자 세션 관리이므로 연결하지 않았다.
- 작업 이슈: [#478](https://github.com/YAPP-admin/yapp-plus-frontend/issues/478). Feature, OPEN, 담당자 DongjaJ로 생성 후 제목·본문·상태·담당자를 확인했다.

## Spec Kit 실행

- spec-template를 resolve-template.sh로 해결하고 해당 필수 구조로 한국어 명세를 작성했다.
- gitignored `.specify/feature.json`에 `specs/026-location-attendance`를 기록했다.
- setup-plan.sh와 setup-tasks.sh를 실행해 템플릿·문서 경로를 확인했다.
- setup-plan의 BRANCH 출력은 feature 이름 fallback이었다. 실제 git 브랜치는 별도 조회한 값으로 문서에 기록했다.
- `.specify/extensions.yml`이 없어 specify·plan·tasks의 전후 hook 실행 대상이 없다.
- Spec Kit plan의 조사 절차에 따라 읽기 전용 보조 에이전트로 수명·브리지·완료 캐시 경계를 교차 검토했다.

## 1단계 당시 검증

- 신규 문서 10개, 내부 링크·연속 작업 ID·필수 경로·미치환 템플릿 검증 통과. 작업 22개 중 문서 3개 완료, 19개 미완료다.
- 명세 품질 체크리스트 통과. US1·US2·US3 각각 4개 작업과 공통 작업 10개로 구분했다.
- Spec Kit check-prerequisites --require-tasks --include-tasks 통과. 설계 문서와 작업 목록을 정상 인식한다.
- `mise exec -- node --run check` 통과: format:check는 새 실행, lint 7개·typecheck 7개·test 5개는 전부 Turbo 캐시 재사용이다.
- 문서 oxfmt 실행 때 pnpm이 기존 lockfile의 의존성을 로컬 node_modules에 연결했다. 패키지 선언·lockfile 변경과 새 라이브러리 설치 요청은 없다.
- 앱 build·expo:doctor·브라우저·실기기는 문서만 변경하여 미실행. 위치 기능 회귀 테스트도 아직 작성·실행하지 않았다.
- 실제 PR base는 origin/main, merge-base는 시작 HEAD다. 기존 tracked diff는 없으며 신규 문서 전체 줄 수를 추가량으로 합산한다.
- 현재 문서 추가 532줄·삭제 0줄·합계 532줄로 650줄 미만이며 이 단계의 분리는 불필요하다. 후속 제품 코드와 합칠 때 누적 크기를 다시 계산한다.
- 앱 재실행 완료 복원은 기존 계약에서 제공하지 않으며 이번 작업에 새 조회 필드를 추가하지 않았다.

## 1단계 리뷰와 다음 단계

- 요구사항과 계획을 리뷰받았고 이슈 #478 생성과 2단계 진행을 승인받았다.
- 2단계에서는 geolib 고정과 순수 판정 함수·인접 테스트까지만 구현한다.
- 문서만의 검증을 제품 기능 검증으로 보고하지 않는다. Android 구현과 실제 세션 장소 검증은 후속이다.

## 2단계 판정 기반 검증

- `geolib@4.0.2`를 catalog와 웹 의존성·lockfile에 고정했고 공급망 정책 검사를 통과했다.
- 구현 전 모듈 부재 실패를 확인한 뒤 판정 테스트 27개를 새로 실행해 통과했다. precise·accuracy 50m·distance 100m 경계, 0 좌표, 잘못된 좌표와 Vincenty 수렴 실패를 포함한다.
- `node --run check`에서 format, lint 7개, typecheck 7개는 전부 새 실행으로 통과했다. test는 새 실행 중 기존 `stackflow/src/stack.test.tsx`의 출결 보고 1건이 `결석` radio를 찾지 못해 실패했고 단독 재실행에서도 동일했다.
- `node --run build`는 web·admin·storybook 3개가 모두 새 실행으로 통과했다. 기존 500kB chunk 경고는 유지됐다.
- 위치 원문은 함수 입력 지역 값으로만 사용하고 결과에는 허용/정책 차단/판정 불가와 실패 사유만 남긴다. 제출 훅·HTTP 요청·캐시·UI에는 아직 연결하지 않았다.
- 판정 함수는 입력 검증·위치 품질 정책·거리 계산·최종 판정을 분리했다. 정책 위반은 BLOCKED, 입력·계산 문제는 UNAVAILABLE로 반환하며 예상 가능한 실패에는 예외를 사용하지 않는다.
- 리뷰 반영 뒤 위치 판정 테스트 27개와 웹 lint·typecheck를 새로 실행해 통과했다. `node --run check` 재실행은 format과 웹 lint·typecheck·test를 새로 실행하고 나머지 lint·typecheck 6개와 test 4개는 캐시를 재사용했으며, 위와 같은 기존 Stackflow 테스트 1건만 실패했다.
- 브라우저·iOS 실기기·현장 측정·expo:doctor는 이 단계가 순수 판정 기반이고 모바일 설정 변경이 없어 미실행했다.
- origin/main merge-base 기준 tracked 추가 561줄과 신규 판정 파일 285줄로 추가 846줄·삭제 0줄이다. 800줄 제한을 넘어 1단계 문서와 2단계 코드·검증을 독립 PR로 분리해야 하며 후속 구현을 같은 변경에 누적하지 않는다.
