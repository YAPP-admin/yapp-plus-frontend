# Quickstart: Preview 배포 생략 댓글 정책

## 사전 조건

1. GitHub Actions가 Pull Request의 `CI`를 성공적으로 실행할 수 있어야 합니다.
2. 내부 저장소 브랜치에서 `Deploy Preview` workflow가 실행되어야 합니다.
3. 기존 Preview 댓글을 확인하려면 해당 PR에 이전 Preview 배포 결과가 있어야 합니다.

## 영향 없는 변경 확인

1. Web/Admin build 입력과 무관한 파일만 변경한 PR을 생성합니다.
2. `CI` 성공 후 `Deploy Preview` workflow가 실행되는지 확인합니다.
3. Web/Admin Job Summary에 배포 생략 사유가 기록되는지 확인합니다.
4. 해당 실행에서 새 PR 댓글이 작성되지 않는지 확인합니다.
5. 기존 Preview sticky 댓글이 있다면 삭제·수정되지 않는지 확인합니다.

## 영향 있는 변경 확인

1. `apps/web`, `apps/admin` 또는 해당 앱이 의존하는 패키지의 build 입력을 변경한 PR을 생성합니다.
2. `CI` 성공 후 영향받은 앱의 Preview 배포가 실행되는지 확인합니다.
3. 배포 성공 시 해당 앱의 Preview URL 댓글이 생성되거나 갱신되는지 확인합니다.
4. 배포 실패 시 해당 앱의 실패 안내 댓글이 생성되거나 갱신되는지 확인합니다.
5. 다른 앱의 영향이 없다면 다른 앱에는 새 댓글이 작성되지 않는지 확인합니다.

## 로컬 검증

```sh
mise x actionlint@1.7.12 -- actionlint .github/workflows/deploy-preview.yml
node --run check
node --run build
```

기대 결과: workflow 문법과 저장소 품질 게이트가 통과하고, 댓글 단계의 조건이 영향 판정 출력에 연결됩니다.
