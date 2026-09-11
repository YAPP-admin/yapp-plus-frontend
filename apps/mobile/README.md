# 모바일 셸과 iOS EAS 준비

이 앱은 Expo/React Native 기반의 iOS WebView 셸이다. iOS 앱은 이 워크스페이스에서 EAS로
빌드하고, Android 앱은 별도 Native 프로젝트에서 개발하고 배포한다.

## 플랫폼 책임 경계

| 항목      | iOS                            | Android                        |
| --------- | ------------------------------ | ------------------------------ |
| 소스      | `apps/mobile`                  | 별도 Native 프로젝트           |
| 빌드      | Expo Application Services(EAS) | Android Native 빌드 체계       |
| 배포      | App Store Connect              | Google Play Console            |
| 앱 식별자 | 이 프로젝트에서 확정           | Android 프로젝트에서 별도 확정 |

`apps/mobile`에서는 Android 빌드와 배포를 구성하지 않는다. 현재 `app.config.ts`의 임시
`android.package`는 iOS EAS 설정을 적용할 때 제거하고, Android 팀이 사용할 package 이름을 이
프로젝트에서 선점하지 않는다.

## 앱 식별자와 버전

앱 식별자는 빌드 결과로 생성되는 값이 아니라 첫 배포 전에 팀이 정하는 값이다.

| 설정                   | 역할                                              | 변경 정책                              |
| ---------------------- | ------------------------------------------------- | -------------------------------------- |
| `ios.bundleIdentifier` | App Store에서 앱을 구분하는 고유 식별자           | 기존 앱의 수명 동안 유지               |
| `slug`                 | Expo 프로젝트를 나타내는 사람이 읽을 수 있는 이름 | 프로젝트 생성 후 유지 권장             |
| `extra.eas.projectId`  | EAS가 발급하는 프로젝트 UUID                      | 같은 EAS 프로젝트를 사용하는 동안 유지 |
| `version`              | 사용자에게 표시하는 출시 버전                     | 제품 출시 단위로 변경                  |
| `ios.buildNumber`      | 같은 버전의 iOS 빌드를 구분하는 번호              | App Store 제출 빌드마다 증가           |

이미 App Store Connect에 앱이 존재한다면 그 앱의 Bundle ID를 그대로 사용한다. 신규 앱이라면
Apple Developer 계정 관리자가 조직의 명명 규칙과 중복 여부를 확인한 뒤 새 Bundle ID를
등록한다. 임시값인 `com.yappplus.placeholder.mobile`로 배포 빌드를 만들지 않는다.

개발용 앱과 운영 앱을 한 기기에 동시에 설치해야 할 요구가 생기기 전에는 별도의 개발용 Bundle
ID를 만들지 않는다. 로컬 개발은 Expo Go를 사용한다.

## 설정 전 협의 체크리스트

### 앱과 계정

- [ ] 기존 App Store 앱을 연결할지 신규 앱을 만들지 결정한다.
- [ ] 앱 표시 이름과 iOS Bundle ID를 확정한다.
- [ ] Apple Developer Team과 App Store Connect 관리자를 지정한다.
- [ ] App Store 제출과 실제 기기 내부 배포에 필요한 유료 Apple Developer Program 가입 상태를
      확인한다.
- [ ] Expo 소유 조직이 `yapp-plus-official`인지 확인한다.
- [ ] Expo `slug`와 URL `scheme`을 확정한다.
- [ ] EAS 인증서와 프로비저닝 프로파일 관리 담당자를 정한다.

### 실행 환경

- [ ] Preview와 Production의 HTTPS Web URL을 확정한다.
- [ ] `MOBILE_WEB_URL`을 누가 EAS 환경변수로 관리할지 정한다.
- [ ] Preview를 iOS Simulator, 등록 기기용 Ad Hoc 또는 TestFlight 중 어떤 방식으로 배포할지
      결정한다.
- [ ] TestFlight 검수 담당자와 Production 제출 승인자를 정한다.
- [ ] 앱 버전과 iOS Build Number 증가 방식을 정한다.

### iOS와 Android의 공통 계약

- [ ] 로그인, 토큰 만료와 로그아웃 동작을 합의한다.
- [ ] Universal Link URL과 화면 이동 규칙을 합의한다.
- [ ] 푸시 알림 payload와 기기 토큰 등록 규칙을 합의한다.
- [ ] 분석 이벤트 이름과 필수 속성을 합의한다.
- [ ] 최소 지원 버전과 강제 업데이트 정책을 합의한다.
- [ ] 카메라, 사진, 알림 등 권한과 개인정보 처리 문구를 합의한다.

공통 API와 브리지 메시지는 API 명세와 `@yapp-plus/app-bridge` 공개 계약을 기준으로 관리한다.
Android Native 앱이 WebView 브리지를 사용하지 않더라도 인증, 딥링크, 푸시와 분석 이벤트의 외부
계약은 플랫폼 간에 일치시킨다.

## 목표 `app.config.ts` 구조

협의가 끝나면 임시값을 확정값으로 교체한다. 아래 값은 예시가 아니라 입력 위치를 나타내는
자리표시자이므로 그대로 사용하지 않는다.

```ts
const config: ExpoConfig = {
  name: '<확정한 앱 표시 이름>',
  slug: '<확정한 Expo slug>',
  owner: 'yapp-plus-official',
  scheme: '<확정한 URL scheme>',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: '<확정한 iOS Bundle ID>',
    supportsTablet: false,
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    mobileWebUrl: configuredWebUrl.length > 0 ? configuredWebUrl : null,
    eas: {
      projectId: '<EAS가 발급한 projectId>',
    },
  },
};
```

`extra.eas.projectId`는 비밀값이 아니므로 저장소에 기록한다. EAS가 발급하기 전에는 임의의 UUID나
가짜 값을 넣지 않는다.

## 외부망에서 EAS 연결

EAS CLI는 저장소의 재현성을 위해 정확한 버전을 개발 의존성으로 고정한다. 팀이 사용할 버전을
확정한 뒤 저장소 루트에서 다음 명령을 실행한다.

아래 `X.Y.Z`를 확정한 버전으로 바꾼 뒤 실행한다.

```sh
pnpm --filter @yapp-plus/mobile add --save-dev --save-exact eas-cli@X.Y.Z
```

모노레포에서는 모든 EAS 명령을 Expo 앱 루트에서 실행한다.

```sh
cd apps/mobile
mise exec -- pnpm exec eas login
```

Expo 대시보드에 프로젝트가 없다면 `yapp-plus-official` 조직에 새 프로젝트를 연결한다.

```sh
mise exec -- pnpm exec eas init --account yapp-plus-official
```

대시보드에 연결할 프로젝트가 이미 있다면 새로 만들지 않고 기존 Project ID를 사용한다.

```sh
EAS_PROJECT_ID='실제 EAS Project ID'
mise exec -- pnpm exec eas init --id "$EAS_PROJECT_ID"
```

`app.config.ts`는 동적 설정 파일이므로 CLI가 자동으로 수정하지 못하면 명령이 출력한 `projectId`를
`extra.eas.projectId`에 직접 입력한다. 그다음 iOS 빌드 설정만 생성한다.

```sh
mise exec -- pnpm exec eas build:configure --platform ios
```

Android용 `build:configure` 또는 `eas build --platform android`는 실행하지 않는다.

## EAS 환경과 빌드 프로필

Expo 대시보드에서 환경별 `MOBILE_WEB_URL`을 등록한다. Preview와 Production 빌드에서
`localhost`를 사용하지 않으며 실제 기기가 접근할 수 있는 HTTPS 주소를 사용한다.

| EAS 환경   | `MOBILE_WEB_URL` |
| ---------- | ---------------- |
| Preview    | 스테이징 Web URL |
| Production | 운영 Web URL     |

`MOBILE_WEB_URL`은 비밀값이 아니지만 환경별 값은 저장소에 직접 넣지 않는다. 인증서, 토큰과
App Store Connect 인증 정보는 저장소, 문서 또는 로그에 기록하지 않는다.

로컬 개발은 Expo Go를 사용하므로 당장 별도의 Development Build 프로필을 만들지 않는다.
`eas build:configure`가 `development` 프로필을 자동으로 생성하더라도 `expo-dev-client`를 도입하기
전에는 제거한다. `eas.json`은 우선 내부 설치용 `preview`와 스토어 제출용 `production`만 유지하고,
각 프로필이 사용할 EAS 환경을 명시한다.

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "environment": "preview"
    },
    "production": {
      "environment": "production"
    }
  },
  "submit": {
    "production": {}
  }
}
```

Production의 iOS Build Number는 EAS `autoIncrement` 사용 여부를 팀이 결정한 뒤 적용한다.

### Preview 배포 방식

`preview`의 `distribution: "internal"`은 iOS 실제 기기에서 Ad Hoc 배포를 사용한다. Expo Free
플랜과 Apple Developer Program은 별개이며, Ad Hoc 배포에는 유료 Apple Developer Program과 설치할
기기의 UDID 등록이 필요하다. 새 기기를 추가하면 해당 기기가 포함된 프로비저닝 프로파일로 다시
빌드하거나 기존 빌드를 다시 서명해야 한다.

시뮬레이터에서 EAS 결과물만 검증하려면 실제 기기용 Preview와 분리된 프로필을 추가한다.

```json
{
  "build": {
    "preview-simulator": {
      "extends": "preview",
      "ios": {
        "simulator": true
      }
    }
  }
}
```

```sh
mise exec -- pnpm exec eas build --platform ios --profile preview-simulator
```

`preview-simulator` 결과물은 iOS Simulator 전용이며 실제 기기나 TestFlight에 설치할 수 없다.
TestFlight 검증은 `production` 빌드를 App Store Connect에 업로드한 뒤 진행한다.

내부 배포 URL은 기본적으로 URL을 아는 사람이 접근할 수 있다. Preview가 비공개 스테이징 서비스에
연결된다면 Expo 프로젝트 설정에서 **Unauthenticated access to internal builds**를 비활성화하고,
승인된 Expo 계정만 빌드를 내려받을 수 있게 한다.

Kakao 로그인, 푸시처럼 Expo Go에 포함되지 않은 네이티브 모듈을 도입하면 Expo Go만으로 검증하지
않는다. 해당 기능의 요구사항이 확정된 시점에 `expo-dev-client`와 별도의 Development Build 프로필을
추가한다.

## 검증과 빌드

설정 변경 후 공개 Expo 설정에 임시 식별자와 `localhost`가 남아 있지 않은지 로컬에서 먼저
확인한다.

```sh
cd apps/mobile
mise exec -- pnpm exec expo config --type public
```

로컬 명령만으로는 EAS에 저장된 `MOBILE_WEB_URL`이 적용되었는지 증명할 수 없다. 외부망에서 EAS
프로필까지 해석한 결과를 Preview와 Production 각각 확인한다.

```sh
mise exec -- pnpm exec eas config --platform ios --profile preview
mise exec -- pnpm exec eas config --platform ios --profile production
```

출력된 `extra.mobileWebUrl`이 각 환경의 HTTPS 주소이고, `ios.bundleIdentifier`와
`extra.eas.projectId`가 확정값인지 확인한다. 인증 정보나 다른 민감한 환경변수가 출력될 수 있는
명령 결과는 이슈, PR 또는 로그에 그대로 붙이지 않는다.

저장소 루트에서 모바일 설정과 기본 품질 게이트를 검증한다. 배포 설정을 변경했으므로 전체 빌드도
확인한다.

```sh
mise exec -- node --run expo:doctor
mise exec -- node --run check
mise exec -- node --run build
```

첫 EAS 빌드는 Production 제출 전에 Preview 프로필로 검증한다.

```sh
cd apps/mobile
mise exec -- pnpm exec eas build --platform ios --profile preview
```

설치, WebView 접속, 로그인, 딥링크와 필수 권한을 실제 기기에서 확인한 뒤 Production 빌드와
App Store 제출을 별도 승인 절차로 진행한다. EAS Update는 OTA 업데이트 정책이 확정되기 전에는
구성하지 않는다.

## 참고 자료

- [Expo 앱 설정](https://docs.expo.dev/workflow/configuration/)
- [모노레포에서 EAS Build 사용](https://docs.expo.dev/build-reference/build-with-monorepos/)
- [`eas.json` 빌드 프로필](https://docs.expo.dev/build/eas-json/)
- [EAS 환경변수 관리](https://docs.expo.dev/eas/environment-variables/manage/)
