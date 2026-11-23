# 검증 기록

## 1A 문서 작업 — 2026-11-23

- 기준: origin/main `cc90b35e`, 브랜치 `DongjaJ/expo-ci/cd-plan`.
- 이슈: [#512](https://github.com/YAPP-admin/yapp-plus-frontend/issues/512), 담당 DongjaJ, OPEN 확인.
- 작업: 신규 Spec Kit 문서만 작성. 제품 코드·배포 설정·기존 명세의 현재 정책은 변경하지 않았다.
- 도구: Node.js 24.20.0·pnpm 12.3.4, frozen-lockfile·ignore-scripts로 의존성 설치.
- `.specify/extensions.yml` 없음: specify/plan/tasks 전후 hook은 해당 없음.
- 스크립트의 feature 이름은 문서 탐색용이며 실제 브랜치 생성·전환·이름 변경은 하지 않았다.

| 검증                            | 결과                                                                      |
| ------------------------------- | ------------------------------------------------------------------------- |
| Spec Kit 경로·필수 산출물       | check-prerequisites 통과, 신규 문서 9개                                   |
| 요구사항·태스크 추적, 로컬 링크 | FR 14개·SC 6개가 태스크 36개에 연결됨, 링크·형식 오류 없음                |
| 문서 포맷·diff 공백·변경량      | 신규 포맷·공백 검사 통과, origin/main 대비 627줄 추가·0줄 삭제            |
| node --run check                | 통과. 포맷 신규 실행, lint 7/7·typecheck 7/7·test 5/5는 Turbo 캐시 재사용 |
| build·expo:doctor·native 검사   | 문서만 변경하여 이번 단계에서는 실행하지 않음                             |
| 실제 배포·IPA·실기기            | 미실행. 후속 단계에서 승인된 대상에 실행                                  |

## 외부 준비 상태

다음은 이 대화의 사전 조회 결과다. 원격 설정을 생성하거나 이미 연결된 것으로 간주하지 않는다.

| 항목            | 현재 근거                                                  | 후속 완료 조건                                      |
| --------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| Doppler         | 로그인 계정에서 example-project·yapp-plus-admin만 조회됨   | yapp-plus-web dev/prd 생성·값 등록·Vercel sync      |
| GitHub 환경     | copilot·github-pages만 조회됨                              | member-development/member-production 공급·권한 준비 |
| Firebase Secret | 저장소에 단일 FIREBASE_IOS_GOOGLE_SERVICES_PLIST 이름 존재 | 환경별 실제 프로젝트·Bundle ID·APNs 확인            |
| Vercel          | 프로젝트 ID 변수 존재, 원격 scope 설정 확인 미완료         | 고정 CLI·권한으로 프로젝트·전용 alias·접근 확인     |
| EAS             | 저장소 설정만 확인, 원격 환경·채널 조회 미완료             | 환경·채널 연결·공개 설정 일치 확인                  |
| API·OAuth       | 개발 인프라 사용으로 합의, 실제 조합 미확인                | 환경별 주소·origin·audience 확인                    |

## 남은 단계

1A 문서 리뷰 후 1B 외부 준비를 진행한다. 이후 웹·모바일·자동화·전환을 각 리뷰 단위로 수행한다.
제품 구현, Doppler/Vercel/GitHub/EAS 설정, IPA 생성·제출, tag 발행, commit·push·PR은 아직 수행하지 않았다.
새 실행 결과는 이 문서에 덧붙이며 기존 미실행 상태를 근거 없이 완료로 바꾸지 않는다.

## 1B 공통 외부 준비 — 2026-11-23 (부분 완료)

- Doppler에 `yapp-plus-web` 프로젝트를 생성했다. 프로젝트 생성 과정에서 root config `dev`와 `prd`가
  자동 생성됐음을 확인했다. 값은 등록하거나 조회·출력하지 않았다.
- GitHub repository environment `member-development`와 `member-production`을 생성했다. 두 환경 모두
  현재 protection rule 0개이며, Secret·Variable은 아직 등록하지 않았다.
- 로컬 Vercel CLI 로그인은 `dongjaj`로 확인됐으나, 실제 회원 웹 배포는 YAPP 공식 Google 계정의
  `VERCEL_TOKEN`으로 GitHub Actions에서 실행된다. 로컬 계정 접근은 배포 권한의 전제 조건이 아니다.
- 사용자 확인으로 Doppler Vercel integration의 `dev`→Preview, `prd`→Production 연결을 사용한다.
  GitHub Actions에서 Doppler token을 별도 주입하거나 Vercel에 `VITE_API_BASE_URL`을 중복 등록하지 않는다.
- EAS 원격 환경·채널, 개발·운영 API/OAuth/Firebase의 실제 조합은 자격 정보나 환경 소유자 권한 없이
  확인할 수 없으므로 변경하지 않았다. 기존 단일 Firebase Secret도 복제·이름 변경하지 않았다.

| 검증                | 결과                                                                    |
| ------------------- | ----------------------------------------------------------------------- |
| Doppler root config | `dev`/`prd`, 각각 environment가 일치하고 root·locked 상태 확인          |
| GitHub environment  | `member-development`/`member-production` 존재, protection rule 0개 확인 |
| Vercel 권한         | 로컬 로그인 scope와 repository 조직 ID가 불일치하여 연결 작업 보류      |
| 비밀값 노출         | 없음. API URL·OAuth·Firebase 값의 조회·등록·출력 미실행                 |

T006은 완료했다. T007과 T008은 실제 개발 alias·EAS/Firebase 조합 확인이 남아 완료 처리하지 않는다.
다음 진행 전 각 환경에 등록할 실제 공개 설정·Firebase 원본을 환경 소유자와 확인해야 한다.

## 개발 alias 선택 — 2026-11-23

- 개발 WebView의 고정 호스트는 `yapp-plus-web-dev.vercel.app`으로 확정했다.
- 도메인을 구매하거나 임의 Preview에 수동 연결하지 않는다. T027에서 main CI가 검증한 Preview READY
  배포에만 alias를 연결하고 deployment ID까지 확인한다.
- PR·운영 tag·수동 운영 배포는 이 alias를 변경하지 않는다.
