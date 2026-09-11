# Feature Specification: Preview 배포 생략 댓글 정책

**Feature Branch**: `ci/preview-comment-policy`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "Preview 배포가 생략된 경우 PR 댓글을 작성하지 않습니다."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 필요한 Preview 결과만 PR에 표시 (Priority: P1)

개발자는 Preview가 실제로 배포된 경우에만 PR에서 접근 가능한 결과 링크나 실패 안내를 확인할 수 있습니다.

**Why this priority**: 정상적인 배포 생략을 댓글로 반복 표시하면 PR 알림과 화면이 불필요하게 복잡해집니다.

**Independent Test**: Web 또는 Admin이 영향을 받지 않는 변경으로 Preview workflow를 실행하고, Job Summary에는 생략 사유가 남지만 새 PR 댓글은 작성되지 않는지 확인합니다.

**Acceptance Scenarios**:

1. **Given** 앱의 build 입력에 영향이 없는 PR 변경이 있을 때, **When** Preview 배포가 생략되면, **Then** 해당 앱에 대한 새 PR 댓글이 작성되지 않습니다.
2. **Given** 앱이 Preview에 배포되었을 때, **When** 배포가 성공하면, **Then** 기존 sticky 댓글에 Preview 링크가 작성되거나 갱신됩니다.
3. **Given** 앱이 Preview 배포를 시도했을 때, **When** 배포가 실패하면, **Then** 기존 sticky 댓글에 실패 안내와 실행 로그 링크가 작성되거나 갱신됩니다.

### User Story 2 - 기존 Preview 댓글 보존 (Priority: P2)

개발자는 최신 실행에서 배포가 생략되어도 이전에 작성된 Preview 댓글을 계속 참고할 수 있습니다.

**Why this priority**: 댓글 자동 삭제로 기존 검토 정보가 사라지는 것을 방지합니다.

**Independent Test**: 먼저 Preview 댓글을 생성한 뒤 영향이 없는 후속 커밋으로 workflow를 실행하고, 기존 댓글이 삭제되지 않는지 확인합니다.

**Acceptance Scenarios**:

1. **Given** PR에 기존 Web 또는 Admin sticky 댓글이 있을 때, **When** 해당 앱의 새 Preview 배포가 생략되면, **Then** 기존 댓글은 삭제되거나 수정되지 않습니다.

### Edge Cases

- Web만 영향을 받고 Admin 배포가 생략되면 Web 댓글만 갱신되고 Admin에는 새 댓글이 작성되지 않습니다.
- 두 앱 모두 영향을 받지 않으면 두 앱 모두 새 댓글을 작성하지 않고 Job Summary에만 생략 결과를 남깁니다.
- 영향 판정 단계가 실패하면 댓글을 작성하지 않고 workflow를 실패시켜 원인을 로그에서 확인할 수 있어야 합니다.
- 기존 댓글은 이전 커밋의 Preview 결과일 수 있으므로 최신 커밋과 일치하지 않을 수 있습니다.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 시스템은 앱별 영향 판정 결과가 배포 생략을 나타내면 PR 댓글 작성 단계를 실행하지 않아야 합니다.
- **FR-002**: 시스템은 실제 Preview 배포가 성공하면 해당 앱의 sticky PR 댓글에 Preview URL을 작성하거나 갱신해야 합니다.
- **FR-003**: 시스템은 실제 Preview 배포가 실패하면 해당 앱의 sticky PR 댓글에 실패 안내를 작성하거나 갱신해야 합니다.
- **FR-004**: 시스템은 배포 생략 결과를 PR 댓글이 아닌 GitHub Actions Job Summary에서 확인할 수 있게 해야 합니다.
- **FR-005**: 시스템은 배포 생략을 이유로 기존 sticky PR 댓글을 삭제하거나 수정하지 않아야 합니다.
- **FR-006**: 시스템은 Web과 Admin의 영향 판정 및 댓글 동작을 서로 독립적으로 처리해야 합니다.

### Key Entities _(include if feature involves data)_

- **앱별 영향 판정 결과**: Web 또는 Admin이 현재 PR 커밋에서 Preview 배포 대상인지 나타내는 값입니다.
- **Preview sticky 댓글**: 앱별 Preview URL 또는 실패 안내를 하나씩 유지하는 PR 댓글입니다.
- **Job Summary**: workflow 실행의 배포·생략 결과를 기록하는 실행 요약입니다.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 영향이 없는 앱의 Preview 배포 생략 실행 100%에서 새 PR 댓글이 작성되지 않습니다.
- **SC-002**: 실제 Preview 배포가 성공한 실행 100%에서 해당 앱의 Preview URL 댓글이 작성되거나 갱신됩니다.
- **SC-003**: 실제 Preview 배포 실패 실행 100%에서 실패 안내 댓글이 작성되거나 갱신됩니다.
- **SC-004**: 배포 생략 실행 100%에서 생략 사유를 Job Summary에서 확인할 수 있습니다.
- **SC-005**: 배포 생략 실행 100%에서 기존 sticky 댓글이 삭제되지 않습니다.

## Assumptions

- Preview 댓글은 현재처럼 Web과 Admin별 sticky 댓글 하나씩 유지합니다.
- 배포 생략 여부는 기존 앱별 영향 판정 결과를 사용합니다.
- PR 댓글 권한은 실제 배포 성공·실패 댓글을 위해 계속 필요합니다.
- PR별 Preview 댓글의 최신 커밋 일치 여부를 보장하는 별도 재배포 정책은 이 범위에 포함하지 않습니다.
