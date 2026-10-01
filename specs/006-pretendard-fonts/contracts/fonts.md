# 폰트 사용 계약

## 웹

소비 앱은 `@yapp-plus/ui/fonts.css`를 전역 CSS 진입점에서 한 번 import하고 기존
`@yapp-plus/ui/styles`를 함께 사용한다. 폰트 이름은 `Pretendard Variable`이며 일반적인
굵기는 CSS font-weight로 지정한다. 공식 CSS와 상대 WOFF2 자산은 한 단위로 갱신한다.

## 네이티브

앱 시작 시 `Pretendard Variable` 이름으로 로컬 가변 TTF를 등록한다. Text와 TextInput은
fontFamily와 fontWeight를 명시한다. 웹 CSS처럼 모든 네이티브 글자에 자동 상속되지 않는다.
현재 제품에는 네이티브 텍스트 화면이 없으므로 새 공용 Text 컴포넌트는 추가하지 않는다.

로딩 실패는 진단 가능해야 하며 splash가 계속 표시되어서는 안 된다. 네이티브 등록은 웹뷰의
웹폰트 로딩을 대체하지 않는다.
