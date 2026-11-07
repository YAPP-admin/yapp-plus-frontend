# 0단계 검증 기록

**작성일**: 2026-11-07 | **상태**: 0단계 문서 검증 완료; 사용자 리뷰 및 1단계 진행 승인
**기준**: origin/main `aa0f46acf9c0dc77a7f5c52aa848cd891b0eda0d`
**이슈**: [#367](https://github.com/YAPP-admin/yapp-plus-frontend/issues/367)

## 새로 확인한 항목

- 사용자 승인으로 #367을 생성하고 제목·본문·담당자·열린 상태를 다시 조회했다.
- git fetch 후 기준 main과 작업 브랜치의 초기 동일성·깨끗한 작업 트리를 확인했다. 브랜치 변경 없음.
- Spec Kit 활성 템플릿을 해석하고 setup-plan/setup-tasks로 기능 경로와 입력 문서를 확인했다.
- `.specify/feature.json`에 현재 기능을 등록했다. 기존 ignore 정책에 따라 로컬 상태이며 PR에 포함하지 않는다.
- 전후 확장 hook 설정 파일이 없어 실행할 hook이 없다.
- mise에서 Node `24.20.0`, pnpm `12.3.4`를 실제 확인했다.
- frozen lockfile·ignore-scripts로 의존성을 설치했다. 기존 store 1,099개 패키지를 재사용했고 lockfile을 바꾸지 않았다.
- 문서 검증에 불필요한 설치 lifecycle과 Git hook 재설정을 피했다. 이는 Git commit 검증 우회가 아니며 commit은 실행하지 않았다.
- 고정 Expo/fingerprint/EAS CLI 패키지 소스로 공개 API·누락 가능한 입력·local remote build number 경로를 확인했다.
- EAS CLI 27.4.1의 읽기 전용 조회로 testflight 채널 → testflight branch 연결을 확인했다.
- 조회한 branch ID는 `01a1ab35-08f9-7945-9279-233002e90016`이다. 적용 시 다시 조회하고 설정과 대조한다.
- pnpm dlx의 최초 실행은 빌드 스크립트 승인 요구로 실패했다. 설정을 완화하지 않고 버전 확인한 캐시의 CLI JS 진입점을 실행해 조회했다.
- 로컬 Expo 인증의 조회 성공은 GitHub CI token·빌드·제출 권한 준비를 입증하지 않는다.

## 외부 준비 조건

| 항목                            | 확인 상태                              | 적용 전 조건                                            |
| ------------------------------- | -------------------------------------- | ------------------------------------------------------- |
| 저장소 EXPO_TOKEN               | repository-level Secret 목록에 없음    | 배포 전 사용할 최소 권한 token 준비                     |
| 조직 Secret 상속                | 조회 권한 부족(403)                    | 조직 관리자가 가용 여부 확인; 권한 확대는 요청하지 않음 |
| 모바일 Environment              | 현재 목록에 mobile-testflight 없음     | main 전용 Environment 준비                              |
| testflight 채널 연결            | 고정 CLI로 testflight branch 연결 확인 | 적용 시 branch ID 설정과 실제 연결 재검사               |
| Apple 인증서·프로비저닝·제출 키 | 미조회                                 | 비밀을 출력하지 않고 준비 여부·서명/제출 검증           |
| remote build number             | 미조회                                 | 최초 기준 빌드 전에 초기화 여부 확인                    |
| macOS runner·서명·IPA           | 미실행                                 | 2단계 실제 빌드 성공                                    |
| 두 OS 호환성 키                 | 미실행                                 | 1단계 동일 입력의 source/hash·digest·최종 키 대조       |
| 실제 TestFlight·OTA·롤백        | 미실행                                 | 3~4단계 실기기 검증                                     |

## 문서·품질 검사

- Spec Kit prerequisites: spec·plan·tasks 및 research/data-model/contracts/quickstart 경로 확인 통과.
- 문서 9개의 상대 링크·미완성 placeholder·공백, FR 17개·SC 5개·작업 37개의 ID 검사를 새로 실행해 통과했다.
- 명세·상태·계약·작업 교차 검토에서 초기화 기록 소실, 미실행 종결, rollback 후 소스, PR 비밀 격리, 두 OS 정규화 경계를 보완했다.
- `mise exec -- node --run check`: 통과. format 검사와 웹 lint·typecheck·테스트(40파일/228개)를 새로 실행했다.
- Turbo 재사용: lint 6/7, typecheck 6/7, test 4/5로 총 16/19 작업. 캐시 로그의 테스트는 새 실행으로 계산하지 않는다.
- 마지막 문서 보완 후 format 검사를 새로 실행해 통과했다. 로그는 gitignored `.context/mobile-phase0-check.log`에 보관한다.
- 앱·workflow·의존성 설정 변경이 없어 build/expo:doctor는 미실행이다. 실제 iOS 빌드·서명·제출·기기·OTA 결과는 검증하지 않았다.

## 축소안 요구사항과 작업 연결

| 요구사항      | 주요 작업                          |
| ------------- | ---------------------------------- |
| FR-001~FR-005 | R003, R005~R011                    |
| FR-006~FR-007 | R010~R012                          |
| FR-008~FR-009 | R013~R015                          |
| FR-010~FR-012 | R006~R010, R014, R016              |
| FR-013~FR-015 | R003, R008~~R010, R013, R016~~R018 |
| FR-016        | R003, R017~R018                    |
| FR-017        | R004, R009, R012, R015, R018       |

SC-001은 R005~~R009, SC-002는 R010~~R012, SC-003~~SC-005는 R013~~R018로 검증한다.
미확정 저장·재개 계약과 미구현 작업을 완료로 계산하지 않는다.

## 단계 경계

기준 origin/main 대비 문서 9개 추가, +612/-0줄(미추적 파일 포함); 단일 명세 리뷰 목적이며 분리 기준 650줄 미만이다.

이 문서는 0단계 설계 결과다. 1~4단계 코드·배포·활성화를 수행하지 않았으며 사용자 리뷰 후 별도 진행한다.
외부 준비가 안 되어도 보고 전용 구현은 검토할 수 있지만 실제 build/update/submit 성공으로 보고하지 않는다.

2026-11-07 사용자가 “커밋하고 다음 진행해”로 0단계 커밋과 1단계 진행을 승인했다.

## 폐기한 1단계 초안의 검증 이력

- 0단계 커밋: `26918286`; format·commitlint 훅 통과. push·PR 생성은 하지 않았다.
- T008 중 운영 모드·기준 branch/기록 ID 검증을 구현했다. 미설정은 report-only/기준 없음이며 잘못된 값은 출력하지 않고 거부한다.
- T010: Vitest 기본 제외 목록을 보존하며 Node 테스트 경로를 제외하고 두 실행을 기존 test에 연결했다.
- 구현 전 Node 테스트 실패를 확인했고 구현 후 4개 통과. 기존 모바일 Vitest 107개도 새로 실행해 통과했다.
- 각 실행기에 임시 실패 테스트를 주입해 Vitest 실패 시 후속 실행 차단, Node 실패 시 전체 명령 실패를 확인하고 임시 파일을 제거했다.
- 최초 lint의 JSDoc 타입·미대기 Promise 오류를 수정한 뒤 루트 check 통과. 모바일 lint/typecheck/test는 새 실행, 나머지 16/19 작업은 Turbo 캐시다.
- 루트 build 통과: 웹 새 실행, 2/3 작업 캐시. expo:doctor는 새 실행으로 20/20 통과했다.
- 프로필·도구 버전·ledger·fingerprint·판정·workflow 및 두 OS 비교는 미완료이며 빌드·게시 자동화는 아직 연결하지 않았다.
- 사용자 승인으로 `26918286`에서 `DongjaJ/mobile-delivery-policy`를 생성·전환했다. 예정 PR base는 `DongjaJ/eas-update-expo-preview`다.
- 프로필 해석 초안과 회귀를 추가해 모바일 Vitest 107개·Node 7개 및 모바일 lint가 통과했다. 아직 커밋하지 않았다.
- 사용자의 스크립트 규모 지적에 따라 공식 CLI/Workflows 대체를 재검토 중이다. 프로필 해석 초안은 채택 전이며 ledger 테스트 초안은 `.context`에 보관했다.

## 공식 CLI 중심 축소 결과 — 기준 파일 추가 전

- 사용자 선택: GitHub 로컬 빌드 유지, 공식 CLI 중심으로 축소. 새 브랜치 전환과 원래 명세 커밋은 유지했다.
- 자체 설정 해석기·검증 모듈·Node 테스트·Vitest 분리 설정을 `.context/abandoned-delivery-draft/`에 보관하고 앱의 원래 test 명령을 복원했다.
- 앱·workflow·의존성 설정의 현재 차이는 없다. 이번 변경은 명세·계획과 작업 목록의 정리다.
- CLI config의 실제 읽기 조회 성공을 확인했다. fingerprint의 원격 실행·빌드·제출·게시·복구는 실행하지 않았다.
- 사용자가 기준 파일 PR 병합으로 활성화하는 방식을 승인했다. 기준·대기 IPA·중지·재개 계약을 반영했다.
- Spec Kit prerequisites, 상대 링크, 작업 18개와 완료 표시, diff 공백 검사를 새로 실행해 통과했다.
- 기본 check 통과: format은 새 실행, lint/typecheck/test의 Turbo 작업 19개는 모두 캐시 재사용이다.
- 이번 최종 변경은 문서뿐이므로 build/expo:doctor는 재실행하지 않았다. 이전 초안의 실행 결과와 구분한다.

## 기준 파일 PR 활성화 초안의 검증 이력

- 사용자 선택을 명세·상태·계약에 반영하고 delivery.json을 report-only·active=null로 추가했다. 실제 기준을 활성화하지 않았다.
- 기존 Vitest에서 실제 기준 파일과 잘못된 입력을 검증한다. 구현 전 모듈 누락 실패, 구현 후 모바일 111개 통과를 확인했다.
- check 통과: format 및 모바일 lint/typecheck/test는 새 실행, 나머지 16/19 작업은 Turbo 캐시다.
- build는 3/3 캐시로 통과, expo:doctor는 새 실행으로 20/20 통과했다. 원격 빌드·제출·OTA·실기기 확인은 미실행이다.
- 형식 검사만 구현했으며 원본 실행·artifact·설치 증거 대조, PR 버전 비교와 자동 workflow 연결은 아직 남아 있다.
- Turbo 2.10.12의 affected+mobile 필터 dry-run을 새로 실행해 모바일 및 의존 작업 그래프 선택을 확인했다. 실제 작업·배포는 실행하지 않았다.

## 로컬 빌드 유지와 선행 구현 제거

- 사용자가 로컬 빌드·공식 CLI·작은 기준 파일 PR 방식을 재확인했다. 클라우드 빌드를 추가하지 않는다.
- 아직 workflow에서 사용하지 않는 기준 파일 검증기와 전용 테스트를 제거했다. 실제 활성화 경계의 입력 검증은 R014에서 구현한다.
- delivery.json의 비활성 초기값은 유지한다. 배포·제출·활성화를 실행하지 않았다.
- 최신 origin/main은 `32f4c3d0f52e4b43bcc34326267b497fc2a17feb`로 변경됐다. 현재 브랜치에 merge/rebase하지 않았으며 검증은 현재 작업 트리 기준이다.
- 기본 check 통과: format과 모바일 lint/typecheck/test는 새 실행, 나머지 Turbo 작업 16/19개는 캐시 재사용이다. 모바일 테스트 6파일/107개가 통과했다.
- Spec Kit prerequisites·diff 공백 검사 통과. 앱 빌드 설정·의존성 변경이 없어 build/expo:doctor는 재실행하지 않았다.
- 사용자가 “커밋하고 다음 진행해”로 설계 축소 리뷰를 승인하고 PR 검사·보고 전용 단계 진행을 요청했다.
