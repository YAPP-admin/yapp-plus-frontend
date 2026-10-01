declare module '*.ttf' {
  // Metro는 번들에 포함한 폰트 파일을 숫자형 자산 ID로 변환합니다.
  const asset: number;
  export default asset;
}
