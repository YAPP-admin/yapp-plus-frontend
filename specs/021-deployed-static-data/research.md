# 조사 결과

- 생성 client는 전역 kyOptions와 요청별 kyOptions를 얕게 병합한다. 전역 fetch와 요청별 인증 hooks를 병존시킬 수 있다.
- nativeAuthClientOptions는 실제 GET 401 갱신 훅을 제공한다. 이 파일의 인증 정책은 수정하지 않는다.
- 현재 개발 worker는 대상 외 생성 handler도 등록하므로 production에 그대로 활성화하지 않는다.
- WebView의 Service Worker 지원 여부에 의존하지 않는 fetch 연결을 선택한다.
- 생성 응답 타입·기존 검증기를 재사용하고 임의의 성공 응답으로 인증 오류를 덮지 않는다.
- 기존 fixture의 미래 일정과 공지 데이터를 공통 원본으로 사용한다. 무작위 faker는 배포 데이터에 넣지 않는다.
