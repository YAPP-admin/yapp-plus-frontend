# 조사 결정

- 결정: job별 공통 잠금과 queue:max. 근거: 기본 pending 하나가 새 요청에 대체되는 것을
  피하며 오래된 실행이 진행 중 새 실행을 취소하지 않게 한다. 실행 순서를 commit 순서로
  가정하지 않고 최신성 guard를 함께 사용한다.
- 대안: workflow 수준 cancel-in-progress는 외부 비동기 작업까지 취소함을 보장하지 않아
  사용하지 않는다. 현재 head 확인만 하고 동시 댓글 쓰기를 허용하는 방식도 피한다.
- Production은 도메인 없는 준비 배포 후 별도 승격을 사용한다. main 조회와 외부 승격 사이의
  원자적 CAS는 제공하지 못하므로 보장 범위를 문서화한다.

[GitHub concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency),
[Vercel staged deployment](https://vercel.com/docs/cli/deploying-from-cli).
기존 배포 조사 에이전트 결과와 공식 문서를 대조했다. 외부 배포 실행은 하지 않았다.
