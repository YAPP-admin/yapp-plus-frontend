# 단계별 검증 기록

**작성일**: 2026-11-19 · **상태**: 5단계 통합 검증 진행 중 · 브라우저·iOS 시뮬레이터 통과, 실기기 검증 대기

## 작업 기준

- 단계별 검토를 위해 1단계 `DongjaJ/akax9-stage1`, 2단계 `DongjaJ/akax9`, 3단계 `DongjaJ/akax9-stage3`으로 분리했다. 현재 브랜치는 3단계다.
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

## 3단계 제출·요청 수명 검증

- 구현 전 출석 코드 테스트 4건의 실패로 위치 요청·차단·재시도 연결이 없음을 확인한 뒤 구현했다.
- 유효한 제출에서만 위치를 요청하고 정확한 위치·오차·100m 판정을 통과한 경우 기존 verify mutation을 호출한다. 위치 원문은 지역 변수에만 두고 HTTP body·query cache·mutation context에 넣지 않는다.
- 위치 확인과 서버 제출을 순차 mutation으로 분리하고 두 `isPending`을 조합했다. 위치 mutation은 승인된 제출 입력을 반환하며 계정 변경은 기존 account boundary의 화면 수명으로 후속 전송을 중단한다. 최신 세션 Query 재검사는 추가하지 않았다.
- 위치 판정·출석 코드·계정 경계 3개 파일의 68개 테스트를 새로 실행해 통과했다. 응답 스키마 오류와 `verified: false`는 mutation 실패로 처리하며, 최신 세션 Query 재검사 4개를 제거하고 계정 변경 중단은 account boundary 통합 테스트로 유지했다.
- 웹 typecheck와 변경 파일 oxlint를 새로 실행해 통과했다.
- `node --run check`에서 format과 웹 lint·typecheck·test는 새로 실행했고 나머지 lint·typecheck 6개와 test 4개는 Turbo 캐시를 재사용했다. web 테스트는 550개 중 549개가 통과했고 기존 Stackflow 출결 보고 1개만 `결석` radio를 찾지 못해 이전과 동일하게 실패했다.
- `node --run build`는 web을 새로 실행하고 admin·storybook은 Turbo 캐시를 재사용해 모두 통과했다. web의 기존 500kB chunk 경고는 유지됐다.
- Modern Web Guidance의 forms 지침에 따라 유효한 제출 직후 입력·확인을 비활성화해 중복 전송을 막고, Zod 네 자리 코드 검증과 서버 성공만 기존 완료 표시로 연결했다.
- 3단계는 2단계 commit `114c1d64`를 base로 별도 브랜치에 구현했다. 추가 388줄·삭제 82줄·합계 470줄로 650줄 분리 검토 기준과 800줄 상한 아래다.

## 4단계 오류 복구·접근성 검증

- 3단계 commit `4b5a0361` 뒤 실패 테스트 9건으로 위치 오류와 코드 오류의 시맨틱 구분, 사유별 안내·복구 버튼, 설정 실패와 위치/출석 진행 안내가 없음을 확인했다.
- 권한 재요청 가능 여부·정밀 권한·위치 서비스·시간 초과·정확도·거리·세션 좌표를 화면 행동으로 변환하고, 설정 열기는 별도 mutation으로 연결했다. 설정 성공이나 앱 복귀만으로 위치 확인·출석 제출을 실행하지 않는다.
- 위치 오류는 코드 입력의 `aria-invalid`·`aria-describedby`와 분리했다. 동적 오류는 `role="alert"`, 위치 확인·출석 처리·설정 열기 진행은 `output`으로 알리고 버튼의 보이는 문구와 접근성 이름을 일치시켰다.
- 관련 위치 판정·출석 코드·계정 경계 3개 파일의 76개 테스트, 웹 typecheck와 lint를 새로 실행해 통과했다.
- 작은 화면은 기존 스크롤 가능한 시트에 overscroll·scroll padding을 보강하고 52px 버튼·54px 입력을 유지했다. 실제 WebView 키보드·VoiceOver·터치 확인은 5단계 실기기 검증으로 남긴다.
- `node --run check`에서 format과 웹 lint·typecheck·test는 새로 실행했고 나머지 lint·typecheck 6개와 test 4개는 Turbo 캐시를 재사용했다. web 테스트는 558개 중 557개가 통과했고 기존 Stackflow 출결 보고 1개만 `결석` radio를 찾지 못해 이전과 동일하게 실패했다.
- `node --run build`는 web을 새로 실행하고 admin·storybook은 Turbo 캐시를 재사용해 모두 통과했다. web의 기존 500kB chunk 경고는 유지됐다.
- mock 개발 서버는 정상 실행됐지만 브라우저 접근 호스트가 연결되지 않아 화면 캡처는 만들지 못했다. 모바일 WebView·키보드·VoiceOver·터치는 자동 테스트 결과와 구분해 미검증으로 유지한다.
- 리뷰에서 TanStack Form `form.Field`와 Zod Standard Schema 직접 검증으로 전환하고 불필요한 `focusedIndex` state를 제거했다. 제출 비활성화는 mutation pending만 사용하며, 서버 코드 오류는 Field의 제출 오류로 기록하고 위치·세션·네트워크 오류만 복구 가능한 흐름 오류로 분리했다. 관련 테스트 76개와 web typecheck·lint를 새로 실행해 통과했다.
- 4단계는 3단계 commit `4b5a0361`을 base로 추가 615줄·삭제 221줄·합계 836줄이다. 800줄 상한을 넘으므로 PR 준비 전에 독립적으로 검토 가능한 변경으로 반드시 분리해야 한다.

## 5단계 통합·출시 준비 검증

- 4단계 리뷰를 마치고 `13e322c9`(`feat(attendance): 위치 출석 오류 복구 추가`)로 커밋한 뒤 5단계 진행 승인을 받았다. 원격 push·PR·배포는 실행하지 않았다.
- 4단계의 `node --run check`는 format과 web lint·typecheck·test를 새로 실행하고 나머지 lint·typecheck 6개와 test 4개는 Turbo 캐시를 재사용했다. 당시 web 558개 중 Stackflow 출결 보고 1개가 고정된 세션 날짜 경과로 `결석` radio를 찾지 못해 실패했다. 5단계에서 테스트 세션을 실행 시점 다음 날의 유효한 주간 범위로 구성해 날짜 의존성을 제거했다. 해당 회귀 테스트 1개와 Stackflow 파일 30개가 새로 통과했고, 루트 `node --run check`도 format·web lint·typecheck·test를 새로 실행해 web 558/558을 포함해 모두 통과했다. 나머지 lint·typecheck 6개와 test 4개는 Turbo 캐시를 재사용했다.
- 4단계의 `node --run build`는 web을 새로 실행하고 admin·storybook은 Turbo 캐시를 재사용해 모두 통과했다. 기존 web 500kB chunk 경고는 유지됐다. 5단계에서는 제품 코드를 변경하지 않아 build를 다시 실행하지 않았다.
- 일반 브라우저 미지원 시 코드 전송 0회와 위치 오류 안내는 자동 테스트로 통과했다. 이어서 390×844 Chrome에서 현재 세션이 있는 합성 mock을 일시 적용해 출석 코드 네 자리를 입력하고 제출했다. 브라우저 위치 권한 팝업이나 위치 API 우회 없이 `위치 확인이 가능한 YAPP+ 앱에서 다시 시도해 주세요.`가 표시됐고, 제출 구간의 네트워크 요청과 POST는 모두 0회였다. 캡처에는 위치 원문을 포함하지 않았으며 임시 mock 변경은 검증 직후 원복했다.
- 브라우저 검증 기록 뒤 `node --run check`를 실행해 format을 새로 확인했고 lint 7개·typecheck 7개·test 5개는 Turbo 캐시를 재사용해 모두 통과했다.
- 합성 위치 원문은 `locationCheckMutation`의 지역 값으로 판정한 뒤 폐기하며, 성공 결과는 기존 `{ sessionId, code }` 본문만 반환한다. HTTP body·Query cache·mutation context·storage·로그에 현재 좌표를 기록하는 코드는 없음을 확인했다. 실제 브리지 호출의 네트워크·기기 로그 확인은 실기기 검증으로 남긴다.
- iOS는 Expo Location의 `ios.accuracy`에서 `full`을 `precise`, `reduced`를 `approximate`로 변환하고 `requestCurrentLocation`·`openAppSettings`를 앱 브리지에 등록한다. native 권한 변환·위치 취득·설정 열기 31개 테스트를 새로 실행해 모두 통과했다. 배포된 지원 앱 버전, 실제 기기·장소·권한·설정 복귀·키보드·터치·VoiceOver는 아직 확인하지 않았다.
- iOS 17.5 시뮬레이터의 기존 YAPP+ 앱에 포함된 Firebase 설정을 로컬 생성 프로젝트에만 재사용해 개발 빌드를 실행했다. 합성 위치를 주입한 뒤 최초 정확한 위치 권한 안내, `위치 수신 성공 · 정밀 권한: 정확한 위치`, 권한 철회 후 `권한이 거부되었습니다` 안내를 확인했다. 좌표는 개발 화면과 검증 기록에 표시하거나 저장하지 않았다. 시뮬레이터 검증은 권한·Expo Location·WebView 브리지 연결 근거이며 실제 GPS 오차, 실내 환경, 장소 100m 안팎과 전체 출석 제출은 실기기 검증으로 남긴다.
- 사용자 결정에 따라 이번 출시 범위는 iOS로 제한한다. Android 공통 허용·차단 사례는 범위 분리 근거로 검토했으며, Expo Location의 `android.accuracy`를 공통 `precision`으로 변환하는 구현·팀 전달·실기기 검증은 이번 완료 조건에서 제외했다. Android 동작을 지원 또는 검증 완료로 보고하지 않는다.
- 2026-11-19 fetch한 실제 `origin/main`은 `4344a9e2`, merge-base는 `4f96a09b`다. 브라우저·시뮬레이터 검증 기록까지 반영한 전체 feature diff는 추가 1,769줄·삭제 199줄·합계 1,968줄이고, 4단계 commit만도 836줄이므로 단일 PR로 만들 수 없다. 기존 단계 경계와 4단계 내부 책임을 기준으로 800줄 미만의 독립 PR로 분리해야 한다.
- 지원 메서드는 현재 mobile 소스와 app-bridge 공개 계약에 존재하지만 실제 배포 앱 포함 여부는 실기기·지원 버전 확인 전까지 확정하지 않는다. 웹 장애 시 직전 검증된 3단계 commit `4b5a0361`로 웹 변경을 복구할 수 있으며, 위치 조건을 완화하거나 서버 API 계약을 바꾸는 복구는 하지 않는다. 배포는 실행하지 않았다.

### 출시 준비 전 남은 확인

- 일반 브라우저에서 위치 팝업·우회 제출이 없고 안내가 정상 노출되는지 직접 확인한다.
- 지원 iOS 앱의 실제 버전과 위치 메서드를 확인하고, 실제 장소 안팎·권한·설정 복귀·작은 화면·VoiceOver 시나리오를 수행한다. 좌표 원문은 기록하지 않는다.
- iOS 실기기 검증은 코드리뷰·PR 준비 뒤로 이연할 수 있지만 배포 전에 완료하고 결과를 이 문서에 기록한다.
- 단계별 PR 분리안을 확정하고 각 PR의 실제 base 대비 변경량을 다시 계산한다.
