# Data Model: Preview 배포 생략 댓글 정책

## 앱별 영향 판정 결과

- **의미**: Web 또는 Admin이 현재 PR 커밋에서 Preview 배포 대상인지 나타내는 문자열 출력입니다.
- **값**: `true` 또는 `false`
- **생성 주체**: 기존 `turbo-affected` composite action
- **사용 규칙**: `true`일 때만 Preview 배포와 sticky 댓글 단계를 실행합니다.

## Preview sticky 댓글

- **의미**: 앱별 Preview URL 또는 실패 안내를 하나씩 유지하는 PR 댓글입니다.
- **식별자**: `yapp-plus-preview-web`, `yapp-plus-preview-admin`
- **수명**: 생략 실행에서는 변경하지 않으며, 실제 배포 실행에서만 갱신됩니다.

## Job Summary

- **의미**: workflow 실행별 배포·생략 결과를 기록하는 실행 요약입니다.
- **생략 상태**: 영향이 없다는 설명을 포함합니다.
