# 구현 계획: 공식 CLI 중심 TestFlight 배포

**이슈**: [#367](https://github.com/YAPP-admin/yapp-plus-frontend/issues/367) | **명세**: [spec.md](spec.md)
**브랜치**: `DongjaJ/mobile-delivery-policy` | **예정 base**: `DongjaJ/eas-update-expo-preview`
**상태**: GitHub 로컬 빌드 유지·공식 CLI 중심 축소 승인. 기준 파일 PR 병합으로 활성화 승인.

## 유지할 정책

main의 성공 CI와 정확한 SHA를 기준으로 iOS만 처리한다. `appVersion`을 유지하고 네이티브 변경에는 버전 증가를 요구한다.
새 버전은 GitHub macOS에서 빌드하고 수동 제출·실기기 확인 후 OTA를 활성화한다.
제출 대기 중 호환 IPA를 재사용하며 최신 활성 runtime만 자동 지원한다. PR Preview·App Store 공개 배포·Android는 후속 범위다.

## 공식 기능에 맡길 부분

| 작업                                | 사용할 기능                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------- |
| main의 프로필 상속·플랫폼 설정 해석 | `eas config --platform ios --profile testflight --json`                     |
| 인증된 main의 네이티브 fingerprint  | `eas fingerprint:generate --platform ios --build-profile testflight --json` |
| PR·보고 전용의 로컬 fingerprint     | 기존 Expo의 공개 `expo/fingerprint` API                                     |
| IPA 생성                            | `eas build --local --platform ios --profile testflight`                     |
| 지정 IPA 제출                       | `eas submit --platform ios --profile testflight --path <IPA>`               |
| OTA 게시·조회                       | `eas update`, `eas update:list`, `eas update:view`                          |
| 정상 OTA·내장 코드 복구             | `eas update:republish`, `eas update:roll-back-to-embedded`                  |

명령과 옵션은 [계약](contracts/delivery.md)에서 관리한다. `eas config`·EAS fingerprint CLI는 인증이 필요하므로 PR에서 호출하지 않는다.
EAS fingerprint CLI는 서버에 fingerprint를 등록하므로 외부 변경을 하지 않는 report-only에서도 로컬 API를 사용한다.
공식 EAS Workflows의 get-build는 EAS Build 기록을 대상으로 하므로 로컬 IPA 조회에 사용하지 않는다.

## 제거할 자체 구현

- eas.json 상속·기본값·iOS 우선순위 해석기를 만들지 않는다.
- initialization/operation/result/resolution을 재생하는 범용 ledger와 별도 상태 머신을 만들지 않는다.
- build/submit/update/rollback마다 Node CLI 래퍼를 만들지 않는다. workflow에서 공식 명령을 직접 호출한다.
- CLI의 옵션·성공 여부를 그대로 다시 검사하는 테스트를 만들지 않는다. 프로젝트의 버전 규칙·SHA·입력 경계만 검증한다.
- Node 테스트 실행기를 추가하지 않는다. 남는 정책 함수의 테스트는 기존 Vitest를 사용한다.

## 구현 규모 제한

GitHub 로컬 빌드와 설치 확인 후 기준 파일 PR 활성화를 유지한다. OTA를 위한 최초 클라우드 빌드는 추가하지 않는다.
변경 영향은 Turbo `--affected`, 비교 범위는 Git, 네이티브 지문은 Expo에 맡긴다.
workflow의 조건·순서·동시 실행은 YAML로 표현하고 EAS CLI를 직접 호출한다.
기준 파일 검사는 실제 활성화 PR 연결 시 필요한 입력·출처 대조와 함께 구현한다. 미사용 검증 모듈이나 별도 스키마 의존성을 미리 추가하지 않는다.

## 남는 최소 연결 로직

- PR base와 합성 merge 소스의 fingerprint·앱 버전 비교 및 네이티브 버전 누락 실패.
- fingerprint 기본 제외 항목인 native 빌드 설정·도구·patch 변경의 보완 검사. 수집 실패는 호환으로 추정하지 않는다.
- main 최신성·성공 CI 확인, 마지막 실제 반영 SHA 이후 누적 영향 판정.
- 로컬 IPA 실행 ID·digest 확인과 사람이 설치 확인한 기준의 대조. 필요한 사실은 [상태 모델](data-model.md)에 정의한다.
- GitHub 공통 concurrency group과 `cancel-in-progress: false`. 취소된 대기 실행은 최신 main 재평가로 따라잡는다.
- 외부 결과가 불명확하면 자동 재시도를 차단하고 공식 CLI·실행 이력으로 수동 확인한다.

## 단계와 검증

1. 설계 축소·중복 초안 제거: 이번 변경. 기준 파일 계약과 비활성 초기값을 검증한다.
2. 기존 1단계: 비밀 없는 PR 검사와 main 보고 전용 workflow. 아직 build/update/submit을 실행하지 않는다.
3. 기존 2단계: 고정 macOS 도구체인에서 local build와 artifact 검증.
4. 기존 3단계: 지정 IPA 수동 제출·설치 확인·활성화.
5. 기존 4단계: 자동 OTA, 명시적 중지·수동 복구·재개.

Node `24.20.0`, pnpm `12.3.4`, EAS CLI `27.4.1`을 유지하고 외부 Action은 SHA로 고정한다.
빌드 도구체인은 기존 계획의 Xcode `27.1`, Ruby `3.4.12`, CocoaPods `1.17.0`, fastlane `2.241.2`를 실제 runner에서 검사한다.
PR에는 Expo·Apple·Turbo 인증을 제공하지 않고 배포 job에만 필요한 권한을 제공한다.
기본 check, 앱/빌드 설정 변경 시 build, 모바일 설정/의존성 변경 시 expo:doctor를 실행한다.
각 리뷰 단위는 실제 base 대비 800줄 미만이며 650줄부터 분리를 검토한다. 다음 단계 구현은 리뷰 후 진행한다.

## 헌법 점검

origin/main `aa0f46acf9c0dc77a7f5c52aa848cd891b0eda0d`의 AGENTS·제품 맥락을 기준으로 검토했다.
모바일 내부와 workflow만 변경하며 새 공용 패키지를 만들지 않는다. 공식 기능을 재사용하고 비밀·실제 배포 검증을 구분한다.
사용자가 기준 파일 PR 활성화를 선택했다. 실제 설치 확인·검증된 main·실패 시 차단 정책은 유지한다.
