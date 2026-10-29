# 검증과 운영 확인

> #132 후속 변경: 아래 배포 시작은 도메인을 바꾸는 승격 시작을 뜻합니다. 준비 빌드·업로드는
> 이력 생성 전이며, 미확정 승격은 운영 확인 후에만 재개합니다. 현재 절차는
> [승격 순서 계획](../014-production-ordering/plan.md)을 따릅니다.

```sh
mise exec -- node --test .github/scripts/production-baseline.test.mts
mise exec -- node --run check
mise exec -- node --run build
```

로컬 테스트는 외부 배포 없이 임시 Git 저장소와 메모리 응답을 사용한다.
성공 A → 취소 B → 문서 C, 앱별 부분 실패, 최초 이력, 기록 실패 뒤 revert,
유실·비조상 SHA, API 오류, 실제 checkout SHA 기록, success 요청 값을 확인한다.

merge 후 운영자는 CD 요약의 base/force-all과 프로젝트별 deployment 상태를 확인한다.
첫 실행은 두 앱을 배포하고, 이후 영향 없는 앱은 생략한다. 수동 Production 성공 뒤
자동 CD가 같은 이력을 읽는지 확인한다. Preview는 해당 이력을 만들지 않아야 한다.
실제 배포는 이 문서 작성·로컬 검증에 포함되지 않는다. 복구는 [plan.md](plan.md)를 따른다.

## 이번 검증 결과

- Node 24.20.0, pnpm 12.3.4의 고정 의존성을 사용했다.
- 배포 회귀 테스트 9개를 새로 실행했다. 공용 action의 시도 생성 실패·실제 배포 실패·
  성공 기록 실패와 Preview 경로를 외부 호출 없이 포함한다.
- check의 포맷·배포 스크립트 lint/typecheck·배포 회귀는 새로 실행했다.
  Turbo 앱별 lint 7개·typecheck 7개·test 4개는 캐시를 재사용했다.
- build의 앱별 3개 작업은 Turbo 캐시를 재사용했다.
- 이력이 없는 테스트 프로젝트 이름으로 실제 GitHub API를 읽기 전용 조회해 force_all=true를 확인했다.
- actionlint 1.7.12로 변경한 두 workflow를 검사했다. ShellCheck는 설치되어 있지 않아 제외했다.
- 실제 배포·GitHub deployment 쓰기·Production 권한 검증은 실행하지 않았다.
