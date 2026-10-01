# 검증 결과

**검증일**: 2026-10-01  
**이슈**: [#32](https://github.com/YAPP-admin/yapp-plus-frontend/issues/32)  
**상태**: 구현·자동 검증·Expo Go 및 자체 iOS Simulator Release 실행 점검 완료, 실제 기기·웹 상세 검증 미완료

## 통과

| 항목                       | 결과                                                                    |
| -------------------------- | ----------------------------------------------------------------------- |
| node --run check           | 포맷·린트·타입·테스트 통과                                              |
| 테스트                     | 25개 통과: 브리지 17, UI 6, web 1, admin 1                              |
| node --run build           | Next.js, 관리자 웹, Storybook production 빌드 통과                      |
| node --run expo:doctor     | 20/20 통과                                                              |
| expo install --check       | 의존성 버전 일치                                                        |
| expo export --platform ios | 1,146개 모듈 번들 및 가변 TTF 포함 확인                                 |
| 폰트 원본 검사             | WOFF2 92개 형식·길이·로컬 참조와 한글 11,172개 음절·기본 영문 구간 확인 |
| 빌드 자산 검사             | 세 웹 앱 각각 WOFF2 참조 92개, 누락 0개, 원격 폰트 URL 0개              |
| git diff --check           | 공백 오류 없음                                                          |

사용자 요청에 따라 네이티브 모듈을 모킹하는 모바일 폰트 로딩 테스트와 전용 설정·의존성을
제거했다. 성공·실패 시 앱 시작은 아래 iOS 실행 점검에서 확인했다.
웹폰트 파일 누락과 CSS 문자 구간을 확인하는 자산 검사는 유지한다.

원본 자산은 v1.3.9 고정 경로에서 받아 그대로 보관했다. 네이티브 TTF SHA-256은
3090ccde0442bb347aa7685d9ba8b17436a60682df6e8f92a9a670de14056e22다.
웹 기본 서체뿐 아니라 SEED의 --seed-font-family를 html:root에서 지정해 기본 :root보다
우선하도록 했다. 입력 요소는 서체를 상속한다.

## 남은 검증과 경고

- 브라우저 도구가 관리 정책을 확인하지 못해 로컬 페이지 접근을 거부했다. 다른 수단으로
  브라우저 제한을 우회하지 않았다. 실제 글꼴 렌더링, 화면별 요청 수, 네트워크 실패 fallback,
  Storybook 하위 경로의 실제 요청, 키보드·스크린 리더·터치 검증은 미완료다.
- Xcode 27.0 (27A266a)의 초기 구성요소 설치가 완료됐고, xcodebuild -checkFirstLaunchStatus가
  exit 0을 반환했다. iPhone 15 Pro / iOS 17.5 / Expo Go 58.0.2에서 SDK 58 앱을 실행했다.
- 실제 기기, 배포용 앱 식별자·서명, 전체 Worklets 기능과 정밀한 splash 전환 품질은 별도
  검증이 필요하다. 시뮬레이터 Release 실행 결과를 App Store 배포 검증으로 해석하지 않는다.
- pnpm peers check에는 expo-modules-core 58.0.9의 Worklets 범위와 SDK 58 권장 Worklets
  0.13.0 사이의 경고가 남는다. 공식 SDK 권장 조합을 유지했으며 예외 설정으로 숨기지 않았다. Expo Go의 UI 스레드에서
  runOnUISync로 6 × 7을 실행해 42를 반환하는 기본 동작은 통과했다.
- Storybook 빌드에는 큰 청크 안내가 있다. 이는 폰트 파일 로딩과 별개다.

## iOS 실행 점검

2026-10-01, Xcode 27.0 / iPhone 15 Pro / iOS 17.5 / Expo Go 58.0.2에서 확인했다.
임시 네이티브 표본과 진단 로그를 추가해 실행한 뒤 제품 코드를 원상 복구했다.

- 정상 파일: isLoaded('Pretendard Variable')가 true이며, Text의 400·500·700 굵기와
  TextInput의 한글·영문·숫자 표본이 렌더링됐다.
- 앱 종료 후 재실행: 폰트 등록과 화면 진입이 다시 성공했다.
- 실패 주입: 존재하지 않는 file URI로 교체한 뒤 앱을 종료·재실행했다. isLoaded가 false이고
  시스템 글꼴 fallback 경고가 출력됐지만 화면과 WebView는 계속 시작됐다.
- 복구: 원래 TTF로 되돌리고 앱을 재실행해 isLoaded true를 다시 확인했다.
- safe-area: 네이티브 top 59 / right 0 / bottom 34 / left 0을 확인했다. 웹이 호출한
  getSafeAreaInsets 핸드셰이크에서 같은 값이 반환되는 것을 네이티브 로그로 확인했다.
  웹 DOM의 최종 CSS 변수 값은 직접 조회하지 않았다.
- Worklets: UI 스레드 worklet 실행 결과 42를 확인했다. peer 메타데이터 경고는 여전히 남는다.
- Expo Go 안내창은 Expo CLI의 m 명령으로 닫았다. 이후 첫 페이지 전체 화면과 안전 영역이
  정상 표시되는 것을 확인했다. macOS의 자동 클릭 권한이 없어 터치 상호작용은 검증하지 않았다.
- 기본 제품 코드로 복구한 후에도 WebView 연결이 성공했다.

Expo CLI의 --localhost 실행은 서버가 IPv6 ::1에 바인딩됐지만 127.0.0.1 주소를 열어 최초
연결에 실패했다. exp://localhost:8081로 열어 해결했다. WebView에는 실행 환경 변수로
MOBILE_WEB_URL=http://localhost:3100을 지정했다. 저장소의 기본 URL 정책은 변경하지 않았다.

Expo Go에서는 기존 app.config.ts의 scheme 미설정 안내만 출력됐지만, 자체 Release 앱에서는
초기 URL 생성 예외로 종료됐다. 아래 자체 빌드 점검에서 scheme을 보완하고 재검증했다.

스크린샷과 진단 기록은 로컬 .context/ios-font-probe-verified.png,
.context/ios-font-probe-failure.png, .context/ios-dev-menu-toggle.png,
.context/ios-font-probe/results.json에 보관했다.

## 자체 iOS Release 빌드

Xcode 27.0 / iPhone 15 Pro / iOS 17.5에서 서명된 시뮬레이터용 앱을 로컬로 빌드했다.
스토어 배포·EAS 업로드·실제 기기용 인증서 작업은 하지 않았다.

```sh
MOBILE_WEB_URL=http://localhost:3100 pnpm --filter @yapp-plus/mobile exec expo prebuild --platform ios --no-install
MOBILE_WEB_URL=http://localhost:3100 pnpm --filter @yapp-plus/mobile exec expo run:ios --configuration Release --device 201135C4-BD20-4421-8E08-B50B458BB344 --no-bundler
```

- Release 컴파일·링크·시뮬레이터 설치 성공: ExpoFont 58.0.4, ExpoModulesCore/Worklets 58.0.9,
  RNWorklets 0.13.0 포함. Expo CLI 결과는 오류 0개, 경고 1개였다.
- 첫 실행에서 scheme 미설정으로 Expo Router 초기 URL 생성이 실패해 앱이 종료됐다.
  기존 임시 Bundle ID와 동일한 com.yappplus.placeholder.mobile을 app.config.ts의 scheme으로
  명시하고 CNG 재생성·Release 재빌드 후 정상 진입을 확인했다. 앱 식별자 확정 시 함께 변경한다.
- Metro 8081 서버를 종료한 상태에서 설치된 앱을 simctl launch로 직접 실행해 WebView의
  YAPP+ 첫 페이지가 표시되는 것을 확인했다. WebView 콘텐츠 서버 3100은 실행 상태다.
- 앱 번들에 main.jsbundle과 6,739,336바이트 PretendardVariable.ttf가 포함됐다. TTF의
  SHA-256은 저장소 원본과 일치한다. 폰트 로딩 실패 경고나 치명적 JS 예외는 수정 후 없었다.
- 런타임 로그에는 ExpoModulesCore의 actor 격리 경고와 기본 SplashScreen 이미지 참조 경고가
  남는다. 이번 시뮬레이터에서 화면 진입을 막지는 않았지만 실제 기기·배포 준비 시 재확인한다.
  이를 숨기기 위한 컴파일 옵션이나 경고 예외는 추가하지 않았다.
- 네이티브 프로젝트·Pods·빌드 산출물은 기존 Git ignore 규칙에 따라 커밋에서 제외한다.
  임시 진단용 화면은 Release 빌드에 포함하지 않았다.

로컬 결과는 .context/native-build/release-build-scheme.log,
.context/native-build/release-launch-scheme.log와 .context/ios-release-home.png에 보관한다.

## 웹 사용자 관찰

사용자가 개발 서버의 첫 페이지에서 서브셋 88~91 네 개의 요청을 확인했다. 첫 페이지 문구와
공식 CSS 문자 구간을 대조했으며, 네 파일의 원본 크기 합계는 106,352바이트다.
실제 네트워크 전송량·캐시 조건은 독립 측정하지 않았다.

## 복구

모바일 문제가 생기면 SDK·React catalog·lockfile과 폰트 초기 로딩을 함께 SDK 57 기준으로
복구하고 재설치한다. 웹폰트는 독립적으로 유지 가능하다. 웹 문제가 생기면 소비 앱의 폰트
CSS import와 공통 font-family 변경을 되돌리고 재빌드한다.
