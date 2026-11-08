# 검증 절차

1. mise exec -- node --run check, mise exec -- node --run build를 실행하고 캐시 여부를 기록한다.
2. VITE_STATIC_CONTENT=true production 빌드를 localhost에서 실행한다.
3. 홈의 세션 없음, 일정 3개, 홈·게시판·상세의 동일 공지와 읽음 상태를 확인한다.
4. 앱 WebView에서 실제 로그인 유지와 같은 콘텐츠를 확인한다. 테스트 계정이 없으면 미검증으로 기록한다.
5. query options 테스트로 정적 조회의 네트워크 미사용과 모드 해제 시 API 복귀를 확인한다. 인증·회원·출석 내역·점수는 기존 API 테스트를 유지한다.
6. VITE_STATIC_CONTENT=false로 새 빌드 후 실제 API 경로 복구를 확인한다.
7. 미리보기 확인은 배포 완료로 보고하지 않는다.
