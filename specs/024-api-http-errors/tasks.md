# 작업·검증 결과

- [x] 최신 공개 OpenAPI 조회·재생성. SDK 경로·operation 변경 없음.
- [x] runtimeConfigPath와 공통 ApiError interceptor, 세 앱 초기화 연결.
- [x] 기존 출석 코드·미대상 분기와 모의 데이터 계약 보존.
- [x] 실제 SDK·mutation 통합 테스트: JSON·텍스트·빈 본문, 반복 초기화, 전송 실패·취소·성공 응답 검증 오류.
- [x] check 통과. 최종 웹 454개·관리자 659개 새 실행, 모바일 268개·브리지 78개·UI 10개 캐시 재사용.
- [x] build 통과. 웹·관리자 새 실행, Storybook 캐시 재사용. 기존 큰 청크 경고 유지.
- [x] 동일 명세 재생성 해시 일치. 생성 파일 수동 변경 없음.

명세 SHA-256: 78456cdbb54b47ba614b2be082fc0da88a4ae8ac96539015b44fe22bac0f68e6.
입력은 2026-11-16의 공개 /v3/api-docs이며 로컬 .context/backend-openapi-current.json에 보관했다.
모바일 설정·의존성을 변경하지 않아 expo:doctor는 대상이 아니다. 실서버 mutation·실기기·배포는 미실행이다.
초기 검사는 새 응답 필드 누락·이전 오류 형태 기대값 때문에 실패했고 해당 소비자·fixture를 수정한 뒤 통과했다.
