# 구현 계획: Preview 댓글의 최신성 보존

## 기술 맥락

GitHub Actions YAML, Node 24의 내장 테스트, gh CLI, 고정 Vercel CLI 59.13.1을 사용한다.
새 의존성은 추가하지 않는다. 배포 외부 계약은 기존 액션 입력을 유지한다.

## 규칙 확인

현재 base의 constitution은 미완성 템플릿이므로 AGENTS.md를 적용한다. #138에서 문서 정합성을
별도로 처리한다. 생성 코드 수정 없음, 최소 권한 유지, 실제 base 대비 800줄 미만을 확인한다.

## 설계

같은 PR·앱의 job concurrency에 queue:max를 적용한다. 작업 시작과 댓글 쓰기 직전에 PR
state·repo·head를 확인한다. gh 실패는 오류로 끝내고 성공으로 간주하지 않는다. 댓글 쓰기도
같은 잠금 안에서 수행한다. workflow_run YAML은 main 버전이 실행되므로 병합 후 검증한다.

## 검증과 복구

경계 fixture, actionlint, root check를 실행한다. 실제 배포는 하지 않는다. 회귀 시 워크플로를
중지하고 이전 코드로 복구한다. 진행 중 원격 작업의 종료를 확인하기 전에 잠금을 우회하거나
배포를 재개하지 않는다. 운영 실행표는 quickstart.md에 기록한다.
