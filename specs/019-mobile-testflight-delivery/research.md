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

## 기록·복구의 일관성

[Deployments API](https://docs.github.com/en/rest/deployments/deployments)는 payload 수정 API가 없다.
요청·결과·활성화를 불변 기록으로 나누고 ref=검증 SHA, auto_merge=false를 사용한다.
[status API](https://docs.github.com/en/rest/deployments/statuses)의 과거 status 이력은 영구 보관을 보장하지 않는다.
현재 status와 불변 result payload만 사용하며 성공 시 auto_inactive=false를 명시한다.
[concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)는 cancel=false만으로 대기 순서·보존을 보장하지 않는다.
새 queue 기능에 의존하지 않고 취소된 수동 요청의 재실행과 최신 main 재평가를 명시한다.
[EAS CLI](https://docs.expo.dev/eas/cli/)의 서버 멱등성 키를 가정하지 않는다. 게시 전 작업 키 저장과 결과 조회로 복구한다.
0개 조회도 외부 실행 없음의 확정 증거가 아니므로 불명확한 작업은 자동 재게시하지 않는다.

## 배제한 대안과 남은 검증

- fingerprint runtime 전환: 기존 정책 유지라는 사용자 선택에 따라 제외.
- EAS 원격 빌드: 사용자가 GitHub 로컬 빌드를 선택했으므로 제외.
- 제출 즉시 활성화: 실제 설치 확인 후 활성화라는 사용자 선택에 따라 제외.
- 기존 TestFlight 기준 가져오기·구버전 OTA 유지보수: 새 기준·최신 버전 지원 선택에 따라 제외.
- 외부 계정·자격 증명·서명·실제 runner 결과는 [validation.md](validation.md)에서 미확인 상태를 별도로 관리한다.
