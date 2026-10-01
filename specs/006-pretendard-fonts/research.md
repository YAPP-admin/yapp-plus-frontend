# 조사 결과

## 공식 폰트 자산

Pretendard v1.3.9의 packages/pretendard/dist/web/variable 경로에는 상대 URL을 사용하는
CSS와 92개 WOFF2 조각이 있다. 공식 CSS의 unicode-range, font-weight 45 920,
font-display swap을 유지한다. 전부 preload하거나 next/font/local로 별도 전체 파일을 로딩하지 않는다.

네이티브 가변 배포본은 PretendardVariable.ttf이며 OTF 가변 배포본은 없다. Expo의 OTF 권장은
두 형식이 모두 제공될 때 적용된다. 네이티브에는 전체 글리프를 유지해 서버 데이터와 사용자 이름의
누락을 피한다. 직접 글자 목록을 추출하거나 새 서브셋 생성 도구를 도입하지 않는다.

- https://github.com/orioncactus/pretendard/tree/v1.3.9/packages/pretendard/dist
- https://docs.expo.dev/develop/user-interface/fonts/

## 로딩과 공유

웹은 기존 ui 패키지의 CSS 공개 진입점과 상대 자산 URL을 사용한다. 새 패키지, 앱별 복사
스크립트, 외부 CDN 요청이 필요 없다. 원본 CSS는 포맷터 대상에서 제외한다.

네이티브는 기존 Expo Go 흐름을 유지하도록 useFonts로 로컬 TTF를 등록한다. config plugin만
사용하면 Expo Go에서 적용되지 않는다. 로딩 오류가 앱 시작을 막지 않도록 splash를 해제한다.

## SDK 호환성

사용자가 SDK 58 도입을 선택했다. expo 58.0.0의 bundledNativeModules 목록을 기준으로
React Native, React, Router, WebView, Reanimated, Worklets 등 직접 의존성을 정렬한다.
@webview-bridge/react-native 1.8.0의 peer 범위는 새 React·WebView 버전을 제한하지 않지만
실제 safe-area 브리지는 실행 환경에서 검증해야 한다.

- https://unpkg.com/expo@58.0.0/bundledNativeModules.json
- https://expo.dev/changelog/sdk-58-beta

## 환경 제약

설치된 Node와 pnpm의 정확한 버전을 PATH에 지정해 사용한다. 작업 중 Xcode가 15.4에서 27.0으로
갱신되었으나 라이선스 동의가 남아 네이티브 빌드를 실행하지 못했다. 지원 Xcode 또는 SDK 58용 Expo Go에서
수동 검증한 결과만 완료로 기록한다.

## SDK 58 설치 후 확인

모바일 React 타입은 SDK 58 권장 버전인 @types/react 19.3.0을 expo catalog로 분리한다.

expo-modules-core 58.0.9의 optional peer 범위는 Worklets 0.10까지만 포함하지만 SDK 58의
공식 bundledNativeModules는 Worklets 0.13.0을 지정한다. 권장 조합을 유지하고 peer 범위를
덮어쓰거나 검사를 제외하지 않는다. Expo Doctor와 의존성 검사, iOS export는 통과했지만
Expo Go에서 UI 스레드 worklet 기본 실행까지 확인했다. 자체 iOS Simulator Release 빌드의 컴파일과 시작도 확인했다. 실제 기기와 전체 기능의
호환성은 추가 검증이 필요하다.
