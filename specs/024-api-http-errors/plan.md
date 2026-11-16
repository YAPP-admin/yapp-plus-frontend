# 구현 계획

## 맥락과 계약

- Hey API 0.99.0·Ky 2·TanStack Query 생성 옵션을 유지한다. 생성 파일은 수정하지 않는다.
- runtimeConfigPath에서 Ky의 throwHttpErrors를 끄고 생성 SDK가 본문 파싱·throw 여부를 소유한다.
- 공통 초기화가 기본 client에 오류 interceptor를 한 번 등록한다. ApiError는 status와 unknown body만 보유한다.
- 앱 초기화·테스트 환경에 적용하고 기존 본문 기반 오류 해석은 body를 읽도록 수정한다.
- 최신 명세의 세션 주소·좌표 필드와 모의 데이터의 계약을 함께 갱신한다.

## 헌법 점검

- c41d6160의 AGENTS와 개발 가이드 기준. 공용 패키지에서 앱을 참조하지 않는다.
- 의존성 추가 없음. 자동 생성 파일은 같은 명세·설정으로 재생성한다.
- 요청·서명 URL·인증 값 보관 없음. 기존 인증 복구와 실패 의미를 기능 테스트로 확인한다.
- SDK 전용 테스트 대신 웹의 실제 생성 Query/Mutation·MSW 통합 테스트로 #160을 재현한다.
- main 대비 800줄 미만, 복구는 본 PR revert. 사진 브랜치의 변경은 포함하지 않는다.

## 실행·검증

1. 실패 재현과 공통 오류 계약 구현.
2. 앱 초기화와 소비자 호환 처리, OpenAPI 재생성 및 모의 데이터 갱신.
3. check·build, 생성 재현성·변경량 확인 후 Draft PR.
