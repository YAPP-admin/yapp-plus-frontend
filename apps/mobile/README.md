# iOS WebView 셸과 EAS 빌드

`apps/mobile`은 YAPP+의 iOS Expo/React Native WebView 셸이다. Android 앱은 별도 Native
프로젝트에서 관리하며, 이 앱은 Android 빌드나 배포를 구성하지 않는다.

## 확정 식별자

| 설정                     | 값                                     |
| ------------------------ | -------------------------------------- |
| 앱 표시 이름             | `YAPP+`                                |
| Expo owner / slug        | `yapp-plus-official` / `yapp-plus`     |
| iOS Bundle ID            | `org.yapp.yappplus`                    |
| EAS Project ID           | `e34d595c-d553-4007-ac7c-8e85d6549e44` |
| App Store Connect App ID | `6830536097`                           |
| WebView 운영 URL         | `https://yapp-plus-web.vercel.app`     |

`app.config.ts`는 iOS Bundle ID, Apple Sign In capability, EAS project ID와 Google iOS URL
scheme를 단일 기준으로 관리한다. Google과 Apple 인증은 네이티브 모듈을 사용하므로 Expo Go가
아닌 development build 또는 TestFlight 빌드에서 확인한다.

Firebase Cloud Messaging은 React Native Firebase의 `app`·`messaging`·`installations` 패키지를
같은 버전으로 사용한다. `GoogleService-Info.plist`는 저장소에 넣지 않으며,
`FIREBASE_IOS_GOOGLE_SERVICES_FILE`에 해당 파일의 절대 경로를 제공한다. EAS에서는 같은 이름의
file 환경 변수로 설정한다. TestFlight 빌드는 이 값이 없거나 파일이 없으면 시작하지 않는다.
Firebase 프로젝트의 iOS 앱 Bundle ID는 반드시 `org.yapp.yappplus`와 일치해야 한다.

FCM 수신에는 Apple Developer의 Push Notifications capability와 APNs 인증 키를 Firebase 프로젝트에
등록해야 한다. 앱 설정은 development 빌드에 `aps-environment=development`, TestFlight에
`aps-environment=production`을 적용한다. 인증 완료·복원·FCM 토큰 변경·앱 복귀 시 저장된 선택과
OS 권한을 확인해 서버 등록을 동기화한다. ON인 설치에서 미결정 권한만 요청하고, OFF 또는
권한 차단이면 등록을 해제한다. Firebase 설정 파일이 없는 로컬 개발 빌드는 알림 기능을 지원하지 않는다.

## 알림 기능의 TestFlight 통합 검증

실제 FCM 검증은 TestFlight의 실기기에서 진행한다. 현재 ARM64 시뮬레이터에서 확인된
messaging/unregistered 실패는 ON 등록·실제 수신 성공으로 간주하지 않는다.
수신·탭의 자동 테스트와 모의 푸시는 Firebase→APNs→실기기 전체 경로의 검증을 대신하지 않는다.

TestFlight에 올리기 전에 다음 조합을 확인한다.

- 네이티브 빌드: Firebase SDK, Push Notifications entitlement, firebase.json의
  banner/list 설정이 포함된 검증 SHA와 앱 버전·빌드 번호·runtime.
- 웹 배포: 네이티브가 로드하는 MOBILE_WEB_URL에 7-C의 탐색·목록 갱신 코드가 포함된 SHA.
  현재 testflight 프로필은 운영 웹 URL을 사용하므로 로컬 웹 변경만으로는 검증할 수 없다.
- 서버·Firebase 환경: 웹 API가 사용하는 서버와 Firebase 설정 파일·서버 발송 프로젝트가
  일치해야 한다. dev에서 받은 plist를 운영 서버 조합에 그대로 사용하지 않는다.
- APNs: Firebase 프로젝트의 Apple 인증 연결과 production entitlement를 확인한다.
  APNs의 production/sandbox 구분은 Firebase의 dev/운영 프로젝트 구분과 별개다.
- 대상: 승인된 테스트 계정·설치 기기에 한정한다. 토큰·FID·개인 정보는 로그나 문서에 남기지 않는다.

firebase.json과 네이티브 SDK 변경은 EAS Update만으로 반영되지 않는다. 기존 설치본에
호환되지 않는 JS를 보내지 않도록 runtime을 구분하고 새 빌드를 설치한다. 빌드·업로드·시험
발송은 실제 실행 대상과 승인 범위를 확인한 뒤 진행한다.

검증 순서는 로그인 → 알림 ON·권한 허용 → 앱 실행 중/백그라운드/종료 상태의
공지·일반 푸시 → 화면 이동·뒤로가기 → OFF·권한 차단·계정 전환이다.
상세 시나리오와 실행 기록 양식은
[알림 검증 안내](../../specs/023-member-notifications/quickstart.md#testflight-실행-기록)를 따른다.
실패 시 웹 이전 배포, 동일 runtime의 이전 JS, 네이티브 수정 빌드를 구분해 복구하며
기기 등록 또는 발송 환경 문제는 서버·Firebase 측에서도 별도로 확인한다.

## 빌드 프로필

| 프로필                  | 용도                                        | 설치 대상                    |
| ----------------------- | ------------------------------------------- | ---------------------------- |
| `development`           | 네이티브 인증 개발·디버깅                   | 등록된 실제 기기용 내부 배포 |
| `development-simulator` | UI와 WebView 기본 동작 확인                 | iOS Simulator                |
| `testflight`            | App Store Connect 업로드 및 TestFlight 검증 | TestFlight                   |

세 프로필 모두 `https://yapp-plus-web.vercel.app`을 WebView URL로 사용한다. 이 값은 공개 URL이며
`eas.json`에서 빌드 시점에 명시한다. 로컬 Metro 개발에서는 `MOBILE_WEB_URL`을 HTTPS 주소로
지정하거나, 지정하지 않으면 기존처럼 iOS Simulator의 `localhost:3000`을 사용한다.

## 최초 준비

EAS 계정에 로그인한 뒤, 현재 설정이 조직의 기존 Expo 프로젝트를 가리키는지 확인한다. 이미
`extra.eas.projectId`가 등록되어 있으므로 `eas init`으로 새 프로젝트를 만들지 않는다.

pnpm 12.3.4의 `dlx`는 설치 스크립트 정책 누락으로 실패할 수 있다. 로컬에서는 아래처럼
별도 임시 작업 공간에 CLI를 설치한다. 두 스크립트는 실행하지 않으며 전역 설정은 바꾸지 않는다.
EAS CLI를 업그레이드하면 차단 버전과 필요성을 다시 검토한다. 저장소 루트에서 실행한다.

```sh
EAS_CLI_DIR=$(mktemp -d)
printf '%s\n' '{"private":true,"dependencies":{"eas-cli":"27.4.1"}}' > "$EAS_CLI_DIR/package.json"
cat > "$EAS_CLI_DIR/pnpm-workspace.yaml" <<'POLICY'
allowBuilds:
  dtrace-provider@0.8.8: false
  protobufjs@7.6.6: false
POLICY
mise exec -- pnpm --dir "$EAS_CLI_DIR" install
eas() { mise exec -- "$EAS_CLI_DIR/node_modules/.bin/eas" "$@"; }
cd apps/mobile
eas login
eas config --platform ios --profile testflight
```

출력에서 `org.yapp.yappplus`, EAS Project ID, `MOBILE_WEB_URL`이 기대값인지 확인한다. 인증서,
App Store Connect API 키, Apple 계정 비밀번호는 저장소·이슈·로그에 기록하지 않는다.

이하 `eas` 명령은 위 설치를 마친 같은 터미널에서 실행한다. 새 터미널에서는 CLI 준비를 다시 한다.

## 개발·TestFlight 명령

```sh
# 선택 사항: EAS 클라우드의 실제 기기용 development build
eas build --platform ios --profile development

# 선택 사항: EAS 클라우드의 iOS Simulator 전용 build
eas build --platform ios --profile development-simulator

# TestFlight 운영: macOS 로컬 아카이브 생성 및 지정 IPA 제출
eas build --local --platform ios --profile testflight --output /tmp/yapp-plus.ipa
eas submit --platform ios --profile testflight --path /tmp/yapp-plus.ipa
```

`testflight`은 EAS remote build number를 자동 증가시킨다. 사용자에게 보이는 `version`은 새 출시
주기를 시작할 때 `app.config.ts`에서 명시적으로 바꾼다. 실제 업로드·제출은 새 native build와
TestFlight 배포가 필요한 경우 별도 승인으로 실행한다.

## EAS Update

`testflight` 프로필은 `testflight` 채널을 사용하고, runtime version은 앱의 `version`을 그대로
쓴다. EAS Update는 같은 채널·runtime version을 가진 설치본에 JavaScript와 asset만 배포한다.

```sh
MOBILE_WEB_URL=https://yapp-plus-web.vercel.app \
  eas update \
  --channel testflight \
  --environment production \
  --message "변경 내용을 설명하는 한국어 메시지"
```

`MOBILE_WEB_URL`은 EAS 환경 변수에 저장하지 않고 `eas.json`의 공개 build 환경 변수로 관리한다.
따라서 update를 배포할 때도 같은 값을 명시해 build와 WebView 대상이 달라지지 않게 한다.

다음 변경은 EAS Update로 배포하지 않고 새 TestFlight build를 만든다.

- Expo·React Native·네이티브 모듈 의존성
- `app.config.ts`, Expo config plugin, iOS capability, bundle identifier, URL scheme
- 네이티브 세션·로그인 SDK처럼 JavaScript bundle만 바꿔서는 반영되지 않는 변경

현재 runtime policy가 `appVersion`이므로 위와 같은 native 변경을 배포할 때는 build number만
올리지 말고 `app.config.ts`의 `version`도 새 값으로 올린 뒤 새 build를 만든다. 같은 runtime에
호환되지 않는 update가 전달되는 일을 막기 위한 기준이다.

TestFlight 운영 제출은 지정 IPA의 `--path`를 사용한다. 별도로 EAS 클라우드에서 만든 빌드를
제출할 때에만 다음처럼 정확한 build ID를 지정한다. `--latest`는 사용하지 않는다.

```sh
eas submit \
  --platform ios \
  --profile testflight \
  --id <EAS_BUILD_ID> \
  --non-interactive
```

## 변경에 따른 배포·검증 기준

| 변경                                      | 배포 방법       | 확인할 조건                                                   |
| ----------------------------------------- | --------------- | ------------------------------------------------------------- |
| WebView가 표시하는 웹 화면                | 웹 배포         | 설치된 앱의 브리지 계약과 호환되는지 확인한다.                |
| 모바일 JavaScript·asset                   | EAS Update      | 설치본의 네이티브 기능과 runtime이 호환돼야 한다.             |
| 네이티브 SDK 추가·변경 또는 네이티브 설정 | 새 앱 빌드·설치 | TestFlight 검증 후 App Store 배포 시 새 버전 심사를 진행한다. |

Firebase 자체가 항상 네이티브인 것은 아니지만 이 앱의 `@react-native-firebase/*`는 iOS SDK를
호출한다. SDK를 처음 포함하거나 네이티브 구성을 변경할 때는 새 빌드가 필요하며, 이후 호환되는
알림 처리 JS 로직만 수정하면 OTA로 배포할 수 있다. 사용자 수나 팀 규모는 이 기술적 구분을 바꾸지 않는다.
OTA도 스토어 정책을 준수해야 하며, 새 runtime의 OTA 게시 성공을 기존 설치본의 업데이트 성공으로 보고하지 않는다.

현재 `appVersion` 정책은 표시 버전과 runtime을 연결한다. 네이티브 변경을 여러 PR로 분리하기 전에
각 PR의 호환성 검사와 최종 배포 단위를 함께 계획한다. PR 개수만큼 앱을 빌드해야 하는 것은 아니지만,
현재 검사에서는 각 base 대비 네이티브 변경에 버전 증가가 필요하다. 표시 버전을 유지하려면 runtime
정책과 검사기를 함께 변경하는 별도 설계가 필요하며, 검사만 우회하지 않는다.

로컬 실행 확인과 배포 서버 준비 확인을 구분한다. Firebase 파일 등 로컬에만 있는 입력은 배포
workflow에서 공급하는 경로까지 확인한다. plist의 형식·Bundle ID뿐 아니라 Firebase 프로젝트와
백엔드 발송 환경의 일치 여부도 확인한다. 실제 값이나 인증 정보는 문서·로그에 남기지 않는다.

배포 결과는 아래 단계 중 실제 확인한 지점까지만 보고한다.

| 확인한 상태          | 확인된 사실                    | 다음 확인                                 |
| -------------------- | ------------------------------ | ----------------------------------------- |
| build 성공           | IPA 생성                       | 소스 SHA·실행 ID·회차와 제출할 artifact   |
| submit 성공          | App Store Connect 업로드       | Apple 처리 상태·추가 정보 요청            |
| TestFlight 사용 가능 | 지정 테스터가 설치 가능한 빌드 | 기기의 버전·빌드 번호와 실제 실행         |
| 실기기 검증 완료     | 기록한 사용자 흐름의 동작      | App Store 출시를 원하면 새 버전 심사·출시 |

`Mobile TestFlight update`는 OTA 게시이며 IPA 생성·submit이 아니다. `submit`도 정식 출시 심사
신청이나 출시 완료를 의미하지 않는다. 내부 TestFlight 테스트와 외부 베타 심사, App Store 심사를
구분한다. 운영 방법은 아래 수동 빌드 절차를 따른다.

시뮬레이터 관찰과 mock 기반 테스트는 실제 FCM/APNs 수신 검증을 대신하지 않는다. 실기기에서는
알림 선택 유지, 권한, 포그라운드 수신, 백그라운드·종료 상태의 탭 이동과 알림함 갱신을 확인한다.
기능별 `validation.md`에 환경·앱 버전·빌드·관찰 결과·미검증 항목을 기록하고, 실행 ID처럼 일회성인
정보는 작업 가이드의 규칙으로 추가하지 않는다.

참고: [Expo runtime 호환성](https://docs.expo.dev/eas-update/runtime-versions/),
[Apple TestFlight 개요](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/),
[App Store 새 버전 제출](https://developer.apple.com/help/app-store-connect/update-your-app/create-a-new-version).

## main 자동 OTA와 수동 로컬 빌드

[배포 흐름·복구 흐름·브랜치별 진행 상태](../../specs/019-mobile-testflight-delivery/overview.md)를 Mermaid 다이어그램으로 확인할 수 있다.

main push의 CI 성공 후 `mobile-delivery.yml`이 Turbo로 모바일 영향을 확인하고 iOS `testflight` 채널로 OTA를 게시한다.
EAS 공식 `update:list`·`update:view`로 마지막 iOS 게시 SHA를 읽고 현재 검증 SHA까지
`turbo ls --affected`로 비교한다. 공용 패키지의 영향 전파는 Turbo가 처리한다.
웹·관리자·루트 문서만 바뀌면 생략하며, 모바일 패키지 내부 문서는 게시 대상이다.
루트 도구·workspace·patch·배포 설정은 `globalDependencies`에 포함한다.
게시 기록 부재·rollback 기록·조회 또는 판정 실패 시 생략하지 않고 게시한다.
조회·판정은 별도 Actions step이며 이 두 단계에만 `continue-on-error`를 적용한다.
`outcome`으로 성공 여부를 확인하고 Summary에 비교 SHA·단계 결과·게시 여부를 남긴다.
최신 main 확인과 실제 `eas update` 실패는 그대로 workflow 실패로 보고한다.
공통 `setup-eas` Action이 pnpm으로 EAS CLI 27.4.1을 임시 작업 공간에 설치한다.
Expo Action의 임시 설치에 저장소의 스크립트 정책이 전달되지 않아 발생하는 오류를 피하도록
`dtrace-provider@0.8.8`과 `protobufjs@7.6.6`의 설치 스크립트를 명시적으로 차단한다.
EAS CLI 업그레이드 시 이 정책을 재검토한다. `EXPO_TOKEN`은 EAS 조회·배포 명령 단계에만 전달한다.
설치 수정에 문제가 있으면 자동 OTA를 중지하고 수정 전 커밋으로 되돌린 뒤 재검증한다.
PR의 `Mobile native compatibility` 검사를 필수 검사로 설정하고 main 직접 push를 제한한다.
자동 빌드 분기·활성화 기준 파일·설치 확인 승인은 없다. 네이티브 변경 시 PR에서 앱 버전을
증가시키고, 새 버전의 로컬 빌드와 TestFlight 제출은 운영자가 실행한다.
새 runtime의 OTA는 게시돼도 호환되는 설치본이 생기기 전에는 기존 앱에 전달되지 않는다.

```sh
eas build --local --platform ios --profile testflight --output /tmp/yapp-plus.ipa
eas submit --platform ios --profile testflight --path /tmp/yapp-plus.ipa
```

이 명령은 macOS의 Xcode·CocoaPods·fastlane과 Apple 서명 준비가 필요하다.
GitHub Actions의 repository secret `FIREBASE_IOS_GOOGLE_SERVICES_PLIST`에는 배포 환경에 맞는
plist 전체 내용을 등록한다. 빌드 workflow는 이를 runner 임시 파일로 복원하고 plist 형식을 검사한 뒤
`FIREBASE_IOS_GOOGLE_SERVICES_FILE` 환경 변수로 경로를 전달한다. 경로용 Secret은 별도로 등록하지 않는다.
Secret 누락 또는 형식 오류는 빌드 전에 실패하며, 원본 plist는 별도 artifact로 업로드하지 않는다.
잘못된 프로젝트 파일을 등록했다면 Secret을 올바른 파일로 교체한 후 새 빌드를 실행한다.

GitHub에서는 **Actions → Mobile TestFlight manual → Run workflow**에서 branch `main`을 선택한다.

1. `operation=build`: 선택된 main SHA의 push CI가 성공했을 때 macOS 로컬 빌드를 실행한다.
2. 성공한 실행의 Summary에서 실행 ID·회차와 IPA를 확인한다. artifact는 30일 보관한다.
3. 새 실행에서 `operation=submit`을 선택하고 `build_run_id`와 `build_attempt`에 해당 값을 입력한다.
4. 해당 회차의 성공·main 출처·checksum이 확인된 IPA만 제출한다.
5. App Store Connect → TestFlight에서 Apple 처리 상태를 확인한다. 처리 중이면 기다리고, 추가 정보 요청이 있으면 해당 항목을 확인한다.
6. 처리 완료 후 필요한 내부 테스트 그룹에 빌드를 추가한다. 자동 배포 그룹은 이미 추가됐을 수 있다.
7. 사용 가능 메일 수신 후 iPhone의 TestFlight에서 버전·빌드 번호를 확인하고 설치한다. 실행·로그인·주요 화면과 OTA 실제 수신을 별도로 확인한다.

2026-11-08에 앱 **1.0.1 / 빌드 20**의 빌드·제출이 성공했고 사용자가 사용 가능 메일 수신을 확인했다.
이는 실기기 실행 확인과는 다르다. 실행 ID와 완료·미완료 항목은 [검증 이력](../../specs/019-mobile-testflight-delivery/validation.md)을 따른다.

표준 `macos-26` runner에서 Xcode 26.6·Ruby 3.4.12·CocoaPods 1.17.0·fastlane 2.242.0을 확인한다.
검사 로그에 실제·기대 버전을 표시하며, Xcode 출력은 끝까지 받은 뒤 비교한다.
이미지 갱신으로 버전이 달라지면 검사에서 실패하므로 workflow의 도구 버전을 검토한다.
기대 버전은 runner에 설치된 도구를 검사하는 값이며, 도구를 해당 버전으로 설치하는 설정은 아니다.
EAS에 iOS 배포 인증서·프로비저닝 프로필·원격 build number·제출용 App Store Connect API 키를
사전에 준비하고 GitHub에 `EXPO_TOKEN`을 제공해야 한다. 비밀 파일을 artifact에 추가하지 않는다.
공개 저장소의 artifact로 IPA가 공개되므로 앱에 비밀을 포함하지 않는다. 서명 키는 업로드하지 않는다.
artifact가 만료되면 새 build를 실행한다. 빌드 재실행은 새 build number를 사용할 수 있으며,
재실행 시 artifact 이름의 회차도 증가하므로 제출할 회차를 다시 확인한다.
자동 OTA와 수동 작업은 같은 concurrency 그룹을 사용한다. 대기 실행이 취소되면 Actions 결과를 확인한다.
정상 조회 시 이미 게시한 SHA는 생략하지만 조회 실패 시 같은 SHA도 다시 게시될 수 있으므로 실패 시 EAS 대시보드에서 실제 게시 결과를 먼저 확인한다.
문제가 있으면 GitHub에서 자동 OTA workflow를 비활성화하고 실행·대기 작업 종료를 확인한 뒤,
`eas update:rollback`으로 같은 runtime의 정상 업데이트 또는 내장 업데이트로 복구한다.
수정한 main이 준비된 뒤 workflow를 명시적으로 다시 활성화한다. 네이티브 결함은 새 빌드로 수정한다.

영향 판정에 문제가 있으면 게시 단계의 영향 조건을 제거해 항상 OTA를 게시하는 방식으로 복구한다.

Rollback 실전 검증은 아직 수행하지 않았다. 정상 배포를 지금 되돌리지 않고, 실기기 설치와 정상
OTA 수신을 확인한 뒤 테스트 일정·대상 runtime·복구할 업데이트 또는 내장 코드·테스터 영향을
정해 별도 승인 후 진행한다. 복구 후 실기기 동작과 자동 게시 재개까지 확인해야 완료다.

## Pretendard와 SDK 58

루트 레이아웃은 로컬 `assets/fonts/PretendardVariable.ttf`를 `useFonts`로 로드한다. 네이티브
텍스트는 웹 CSS와 달리 서체가 자동 상속되지 않으므로 `Text`와 `TextInput`에 `fontFamily`를
명시한다.

```tsx
<Text style={{ fontFamily: 'Pretendard Variable', fontWeight: '400' }}>안녕하세요</Text>
<TextInput style={{ fontFamily: 'Pretendard Variable', fontWeight: '500' }} />
```

## 검증

모바일 설정 또는 의존성을 바꾸면 다음을 실행한다.

```sh
mise exec -- node --run expo:doctor
mise exec -- node --run check
mise exec -- node --run build

cd apps/mobile
MOBILE_WEB_URL=https://yapp-plus-web.vercel.app mise exec -- pnpm exec expo config --type public
```

로컬 명령은 Apple 또는 Google의 실제 계정 인증을 대체하지 않는다. 네이티브 인증 구현 후에는
development build와 TestFlight에서 로그인, 세션 복원·갱신, 로그아웃, 탈퇴, WebView 복귀를
검증한다.

## 참고 자료

- [Expo 앱 설정](https://docs.expo.dev/workflow/configuration/)
- [EAS 빌드 프로필](https://docs.expo.dev/build/eas-json/)
- [EAS Update runtime version](https://docs.expo.dev/eas-update/runtime-versions/)
- [Expo App version 관리](https://docs.expo.dev/build-reference/app-versions/)

Firebase 푸시 SDK·설정이 추가된 앱 runtime은 1.0.6이다. 1.0.5 기반과 구분하며 새 빌드가 필요하다.

## Expo 버전 검사 임시 예외

기존 1.0.8 설치본의 네이티브 의존성을 유지하기 위해 Expo Doctor가 권장한 업데이트를
이번에는 적용하지 않는다. package.json의 `expo.install.exclude`는 아래 권장 범위의
버전 경고만 임시 제외한다. 나머지 Doctor 검사와 pnpm 공급망 정책은 유지한다.

| 패키지             | 유지하는 lockfile 버전 | 제외하는 권장 범위 |
| ------------------ | ---------------------- | ------------------ |
| expo               | 58.0.26                | ~58.1.0            |
| expo-crypto        | 58.0.8                 | ~58.0.9            |
| expo-dev-client    | 58.0.21                | ~58.0.22           |
| expo-file-system   | 58.0.14                | ~58.0.15           |
| expo-location      | 58.0.22                | ~58.0.23           |
| expo-router        | 58.0.32                | ~58.0.33           |
| expo-splash-screen | 58.0.14                | ~58.0.15           |
| expo-updates       | 58.0.22                | ~58.0.23           |

exclude의 버전 범위는 설치 버전이 아닌 Expo가 제안하는 권장 범위에 적용된다. 다음
네이티브 업데이트에서 의존성을 함께 검증할 때 이 8개 예외를 제거한다. 앱 버전과 runtime은
1.0.8을 유지한다. 예외 적용은 기존 설치본의 OTA·실기기 검증을 대신하지 않는다.
