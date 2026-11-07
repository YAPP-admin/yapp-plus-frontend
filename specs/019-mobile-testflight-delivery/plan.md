# 구현 계획: TestFlight 자동 OTA와 조건부 iOS 빌드

**명세**: [spec.md](spec.md) | **이슈**: [#367](https://github.com/YAPP-admin/yapp-plus-frontend/issues/367)
**작성일**: 2026-11-07 | **실제 브랜치**: `DongjaJ/eas-update-expo-preview`
**현재 단계**: 0단계 문서 리뷰; 아래 경로·명령은 후속 구현 예정이다.

## 요약

PR에서 호환성·버전 규칙을 검사하고, main CI 성공 뒤 누적 변경을 판정한다.
`appVersion`과 설치 확인된 빌드를 기준으로 OTA 또는 GitHub 로컬 빌드를 선택한다.
제출·활성화는 수동이며 새 runtime 대기 중에는 호환 IPA를 재사용한다.

## 기술 맥락

- Node.js `24.20.0`, pnpm `12.3.4`, EAS CLI `27.4.1`; Expo `58.0.23`, fingerprint `0.21.9`.
- 정책 스크립트는 Node ESM, 테스트는 `node:test`; 기존 `expo/fingerprint` 공개 진입점을 사용한다.
- 모바일 스크립트는 `apps/mobile/scripts/delivery/`, workflow는 `.github/workflows/mobile-*.yml`에 둔다.
- 새로운 공용 패키지나 제품 API는 만들지 않는다. 상태·입력 계약은 [계약](contracts/delivery.md)에 둔다.
- 저장소는 GitHub Deployments, IPA는 Actions artifact 30일 보관; 캐시는 성공 증거가 아니다.
- 판정·OTA는 Linux, 빌드는 `xcode-27` runner의 Xcode `27.1`을 명시 선택한다.
- Ruby `3.4.12`, CocoaPods `1.17.0`, fastlane `2.241.2`를 설치·검사하고 runner image 버전도 기록한다.
- 호스팅 runner image 자체는 불변이 아니므로 필요한 도구가 없거나 달라졌으면 배포를 중단한다.

## 헌법 점검

검토 기준: `origin/main`의 `aa0f46acf9c0dc77a7f5c52aa848cd891b0eda0d`와 루트 AGENTS.md.

| 원칙                | 적용 결과                                                                  |
| ------------------- | -------------------------------------------------------------------------- |
| 제품 맥락·최소 범위 | mission 확인; TestFlight 전달만 변경, PR Preview와 운영 승격 제외          |
| 앱·계약 경계        | 모바일 내부 스크립트, 기존 workspace 공개 진입점 사용; 제품 계약 변경 없음 |
| 도구·공급망         | mise와 lockfile 고정, Action SHA 고정; 공급망 보호 완화 없음               |
| 검증                | 정책 분기 회귀·필수 품질 게이트·실기기 검증 구분                           |
| 리뷰·복구           | #367 연결, 단계별 리뷰, PR 800줄 미만, pause·rollback 명시                 |

설계 후에도 동일 원칙을 만족한다. 실제 서명·runner 가용성 등 외부 조건은 완료로 간주하지 않는다.

## 구성과 데이터 흐름

### 1단계 — PR 검사와 보고 전용 판정

- `policy.mjs`는 외부 호출 없는 순수 판정, `fingerprint.mjs`는 공개 설정·native 입력 수집을 맡는다.
- PR의 정확한 base와 병합 결과를 각각 frozen 설치한 격리 디렉터리에서 비교한다. PR 변경 파일만 비교하지 않는다.
- same-repo/fork 모두 별도 읽기 전용 job으로 검사한다. 기존 TURBO_TOKEN 제공 verify job을 재사용하지 않는다.
- checkout은 `persist-credentials: false`, 인증 캐시·artifact와 배포 비밀은 제공하지 않는다. `pull_request_target`은 사용하지 않는다.
- base의 고정 fingerprint 도구·동일 설정으로 양쪽을 계산한다. 계산 도구 업그레이드는 새 기준 검증 대상으로 삼는다.
- fingerprint.config.js/cjs·.fingerprintignore 변경은 계산 전에 차단하고 새 정책 검증으로 분기한다. base 도구만 import해도 대상 정책 파일은 읽히기 때문이다.
- 검사 모듈은 base의 정확한 경로, 앱 의존성은 각 대상의 frozen 설치에서 resolve한다. 새 구조를 해석하지 못하면 blocked다.
- 버전·build number는 별도 비교하고, fingerprint가 제외하는 base/testflight 빌드 프로필·도구 체인을 별도 digest로 검사한다.
- .easignore·native patch·autolinking 경로·fingerprint 정책 변경도 별도 검사한다. 제출 설정만 바뀌면 native 변경으로 취급하지 않는다.
- autolinking 성공과 필수 native source 존재까지 검증한다. 해시 반환만으로 수집 성공을 판정하지 않는다.
- native 변경에 버전 증가가 없거나 버전이 감소하면 CI 실패; 실패 출처와 수정 방법을 Summary로 제공한다.
- main에서는 마지막 반영 SHA 이후 앱·workspace 의존 그래프·공개 설정의 누적 영향을 판정한다.
- root lockfile 변경은 검사 계기이며 단독으로 native 변경을 확정하지 않는다. 불명확한 영향은 보수적으로 검사한다.
- 새 runtime은 기존 runtime의 SHA를 누적 기준으로 사용하지 않는다. 기준 미등록이면 bootstrap을 요구한다.

### 2단계 — 조건부 로컬 빌드

- `mobile-delivery.yml`은 CI 성공 main push의 정확한 SHA를 사용한다. 최초 빌드는 새 앱 버전으로 생성한다.
- 프로필·채널 `testflight`, EAS 환경 `production`, 플랫폼 `ios`를 명시한다.
- `MOBILE_WEB_URL`은 기존 eas.json 공개 설정을 해석해 공통으로 전달하고 최종 config와 IPA를 검사한다.
- GitHub `mobile-testflight` Environment는 main 전용으로 준비한다. 운영 workflow 자체도 main ref만 허용한다.
- `eas build --local`로 IPA를 만들고 실제 runtime·채널·식별자·build number·digest를 생성 기록과 연결한다.
- 같은 runtime·호환성 키의 대기 IPA가 유효하면 재사용한다. 만료 또는 명시적 rebuild만 새 build number를 만든다.
- keychain·자격 증명 임시 파일을 정리하고 IPA·비밀 없는 메타데이터만 보관한다.

### 3단계 — 제출·활성화

- `mobile-manual.yml`에서 build record와 artifact ID를 검증하고 `eas submit --path`로 선택 IPA만 업로드한다.
- 제출 완료와 활성화는 별도 이력이다. 설치·로그인·WebView·위치 확인을 운영자가 확인해야 활성화한다.
- 활성화는 이전 runtime으로의 감소와 동일 runtime의 다른 호환성 키를 거부한다.
- 활성화 후 최신 main을 다시 조회한다. 해당 SHA의 성공 CI가 있으면 누적 OTA 후보를 재평가한다.
- GitHub token으로 생성한 이벤트의 재귀 workflow 실행에 의존하지 않고 같은 실행의 후속 단계로 재평가한다.

### 4단계 — 자동 OTA와 복구

- main 최신성·CI 성공·활성 runtime·호환성 키·채널 연결·운영 상태를 게시 직전에 재검사한다.
- 정상 일반 배포는 최신 main만 허용하며 과거 SHA 복구는 별도 rollback 동작으로 제한한다.
- 메시지에 SHA와 작업 식별자를 넣고 `--platform ios --channel testflight --environment production`을 명시한다.
- OTA는 호환 설치본 전체에 게시한다. 강제 앱 재시작·비율 rollout은 추가하지 않는다.
- 외부 게시 성공 후 기록 실패는 같은 작업 식별자로 결과를 조회한다. 유일한 결과를 입증하지 못하면 중단한다.
- rollback은 먼저 pause 기록을 남긴 뒤 현재 runtime의 정상 update 재게시 또는 embedded 복귀를 수행한다.
- rollback 후 자동 재개하지 않는다. 수동 resume에서 수정된 최신 main의 CI·호환성을 확인한다.
- active 모드 승격 직후 수동 evaluate로 최신 main을 재평가한다. 설정 변경만으로 자동 이벤트가 생긴다고 가정하지 않는다.

## 기록·동시성·권한

- `ledger.mjs`는 [상태 모델](data-model.md)의 불변 작업 기록을 사용한다. 외부 결과가 생기면 후속 기록을 추가한다.
- 모든 변경 작업은 저장소·프로젝트·채널 단위 같은 concurrency group, `cancel-in-progress: false`를 사용한다.
- 이는 실행 중 취소 방지이며 FIFO 보장이 아니다. 대기 취소는 미실행으로 표시하고 자동 실행은 최신 main을 따라잡는다.
- 수동 요청이 대기 중 취소되면 운영자가 원래 기록을 조회해 재실행한다. 접수만으로 제출 성공을 표시하지 않는다.
- 기본 contents/actions/deployments 읽기; 기록 작성 job에만 deployments 쓰기를 제공한다.
- Expo token은 빌드·제출·게시·Expo 결과 조회/복구 job에만 제공한다. PR 및 순수 report-only 검사에는 제공하지 않는다.
- 채널 연결을 자동 수정하지 않는다. 예상 연결과 다르면 운영자가 확인할 때까지 차단한다.

## 전달·검증 전략

0단계 문서 → 1단계 보고 전용 → 2단계 빌드 → 3단계 제출·활성화 → 4단계 OTA·복구 순서다.
각 단계마다 리뷰를 받고 별도 PR 크기를 계산한다. 650줄부터 분리 검토, 800줄 이상은 진행하지 않는다.
정책·상태·수동 입력 검증은 가까운 단위에서 테스트하고 외부 CLI 자체를 재검증하지 않는다.
`node --run check`가 기본이며 workflow·모바일 설정 변경 때 build/expo:doctor를 추가한다.
운영 모드 승격은 [검증 절차](quickstart.md)를 통과한 뒤 수행한다. 현재 결과는 [validation.md](validation.md)에 기록한다.
