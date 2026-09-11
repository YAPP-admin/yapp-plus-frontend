# Research: Preview 배포 생략 댓글 정책

## Decision 1: 영향이 있는 앱에서만 sticky 댓글 실행

**Decision**: `steps.affected.outputs.affected == 'true'`인 경우에만 Preview 댓글 단계를 실행합니다.

**Rationale**: 영향이 없는 앱의 생략은 정상 상태이므로 PR 댓글을 추가하지 않아 알림과 화면의 잡음을 줄입니다. 실제 배포 성공·실패 결과는 계속 공유해야 하므로 해당 경우의 댓글은 유지합니다.

**Alternatives considered**:

- 생략 메시지를 계속 댓글로 작성: 상태는 명확하지만 PR마다 반복적인 댓글이 쌓입니다.
- Preview 댓글 기능 전체 제거: 댓글 잡음은 없어지지만 성공한 Preview URL과 실패 원인을 PR에서 바로 확인할 수 없습니다.

## Decision 2: 기존 sticky 댓글은 보존

**Decision**: 영향이 없는 실행에서 기존 Web/Admin sticky 댓글을 삭제하거나 수정하지 않습니다.

**Rationale**: 작업 범위를 댓글 생성 조건 변경으로 제한하고, 이전 Preview URL을 참고할 수 있게 합니다. 최신 커밋과 댓글의 commit SHA가 다를 수 있다는 점은 운영 문서에 기록합니다.

**Alternatives considered**:

- 생략 시 기존 댓글 삭제: 최신 상태만 노출되지만 기존 검토 정보와 Preview 링크가 사라집니다.
- 생략 시 “오래된 결과”로 댓글 갱신: 정보는 명확하지만 생략 실행에서도 댓글 API 호출과 수정이 발생합니다.

## Decision 3: Job Summary 생략 안내 유지

**Decision**: PR 댓글 대신 기존 `Write skipped Preview summary` 단계에 생략 사유를 남깁니다.

**Rationale**: 실행 단위의 진단 정보는 유지하면서 PR 대화 흐름을 오염시키지 않습니다.

**Alternatives considered**:

- 생략 정보도 모두 제거: 실행 결과를 확인하기 어려워집니다.
- 별도 PR 상태 체크 추가: 현재 요구사항보다 복잡하고 추가 API·권한이 필요합니다.
