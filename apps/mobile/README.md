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

```sh
cd apps/mobile
mise exec -- pnpm dlx eas-cli@27.4.1 login
mise exec -- pnpm dlx eas-cli@27.4.1 config --platform ios --profile testflight
```

출력에서 `org.yapp.yappplus`, EAS Project ID, `MOBILE_WEB_URL`이 기대값인지 확인한다. 인증서,
App Store Connect API 키, Apple 계정 비밀번호는 저장소·이슈·로그에 기록하지 않는다.

## 개발·TestFlight 명령

```sh
# 실제 기기용 development build
mise exec -- pnpm dlx eas-cli@27.4.1 build --platform ios --profile development

# iOS Simulator 전용 build
mise exec -- pnpm dlx eas-cli@27.4.1 build --platform ios --profile development-simulator

# TestFlight용 아카이브 생성 및 별도 제출
mise exec -- pnpm dlx eas-cli@27.4.1 build --platform ios --profile testflight
mise exec -- pnpm dlx eas-cli@27.4.1 submit --platform ios --profile testflight
```

`testflight`은 EAS remote build number를 자동 증가시킨다. 사용자에게 보이는 `version`은 새 출시
주기를 시작할 때 `app.config.ts`에서 명시적으로 바꾼다. 실제 업로드·제출은 인증 구현과 실제
기기 검증이 끝난 뒤 별도 승인으로 실행한다.

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
- [Expo App version 관리](https://docs.expo.dev/build-reference/app-versions/)
