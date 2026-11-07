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

## 요구사항과 작업 연결

| 요구사항      | 주요 작업                              |
| ------------- | -------------------------------------- |
| FR-001~FR-005 | T008~T017, T023                        |
| FR-006~FR-007 | T018~T024                              |
| FR-008~FR-009 | T025~T029                              |
| FR-010~FR-012 | T014–T016, T022, T025, T028, T030–T034 |
| FR-013~FR-015 | T009, T019–T022, T025, T027, T030–T032 |
| FR-016        | T031, T033~T035                        |
| FR-017        | T007, T017, T024, T029, T035~T037      |

SC-001은 T011–T017, SC-002는 T018–T024, SC-003–SC-005는 T025–T035의 결과로 검증한다.
현재 문서는 구현 가능 조건과 검증 계획이며 요구사항의 실제 구현 완료를 뜻하지 않는다.

## 단계 경계

기준 origin/main 대비 문서 9개 추가, +612/-0줄(미추적 파일 포함); 단일 명세 리뷰 목적이며 분리 기준 650줄 미만이다.

이 문서는 0단계 설계 결과다. 1~4단계 코드·배포·활성화를 수행하지 않았으며 사용자 리뷰 후 별도 진행한다.
외부 준비가 안 되어도 보고 전용 구현은 검토할 수 있지만 실제 build/update/submit 성공으로 보고하지 않는다.

2026-11-07 사용자가 “커밋하고 다음 진행해”로 0단계 커밋과 1단계 진행을 승인했다.
