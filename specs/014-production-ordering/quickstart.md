# 검증 실행

고정 mise 도구로 `.github/scripts/*.test.mts`를 Node 내장 테스트에서 실행한다. actionlint로
워크플로를 검사하고 root check를 실행한다. fixture는 원격 상태 응답을 주입하며 실 배포를
수행하지 않는다.

병합 후 비밀 없는 검증 저장소에서 A→B commit의 CI 완료 순서를 뒤집고, 자동·수동과 앱별
동시 실행을 확인한다. 운영에서는 현재 원격 SHA·공개 결과·배포 로그 연결을 대조한다.
Production timeout·취소 뒤에는 원격 작업 종료와 현재 도메인을 확인하고 배포 기록을
정리하기 전 재개하지 않는다. 실제 배포 검증은 별도 승인 후 수행한다.

원격 종료 확인 후 실제 승격 성공이면 같은 deployment ID에 success·실제 URL을 남깁니다.
이미 다른 상태로 확정됐으면 운영자가 inactive status를 남긴 후 최신 main을 배포합니다.
실제 상태를 모를 때 inactive를 사용해 차단을 우회하지 않습니다. 일반 배포는 과거 SHA를
허용하지 않으며 명시적 롤백에는 별도 승인·외부 배포 기록 정리가 필요합니다.

고정 actionlint 1.7.12의 concurrency.queue 미지원 오류만 CD·수동·Preview 배포 파일에서 제외합니다.
다른 검사는 유지하며 queue 지원 버전으로 갱신할 때 예외를 제거합니다.
