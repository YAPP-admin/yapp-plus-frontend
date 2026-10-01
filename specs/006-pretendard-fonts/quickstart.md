# 검증 절차

## 자동 검사

저장소에 고정된 Node.js와 pnpm을 사용한다.

```sh
node --run check
node --run build
node --run expo:doctor
pnpm --filter @yapp-plus/mobile exec expo install --check
pnpm --filter @yapp-plus/mobile exec expo export --platform ios
```

## 웹

web·admin과 빌드된 Storybook을 실행한다. Storybook의 서체 표본에서 한글·영문·숫자·기호와
400·500·700 굵기, 입력 요소, 버튼의 실제 렌더링을 확인한다. 개발자 도구에서 font-family
값만 확인하지 말고 폰트 로딩과 실제 적용된 폰트도 확인한다.

캐시를 비운 첫 접속에서 폰트 요청이 같은 출처의 WOFF2인지 확인한다. 92개 전체 파일보다
적게 요청해야 한다. 네트워크 차단 상태에서도 콘텐츠를 읽고 입력·버튼을 사용할 수 있어야 한다.
Storybook은 임의 하위 경로에서도 열어 폰트 요청 404가 없는지 확인한다.

## iOS

SDK 58을 지원하는 Expo Go 또는 지원 Xcode로 빌드한 앱을 사용한다. 현재 Xcode 27.0은
설치되었으나 최초 실행의 라이선스 동의가 남아 있다. 실제 확인 전까지 아래 항목은 미검증이다.

- Text·TextInput에 Pretendard Variable과 400·500·700을 지정해 한글과 영문을 확인한다.
- 폰트 로딩 정상·실패 후 모두 splash가 해제되는지 확인한다.
- 웹뷰 연결, safe-area 브리지와 시스템 테마 전환을 확인한다.

실행 결과와 환경 제한은 validation.md에 기록한다.
