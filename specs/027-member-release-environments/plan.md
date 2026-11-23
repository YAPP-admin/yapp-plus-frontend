# 구현 계획: 회원 웹과 iOS 앱의 개발·운영 배포 분리

**이슈**: [#512](https://github.com/YAPP-admin/yapp-plus-frontend/issues/512)
**브랜치**: `DongjaJ/expo-ci/cd-plan` | **작성일**: 2026-11-23 | **명세**: [spec.md](spec.md)
**상태**: 1B 외부 증빙 대기. 웹 API 환경 입력 검증은 구현·로컬 검증을 마쳤고 배포 활성화는 미실행이다.

## 요약

main 검증은 개발 웹·testflight OTA, 공통 release 태그는 운영 웹·production OTA를 배포한다.
appVersion·수동 macOS IPA를 유지하고 Doppler를 웹 환경 설정의 원본으로 사용한다.
구현 결정과 대안은 [research.md](research.md), 입력·실패 정책은 [contracts/delivery.md](contracts/delivery.md)를 따른다.

## 기술 맥락

| 항목 | 기준                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| 도구 | Node.js 24.20.0, pnpm 12.3.4, TypeScript 6.0.3, Turbo 2.10.12                     |
| 앱   | Vite 8.2.2·React 19.3, Expo 58·React Native 0.88.1, iOS WebView                   |
| 배포 | GitHub Actions, Vercel CLI 59.13.1, EAS CLI 27.4.1, macOS local build             |
| 설정 | Doppler yapp-plus-web dev/prd → Vercel Preview/Production, EAS preview/production |
| 기록 | 웹 GitHub Deployments, 모바일 EAS 게시 기록, 기존 IPA artifact·체크섬             |
| 검증 | Vitest·workflow shell fixture, 기존 양 OS 네이티브 검사, 실기기 검증              |
| 범위 | 2개 앱·2개 배포 환경. 새 서비스·의존성·DB·자동 빌드 상태 저장소 없음              |

현재 공용 API는 생성된 기본 서버 주소를 사용한다. 앱 진입점에서 공개 client 설정을 적용하며
생성 코드·공용 기본 주소·관리자 초기화는 수정하지 않는다. 환경별 입력 검증은 소비 앱이 소유한다.

## 헌법 확인

확인 기준: `origin/main`의 `7c92b994`와 [AGENTS.md](../../AGENTS.md),
[프로젝트 헌법](../../.specify/memory/constitution.md), [제품 맥락](../../docs/mission.md).

| 원칙                | 판정과 근거                                                           |
| ------------------- | --------------------------------------------------------------------- |
| 제품 맥락·최소 범위 | 적용: 회원의 기존 기능을 유지하며 배포 환경만 분리한다.               |
| 경계·생성 계약      | 적용: 앱 간 import 없음, SDK 생성 파일 수정 없음, 앱 초기화에서 설정. |
| 재현 가능한 도구    | 적용: 기존 고정 버전·공급망 정책 유지, Action은 commit SHA 고정.      |
| 가까운 계층 검증    | 적용: 환경 변환·출처·영향 판정 회귀 테스트, 실기기 확인은 별도.       |
| 리뷰·복구           | 적용: 이슈 #512, 단계 리뷰, 800줄 미만 PR, 환경별 복구 계약.          |
| 웹 작성 가이드      | 후속 웹 코드 작성 전 Modern Web Guidance 1.0.0과 앱 가이드 적용.      |
| 외부 환경 준비      | 확인 필요: 승인된 설계와 실제 준비를 구분하고 validation.md에 기록.   |

설계 재검토에서도 위 원칙을 유지한다. 외부 준비 미완료는 배포 활성화 조건이며 설계 미결정으로
대체하지 않는다. 이번 단계의 문서 검증으로 실제 서비스 검증을 통과 처리하지 않는다.

## 단계와 리뷰 단위

### 1A — 현재 작업: 명세·계획·태스크

- spec·research·data-model·contracts·quickstart·tasks·체크리스트·validation을 작성한다.
- 기존 사실, 합의된 변경, 미확인 외부 설정을 분리한다. before/after는 research에 둔다.
- 완료 기준: 요구사항 추적·문서 링크·형식 확인과 기본 품질 게이트 결과를 제출한다.
- 여기서 리뷰를 받는다. 이슈 생성 외의 외부 설정 변경은 이번 작업에 포함하지 않는다.

### 1B — 환경 준비

- Doppler 프로젝트·config·Vercel sync, 개발 alias, GitHub 환경, EAS 채널을 준비한다.
- 실제 API·OAuth·Firebase 조합, 웹 origin 허용, 개발 WebView 접근을 확인한다.
- 전환 전 운영 웹·OTA·IPA 복구 기준을 기록한다. 기존 운영 트리거는 아직 유지한다.
- 완료 기준: 계약의 환경 표가 실제 설정과 일치하고 필요한 권한·값이 준비됨. 리뷰 후 2단계.

### 2 — US1: 웹 설정

- 웹 초기화·빌드에서 VITE_API_BASE_URL을 검증하고 첫 요청 전에 client에 적용한다.
- Doppler 로컬 실행 안내와 Turbo env·캐시 입력을 갱신한다. CI에는 외부 요청을 만들지 않는 예약된
  비실재 HTTPS URL을 공급한다.
- PR Preview로 검증한다. 아직 main 운영 배포를 개발로 전환하지 않는다.
- 완료 기준: 주소 누락·오류·설정만 변경한 재빌드·관리자 회귀 검증. 리뷰 후 3단계.

### 3 — US2: 모바일 설정과 세션

- testflight/production 프로필, 공개 환경 설정, API 초기화, OAuth·Firebase를 연결한다.
- 로그인 세션 키만 환경별로 구분한다. 알림은 기존 Firebase project/FID 저장을 재사용한다.
- 프로필과 수동 빌드·OTA 입력 공급 변경을 함께 검토한다. 중간 상태가 자동 게시되지 않도록
  해당 변경을 main에 반영하기 전 기존 모바일 게시를 중지한다. 재개는 5단계에서 한다.
- 각 네이티브 변경 PR에서 appVersion 검사를 지키며 최종 배포 단위의 QA IPA를 수동 검증한다.
- 완료 기준: 환경 일치·재로그인·알림 선택 격리, 기본 검사와 실기기 결과. 리뷰 후 4단계.

### 4 — US3·US4: 배포 자동화

- main 개발 workflow와 태그 운영 workflow, 성공 기준 조회, 공통 실행 잠금을 구현한다.
- 운영 웹의 기존 수동 main 배포 경로를 제거하고 태그 재배포·환경별 IPA 입력을 제공한다.
- 자동 트리거 전환을 적용하기 전 회원 웹의 기존 main 운영 배포도 중지한다. 관리자 흐름은 유지한다.
- 4A 출처·영향 판정, 4B workflow·수동 경로·복구 문서를 별도 PR 후보로 둔다.
- 완료 기준: 외부 배포를 대체한 회귀 테스트와 변경량 리뷰. 자동 운영 배포는 아직 활성화하지 않는다.

### 5 — 전환·실기기·인계

- 대기 작업 종료·정상 복구 기준 확인 → 개발 배포·새 QA IPA 검증 → 첫 운영 태그 순서다.
- 운영 IPA를 해당 태그에서 별도 빌드·제출해 TestFlight에서 확인하고 심사·출시는 수동 처리한다.
- 이후 개발 자동 배포를 재개하고 main 변경이 운영 URL·채널을 갱신하지 않는지 확인한다.
- 완료 기준: quickstart의 실기기·부분 실패·복구 결과와 남은 위험을 validation에 기록한다.

## 변경 구조와 크기 관리

- 웹: `apps/web/src/app/`의 환경 초기화와 Stackflow 진입점, Vite 설정, 로컬 명령·Turbo 입력.
- 모바일: Expo 설정·EAS 프로필, API 초기화, auth 저장소·공급자, 기존 scripts 회귀 테스트.
- 자동화: `.github/workflows/`의 개발·release·manual, 공통 Vercel Action, 배포 판정 테스트.
- 현재 문서는 `specs/027-member-release-environments/`에만 둔다. `.specify/feature.json`은
  도구용 gitignored 포인터이며 실제 Git 브랜치를 바꾸지 않는다.
- 각 리뷰에서 merge-base와 untracked를 포함한 줄 수를 센다. 650줄부터 분리 검토, 800줄 미만 유지.
  기능 구현과 문서를 같은 PR에 계속 누적하지 않고 승인된 Git 작업으로 단계별 PR을 만든다.

## 검증 전략

실행 명령과 수용 시나리오는 [quickstart.md](quickstart.md), 실행 사실은 [validation.md](validation.md)에 둔다.
문서 단계도 기본 `node --run check`를 실행하고, 환경 제약으로 못 끝내면 실패 지점과 미실행 범위를 남긴다.
후속 배포 앱·빌드 설정 변경에는 build, 모바일 설정에는 expo:doctor와 기존 네이티브 검사를 추가한다.
기존 테스트를 갱신하고 외부 서비스 자체 동작을 중복 단위 테스트하지 않는다.
