# 배포 기준 조사

## 결정

시도 생성 → 실제 배포 → 성공 기록 순서를 사용한다. 가장 최근 시도가 성공하지 않았으면
과거 성공으로 돌아가지 않고 강제 배포한다. 실제 checkout HEAD가 배포 SHA다.

## 근거와 대안

성공 기록만 사후 생성하면 A 성공 → B 배포 성공·기록 실패 → C에서 A로 revert할 때 A..C가
비어 실제 B가 남는다. 사전 기록은 이 불확실성을 보존한다. 앱별 시도는 프로젝트 ID와
전용 task로 구분해 수동 job의 자동 environment 기록과 섞이지 않는다.
항상 배포는 단순하지만 기존 affected 최적화를 없앤다. Vercel 실제 상태 조회는 새 공급자
계약과 인증 처리를 추가하므로 이번에는 기존 GitHub CLI와 권한으로 해결한다.

[Deployments API](https://docs.github.com/en/rest/deployments/deployments)의 환경·task 필터와
[상태 API](https://docs.github.com/en/rest/deployments/statuses)를 사용한다.
생성 시 auto_merge=false, required_contexts=[], production_environment=true를 명시한다.
성공 status는 auto_inactive=false로 이전 이력을 유지한다. CI 검증은 기존 workflow가 담당한다.
