# 구현 계획: Pretendard 가변 폰트

**브랜치**: `DongjaJ/font` | **명세**: [spec.md](./spec.md) | **이슈**: [#32](https://github.com/YAPP-admin/yapp-plus-frontend/issues/32)

## 요약

웹에는 Pretendard 1.3.9 공식 가변 WOFF2 다이나믹 서브셋을 자체 배포한다. Expo iOS는 SDK 58로
올리고 공식 가변 TTF를 로컬 로딩한다. 공통 CSS 공개 진입점만 추가하고 API·브리지 계약은 유지한다.

## 기술 맥락

- Node.js 24.20.0, pnpm 12.3.4, TypeScript 6.0.3을 사용한다.
- Expo 58.0.0의 bundledNativeModules에 맞춰 React Native 0.88.0-rc.3과 Expo 모듈을 정확한 버전으로 고정한다.
- Expo catalog의 React·React DOM만 19.3.0으로 올리고 웹의 React 19.2.8은 유지한다.
- 기존 Next.js/Turbopack, TanStack Start/Vite, Storybook, vanilla-extract를 사용한다.
- DB·인증·브리지 데이터 변경은 없다. 네이티브 대상은 iOS다.

## 원칙 점검

헌법 파일은 아직 미작성 템플릿이므로 사용자 지침과 AGENTS.md를 적용한다. 공용 웹폰트는
기존 packages/ui에 두고 앱별 공개 진입점 import를 사용한다. 모바일은 웹 UI 패키지에 의존하지
않는다. 외부 폰트 원본을 번역·편집하지 않고 라이선스를 보존한다. 관련 이슈는 #32이며 기존
브랜치를 유지한다. 연구 전·설계 후 모노레포 경계와 최소 변경 원칙을 확인했다.

## 구현 구조

- packages/ui/fonts: 공식 CSS와 92개 WOFF2, 라이선스, 출처. `@yapp-plus/ui/fonts.css`로 공개하고 CSS sideEffects를 선언한다.
- 웹 앱 루트와 Storybook preview: 폰트 CSS를 직접 import한다. 상대 url은 각 번들러가 처리한다.
- packages/ui/src/global.css.ts: 기본 서체를 Pretendard Variable 우선으로 지정한다. 기존 font-synthesis 설정을 유지한다.
- apps/mobile/assets/fonts: 공식 PretendardVariable.ttf와 라이선스·출처를 보관한다.
- apps/mobile/app/_layout.tsx: useFonts와 expo-splash-screen으로 초기 로딩을 처리한다. 성공·실패 모두 splash를 해제하고 실패는 진단 로그로 남긴다.
- Storybook: 문자·굵기·입력 요소를 확인하는 서체 표본을 제공한다.

## 검증과 복구

웹폰트 CSS가 참조하는 모든 파일의 존재·WOFF2 형식과 문자 구간을 검사한다. 네이티브 시작
분기의 대기·성공·실패는 지원 iOS에서 확인한다. check, build, expo:doctor와 Expo 의존성 검사 후 실제 웹
산출물에서 요청·fallback·하위 경로 배포를 확인한다. iOS 실제 렌더링은 지원되는 환경에서 검증한다.

업그레이드 회귀가 발생하면 모바일 의존성·catalog·lockfile·초기 로딩 변경을 함께 되돌려 SDK 57
상태로 복구한다. 웹폰트 변경은 독립적으로 유지할 수 있다. 웹 글꼴 문제가 생기면 소비 앱의
폰트 import와 공통 fontFamily를 이전 상태로 돌리고 재빌드한다. 자동 배포 정책은 수정하지 않는다.
