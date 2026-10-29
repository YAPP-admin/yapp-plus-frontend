# 배포 시도와 비교 범위

- 시도: GitHub deployment ID, checkout SHA, `production-<Vercel project ID>` 환경,
  `deploy:yapp-plus` task. 배포 전에 생성되며 생성 실패 시 배포하지 않는다.
- 상태 없음·실패·진행 중: 실제 서비스 상태를 확정할 수 없으므로 강제 배포한다.
- success: Vercel deploy가 성공한 뒤 URL과 workflow 로그를 같은 deployment에 연결한다.
- baseline: 가장 최근 시도(ID 기준)의 최신 status가 success이고 SHA가 HEAD의 조상인 경우만 사용한다.
- 이력 없음·유실 commit·비조상 commit: `force_all=true`. API 오류·잘못된 응답: 명령 실패.
- 비교 출력: `base_sha`, `force_all`. 성공 기록 출력: `deployment_id`.

내부 workflow용 CLI이며 제품 공개 API·타입은 바뀌지 않는다. 동시 실행의 완료 순서 제어는 #132다.
