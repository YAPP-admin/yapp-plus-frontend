# 1단계 검증 기록

작성일: 2026-11-20 · 상태: 2단계 구현 완료, 사용자 리뷰 대기

## 수행 범위

- 승인된 [이슈 #501](https://github.com/YAPP-admin/yapp-plus-frontend/issues/501)을 생성하고 제목·본문·담당자 DongjaJ·OPEN 상태를 조회해 확인했다.
- 최신 `origin/main`을 fetch하고 시작 시 현재 브랜치 `DongjaJ/wojt9`와 동일한 `cc90b35e`임을 확인했다.
- Spec Kit 계획·작업 템플릿을 적용하고 조사·데이터·계약·검증·요구사항 체크리스트를 작성했다.
- `.specify/feature.json`은 gitignored 로컬 기능 포인터로 설정했다. 브랜치 이름은 바꾸지 않았다.
- `.specify/extensions.yml`이 없어 실행할 전후 확장 훅은 없다.
- 제품 코드·생성 API·의존성·배포 설정은 변경하지 않았다. 커밋·푸시·PR은 수행하지 않았다.

## 검증 결과

- 신규 문서 9개와 기존 명세 연결 2개: 로컬 Markdown 링크·참조 파일·작업 ID·요구사항 대응 점검.
- 작업 37개: US1 8개, US2 5개, US3 12개, 준비·공통·통합 12개. 문서 작업 T001~T006만 완료다.
- `check-prerequisites.sh --json --require-spec --require-tasks --include-tasks`: 통과.
- 고정 `oxfmt@0.66.0 --check`로 변경 문서 11개 형식 검사 통과. `git diff --check origin/main`도 통과했다. 프로젝트 의존성은 변경하지 않았다.
- `node --run check`: 환경의 mise 신뢰 설정에서 첫 실행 중단. 명령 단위 `MISE_TRUSTED_CONFIG_PATHS`를 적용한 재실행은 `oxfmt: command not found`로 실패했다. `node_modules`가 없어 기본 게이트를 완료하지 못했다.
- lint·typecheck·test는 위 선행 실패로 미실행이다. Turbo 검증·캐시 재사용은 모두 없다.
- build·expo:doctor·브라우저/실기기 검증은 문서만 변경한 이번 단계에서 실행하지 않았다. 제품 구현 검증 결과로 해석하지 않는다.
- 실제 base 대비 신규 문서까지 포함해 +543/-1, 총 544줄이다. 650줄 분리 검토 기준 미만으로 이번 문서 단계는 분리하지 않았다.

## 2단계 구현·검증

- `current-week-attendance.ts`에서 장소 `null`만 팀으로 판별하고, `type` 수신 시 제거할 임시 사유를 주석으로 남겼다. 빈 문자열은 정규 세션이다.
- 홈은 `CHECKED_IN`·`PENDING_APPROVAL`을 서버 문구 그대로 표시한다. 팀 `AVAILABLE`은 “인증 사진 업로드하기” 버튼과 “팀 출석 기능을 준비 중이에요” 안내를 표시하고 진입을 막는다.
- 코드 출석 성공은 기존 invalidate로 갱신한다. 팀 `PENDING_APPROVAL`과 주 경계 통과만 홈 탭 복귀와 window/app focus에서 캐시 신선도와 무관하게 재조회한다. 그 외 상태는 기존 stale 정책을 유지하며 상시 폴링은 추가하지 않았다.
- 코드 출석은 현재 서버 상태가 `AVAILABLE`일 때만 시작한다. 성공 즉시 기존 완료 콜백을 유지하고, 이후 홈은 서버가 반환한 `CHECKED_IN`을 표시한다. 완료 화면의 직접 진입 방어와 중복 전송 방지는 유지한다.
- MSW는 코드 성공 후 current-week를 `CHECKED_IN`으로 반환한다. `NOT_ELIGIBLE` 등 기존 상태를 클라이언트가 체크인으로 바꾸지 않는다.
- 관련 순수 정책·홈·코드 출석 테스트를 보강했다. 전체 웹 테스트는 71개 파일·590개 사례가 통과했다.
- `node --run check`: 통과. format은 새 실행, lint/typecheck/test는 web 작업이 새 실행이고 나머지 패키지는 Turbo 캐시 재사용이 포함됐다.
- `node --run build`: 통과. web build는 새 실행, admin·storybook build는 Turbo 캐시 재사용이다. 기존 500kB 초과 chunk 경고만 출력됐으며 이번 변경으로 새로 발생한 실패는 없다.
- 실제 iOS/Android WebView의 포그라운드 복귀, 터치·VoiceOver/TalkBack은 이 환경에서 실행하지 못했다. 팀 사진 운영 연결은 회원용 조회 API 계약이 없어 시작하지 않았다.

## 리뷰와 다음 단계

2단계에서 검토할 것은 서버 상태 문구, 팀 준비 중 안내, 정규 완료→홈 재조회 흐름이다.
3단계 회원용 조회 계약과 2단계 실제 WebView 복귀 검증은 미완료이며 각 단계의 진입·완료 조건으로 남긴다.
사용자 리뷰와 3단계 진행 확인 전에는 팀 사진 운영 연결을 시작하지 않는다.
