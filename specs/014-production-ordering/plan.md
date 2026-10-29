# 구현 계획: Production 승격 직렬화와 최신성

## 기술 맥락

GitHub Actions YAML, Node 24의 내장 테스트, gh CLI, 고정 Vercel CLI 59.13.1을 사용한다.
새 의존성은 추가하지 않는다. 배포 외부 계약은 기존 액션 입력을 유지한다.

## 규칙 확인

현재 base의 constitution은 미완성 템플릿이므로 AGENTS.md를 적용한다. #138에서 문서 정합성을
별도로 처리한다. 생성 코드 수정 없음, 최소 권한 유지, 실제 base 대비 800줄 미만을 확인한다.

## 설계

앱별 공통 job concurrency에 queue:max를 적용한다. Production 업로드는 --skip-domain으로
준비하고 latest-main 및 이전 승격 상태 확인 후 begin 기록→promote→success 기록 순서로
실행한다. timeout·취소 후 미완료 기록은 새 승격을 막는다. 비교 baseline은 #131을 재사용한다.

## 검증과 복구

경계 fixture, actionlint, root check를 실행한다. 실제 배포는 하지 않는다. 회귀 시 워크플로를
중지하고 이전 코드로 복구한다. 진행 중 원격 작업의 종료를 확인하기 전에 잠금을 우회하거나
배포를 재개하지 않는다. 운영 실행표는 quickstart.md에 기록한다.
