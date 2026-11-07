# 조사 결과와 결정 근거

**확인일**: 2026-11-07. 문서 설명·고정 npm 패키지 소스 확인이며 실제 클라우드 빌드 성공을 의미하지 않는다.

## 배포 패턴

| 자료                                                                                 | 확인 내용                                           | 결정·대안                                                    |
| ------------------------------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------ |
| [기본 배포](https://docs.expo.dev/eas-update/deployment/)                            | appVersion과 테스트·운영 채널 분리 안내             | 현재 testflight 유지, 운영 채널은 후속                       |
| [대안 패턴](https://docs.expo.dev/eas-update/deployment-patterns/)                   | 단일 흐름·고정 staging·플랫폼 분리·branch promotion | 고정 테스트 채널과 iOS 전용 흐름 채택, 버전별 채널 승격 제외 |
| [자동 분기 예제](https://docs.expo.dev/eas/workflows/examples/deploy-to-production/) | fingerprint로 호환 빌드 조회 후 Update/Build        | 원리만 사용; cloud get-build 대신 GitHub 빌드 기록 사용      |
| [runtime](https://docs.expo.dev/eas-update/runtime-versions/)                        | appVersion 수동 증가 책임, fingerprint 정책 대안    | runtime 정책 전환 없이 별도 검사 추가                        |
| [PR Preview](https://docs.expo.dev/eas-update/github-actions/)                       | PR별 OTA와 개발 빌드 검증                           | main 자동화 이후 별도 명세                                   |
| [rollout](https://docs.expo.dev/eas-update/rollouts/)                                | update별·branch별 점진적 배포                       | 현재 TestFlight는 전체 배포; 운영 도입 시 별도 결정          |
| [rollback](https://docs.expo.dev/eas-update/rollbacks/)                              | 정상 update 재게시·내장 코드 복귀                   | 수동 복구와 지속 pause, 명시적 resume                        |

## 고정 버전에서 확인한 사항

- [expo 58.0.23](https://registry.npmjs.org/expo/-/expo-58.0.23.tgz)의 fingerprint.js/d.ts가 공개 API를 제공한다.
- [fingerprint 0.21.9](https://registry.npmjs.org/@expo/fingerprint/-/fingerprint-0.21.9.tgz)의 Presets.js에서 기본 balanced를 확인했다.
- balanced는 앱 버전·eas.json·.easignore 등을 제외한다. 별도 native 빌드 구성 digest와 앱 버전 검사로 보강한다.
- 같은 패키지 버전의 native patch·autolinking 경로 변경도 hash만으로 안전하다고 판단하지 않는다.
- Expo.js의 iOS autolinking은 수집 오류 시 빈 source를 반환할 수 있다. 필수 source와 명령 성공을 별도 검증한다.
- Linux/macOS 정규화 구현은 있으나 이 앱에서 동일 hash를 실증한 것은 아니다. 1단계 도입 게이트로 비교한다.
- [EAS CLI 27.4.1](https://registry.npmjs.org/eas-cli/-/eas-cli-27.4.1.tgz)의 local 분기 이전에 remote build number를 처리한다.
- remote autoIncrement는 local에서도 사용하며 실패 시 번호 공백은 허용한다. 사용자 표시 앱 버전은 별도로 증가시킨다.
- local build는 cloud BuildRequest를 만들지 않으므로 EAS build ID를 필수 기록으로 요구하지 않는다.

## 환경·도구·권한

[환경 변수](https://docs.expo.dev/eas/environment-variables/usage/)에 따라 OTA 환경을 명시한다.
현재 공개 MOBILE_WEB_URL을 공통 전달하고 resolved config를 검사하며 private EAS 변수에 의존하지 않는다.
[로컬 빌드](https://docs.expo.dev/build-reference/local-builds/)는 일부 eas.json 도구 설정을 무시하므로 runner에서 고정한다.
[GitHub runner](https://github.com/actions/runner-images/blob/main/images/macos/xcode-27-arm64-Readme.md)의 도구 목록을 출발점으로 삼되 실제 버전을 검증한다.
[PR 이벤트](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request)의 합성 merge 결과와 그 base를 비교한다.
config/plugin 평가도 PR 코드 실행이므로 해당 job에는 배포 비밀을 제공하지 않는다.

## 공식 기능 재사용으로 변경한 결정

[EAS CLI](https://docs.expo.dev/eas/cli/)의 config·fingerprint·build·submit·update·복구 명령을 직접 사용한다.
27.4.1 config 조회에서 testflight/store, Node 24.20.0, appVersion 및 공개 WebView URL 일치를 실제 확인했다.
이 출력은 필요한 공개 필드만 추출했고 원시 config·환경 변수는 저장하지 않았다.
고정 CLI 소스에서 config와 fingerprint 명령의 인증 의존을 확인했다. PR에는 Expo token을 주지 않고 [공식 로컬 Fingerprint API](https://docs.expo.dev/versions/latest/sdk/fingerprint/)를 사용한다.
고정 CLI의 fingerprint/utils.js에서 fingerprint 서버 등록을 확인했다. report-only는 원격 fingerprint 명령 대신 로컬 API를 사용한다.
프로필 상속 해석기와 범용 Deployments ledger는 폐기한다. build/submit/update/recovery별 자체 CLI 래퍼도 추가하지 않는다.
[Actions concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)는 실행 중 겹침을 막는 데 사용하되 FIFO나 중복 게시 방지를 대신한다고 가정하지 않는다.
공식 CLI에 서버 멱등성을 가정하지 않는다. 불명확한 결과는 자동 재시도 없이 수동 확인하며, 활성 기준은 사용자 선택에 따라 Git의 기준 JSON으로 보존하고, 대기 IPA 메타데이터 소실 시 자동 처리를 중단한다.

## 배제한 대안과 남은 검증

- fingerprint runtime 전환: 기존 정책 유지라는 사용자 선택에 따라 제외.
- EAS 원격 빌드: 사용자가 GitHub 로컬 빌드를 선택했으므로 제외.
- 제출 즉시 활성화: 실제 설치 확인 후 활성화라는 사용자 선택에 따라 제외.
- 기존 TestFlight 기준 가져오기·구버전 OTA 유지보수: 새 기준·최신 버전 지원 선택에 따라 제외.
- 외부 계정·자격 증명·서명·실제 runner 결과는 [validation.md](validation.md)에서 미확인 상태를 별도로 관리한다.

[Turbo affected](https://turborepo.dev/docs/reference/run#--affected)는 패키지 의존 관계와 Git 변경 범위로 대상을 고른다. 설치된 2.10.12에서 모바일 dry-run을 확인했다.
main 배포에는 마지막 실제 반영 SHA와 후보 SHA를 명시한다. 전체 Git 이력을 확보하고 루트 도구·설정 입력도 선언한다. 저장소 밖 환경 변경·수동 복구/재개는 affected만으로 생략하지 않는다.

## GitHub Action 대체 검토

[공식 PR Preview 예제](https://docs.expo.dev/eas-update/github-actions/)는 Expo Action으로 CLI 설치·인증 후 preview Action으로 `eas update --auto`와 QR 댓글을 실행한다.
[공식 fingerprint Action 소스](https://github.com/expo/expo-github-action/blob/main/src/fingerprint/index.ts)는 현재 지문만 계산하고 이전 지문은 SQLite 캐시 DB에서 조회한다. 이전 기록이 없으면 null이므로 base를 직접 계산하는 현재 검사와 다르다.
[continuous-deploy-fingerprint](https://github.com/expo/expo-github-action/blob/main/continuous-deploy-fingerprint/action.yml)는 EAS Build와 Update 자동 배포용이며 로컬 빌드 선택을 제공하지 않는다.
