# Pretendard 웹폰트

Pretendard **v1.3.9**의 공식 가변 다이나믹 서브셋이다. CSS와 92개 WOFF2 파일은 원본을 그대로
보관한다. 원본 CSS는 Oxfmt 대상에서 제외한다. 라이선스는 같은 디렉터리의 LICENSE에 있다.

- [공식 안내](https://github.com/orioncactus/pretendard#가변-다이나믹-서브셋)
- [고정 버전 원본](https://github.com/orioncactus/pretendard/tree/v1.3.9/packages/pretendard/dist/web/variable)
- WOFF2 합계: 2,957,724바이트. 화면에 필요한 문자 구간만 다운로드한다.

## 사용

소비 앱의 전역 CSS 진입점에서 `@yapp-plus/ui/fonts.css`를 한 번 import한다. 기존
`@yapp-plus/ui/styles`가 기본 서체와 SEED font-family를 설정한다. 굵기는 font-weight로 지정한다.

CSS의 상대 url을 번들러가 처리하므로 별도 public 복사나 외부 CDN 연결은 필요 없다. 모든 파일을
preload하거나 전체 폰트를 추가로 로딩하면 서브셋의 전송량 절감 효과가 없어질 수 있다.

font-synthesis: none은 기존 설정을 유지한다. 실제 가변 굵기는 사용할 수 있지만 공식 서체에
없는 기울임을 브라우저가 합성하지 않는다. 기울임이 필요한 디자인은 실제 지원 서체를 선택한다.

## 갱신

공식 버전의 CSS·woff2-dynamic-subset 디렉터리·LICENSE를 함께 교체한다. 자체적으로 문자
범위를 줄이거나 CSS를 직접 편집하지 않는다. 이후 자산 테스트와 세 웹 앱의 빌드를 실행하고
Storybook 서체 표본, 하위 경로 배포, 폰트 요청 실패를 검증한다.
