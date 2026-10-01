# 작업 목록: Pretendard 가변 폰트

## 준비와 기반

- [x] T001 요구사항·계획·조사를 specs/006-pretendard-fonts/에 기록한다.
- [x] T002 공식 웹·네이티브 자산과 라이선스를 packages/ui/fonts/ 및 apps/mobile/assets/fonts/에 보관한다.

## US1 — 웹의 일관된 서체

**독립 검증**: 세 웹 소비 앱의 production 산출물에서 실제 서체, 요청 수와 fallback을 확인한다.

- [x] T003 [US1] packages/ui/src/fonts.test.ts에서 CSS 자산 참조와 문자 범위를 검증한다.
- [x] T004 [US1] packages/ui/package.json에 폰트 CSS를 공개하고 packages/ui/src/global.css.ts의 서체를 변경한다.
- [x] T005 [US1] apps/web/src/app/layout.tsx, apps/admin/src/routes/__root.tsx, apps/storybook/.storybook/preview.tsx에 폰트를 연결한다.
- [x] T006 [US1] apps/storybook/stories/typography.stories.tsx에 문자·굵기·입력 표본을 추가한다.

## US2 — 네이티브 가변 서체

**독립 검증**: 지원 iOS에서 폰트 로딩 대기·성공·실패, 렌더링과 브리지를 확인한다.

- [x] T007 [US2] apps/mobile/package.json, pnpm-workspace.yaml, pnpm-lock.yaml을 SDK 58 기준으로 정렬한다.
- [x] T008 [US2] apps/mobile/app/_layout.tsx에 로컬 폰트와 splash 처리를 추가한다.
- [x] T009 [US2] apps/mobile/README.md에 폰트 지정법·SDK 58 개발 환경·복구 절차를 기록한다.

## 마무리

- [x] T010 자동 품질 게이트와 빌드를 실행하고 specs/006-pretendard-fonts/validation.md에 결과를 기록한다.
- [ ] T011 웹 브라우저의 로딩·fallback·하위 경로 배포를 검증하고 specs/006-pretendard-fonts/validation.md에 기록한다.
- [x] T012 iOS Simulator와 Expo Go에서 굵기·시작·웹뷰·브리지 기본 실행 점검 결과를 specs/006-pretendard-fonts/validation.md에 기록한다.
- [x] T013 자체 iOS Simulator Release 빌드·설치·Metro 없는 시작과 웹뷰 진입을 검증한다.
- [ ] T014 실제 기기의 터치·접근성, 배포용 서명과 splash 전환 품질을 검증한다.

## 의존성과 진행 방식

T001 → T002 → US1·US2 → T010·T011·T012 순서다. 웹의 T003~~T006과 모바일의
T007~~T009는 파일 소유가 분리되어 병렬 실행할 수 있으나 실제 작업은 검증 가능한 순서로 진행한다.
US1을 먼저 빌드해 웹 자산 배포를 검증하고 US2를 추가한다. 외부 배포·commit·push는 별도 승인 대상이다.

T011은 브라우저 관리 정책 확인 실패로 상세 검증이 남아 있다. 사용자가 첫 페이지의 서브셋
88~91 요청을 확인했다. T012는 Xcode 초기 설정 완료 후 Expo Go에서 기본 실행을 점검했다.
T013은 자체 Release 빌드로 점검하고 scheme 누락에 따른 시작 오류를 수정했다. 실제 기기
검증은 T014로 분리했다. 검증 범위와 제한은 validation.md에 기록한다.
