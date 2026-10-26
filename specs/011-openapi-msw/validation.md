# 검증·리뷰 기록

## 1단계 — 요구사항·계획·작업 목록

**일자**: 2026-10-26 | **상태**: 완료, 사용자 “진행해”로 리뷰 승인
**이슈**: [#107](https://github.com/YAPP-admin/yapp-plus-frontend/issues/107)

- git fetch origin 완료. 작업 시작 시 tracked 변경 없음, 현재 브랜치 유지.
- HEAD dc5c957, origin/main 25c1b7e, main의 선행 커밋 27개 확인. 병합하지 않음.
- 관련 열린 이슈 없음 확인 후 사용자가 이슈 생성을 명시적으로 승인함.
- 이슈 #107 생성 완료. 제목·본문·담당자 DongjaJ·OPEN 상태를 재조회로 확인함.
  라벨·milestone은 지정하지 않음. 이슈 체크리스트 변경·commit·push·PR은 수행하지 않음.
- Node 24.20.0·pnpm 12.3.4 확인. node_modules 없음. 설치는 2단계까지 보류.
- 기본 Spec Kit 템플릿 확인. extensions.yml·template override 없음. 헌법은 미작성 템플릿.
- 이번 명세 재조회 두 번은 시간 초과. 이전 48 operation 확인과 현재 재조회 실패를 구분함.
- .context/011-openapi-msw/의 초안을 specs/011-openapi-msw/에 정식 반영함.
- 로컬 .specify/feature.json 포인터를 설정하고 setup-plan.sh·setup-tasks.sh를 실행함.
  스크립트의 BRANCH 필드는 feature 이름으로 해석될 수 있으나 실제 Git 브랜치는 변경하지 않음.
- check-prerequisites.sh --json --require-spec --require-tasks --include-tasks 통과.
- 2~8단계의 설정·의존성·생성물·앱 코드·테스트는 변경하지 않음.
- 문서 9개의 로컬 링크·미해결 placeholder·행 끝 공백 검사 통과.
- 작업 ID T001~T035의 연속성·중복 없음·8단계 리뷰 중단점 확인.
  US1 4개, US2 11개, US3 6개, 공통 준비·검증·인계 14개로 구성됨.
- 이번 변경은 새 specs/011-openapi-msw/ 문서 9개다. 로컬 feature 포인터와 초안은 gitignored 상태다.
- mise exec -- node --run check 실행: oxfmt: command not found로 중단.
  의존성 미설치로 포맷·lint·typecheck·test의 품질 게이트를 통과했다고 판단하지 않음.
- 문서만 작성한 단계이므로 build·브라우저·실제 codegen 검증은 실행하지 않음.

## 2단계 — 의존성과 생성 설정

**일자**: 2026-10-26 | **상태**: 완료, 사용자 리뷰 대기

### 변경

- MSW 2.15.0을 catalog로 고정하고 API 패키지 dependencies, 두 앱 devDependencies에 추가했다.
- 생성 설정에 msw를 추가했다. 일반 index 제외, 첫 명세 서버의 base URL, 예제 비활성,
  미구현 501 정책을 설정하고 기존 SDK validator·transformer 기본값을 유지했다.
- 두 앱의 worker 경로만 포맷·lint 제외 목록에 추가했다. worker 파일은 아직 생성하지 않았다.
- 첫 설치는 미검토 MSW postinstall로 ERR_PNPM_IGNORED_BUILDS가 발생했다.
  배포 스크립트를 읽고 자동 worker 복사임을 확인해 해당 버전만 실행하지 않도록 명시했다.
  설치 보호는 유지했고 동작 변경은 research.md에 기록했다.
- lockfile에 MSW 관련 34개 package version이 추가됐으며 기존 package version은 삭제되지 않았다.
  모바일 importer는 변경 전과 동일하다. Vitest의 MSW optional peer 연결은 설치 도구가 갱신했다.
- 1단계 문서도 설치된 고정 oxfmt로 포맷했다. 요구사항 범위는 변경하지 않았다.

### 검증 결과

| 항목                           | 결과                                                                |
| ------------------------------ | ------------------------------------------------------------------- |
| pnpm install --frozen-lockfile | 통과, resolution 재실행 없이 lockfile 사용                          |
| node --run check               | 포맷·lint·typecheck·기존 테스트 모두 통과                           |
| 테스트                         | admin 215, web 29, ui 6 통과; app-bridge 17은 동일 입력 캐시 재사용 |
| node --run build               | admin·web·Storybook 3개 빌드 통과                                   |
| git diff --check               | 통과                                                                |
| 단계 범위                      | API generated 디렉터리와 두 worker 파일이 생성되지 않았음을 확인    |

빌드 실행 기록은 로컬 `.context/openapi-msw-stage-2-build.log`에 있다.
pnpm peers check는 기존 모바일 react-native-worklets 0.13.0의 peer 범위 경고로 실패한다.
이는 MSW 관련 경고가 아니며 기존 모바일 버전이나 정책을 변경하지 않았다.
모바일 설정·의존성은 변경하지 않아 expo:doctor를 실행하지 않았다.
실제 API codegen과 생성물 계약·런타임 MSW 검증은 아직 수행하지 않았고 3단계 이후 대상이다.

## 다음 단계

2단계 의존성·생성 설정 diff와 검증 결과를 사용자에게 리뷰받는다.
사용자의 명시적 다음 단계 승인 전에는 3단계 API 생성에 착수하지 않는다.
리뷰에서 수정 요청이 오면 2단계 범위에서 수정한다.
