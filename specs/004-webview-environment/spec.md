# Feature Specification: WebView 실행 환경 식별

**Feature Branch**: `webview-web-detection-plan`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "일반 웹과 YAPP Plus WebView를 구분하고, 기존 Safe Area 전달 방식의 의사결정 근거를 문서화합니다."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 앱 WebView 구분 (Priority: P1)

웹 기능 개발자는 동일한 웹 앱이 일반 브라우저와 YAPP Plus 앱 WebView 중 어디에서 실행되는지 일관된 기준으로 구분할 수 있습니다.

**Why this priority**: 실행 환경을 잘못 판단하면 네이티브 기능을 일반 브라우저에서 호출하거나 앱 전용 동작을 누락할 수 있습니다.

**Independent Test**: 앱 식별자가 포함된 환경과 포함되지 않은 환경을 각각 판별하여 전자는 앱 WebView, 후자는 일반 웹으로 분류되는지 확인합니다.

**Acceptance Scenarios**:

1. **Given** YAPP Plus 앱이 웹을 열었을 때, **When** 웹이 실행 환경을 판별하면, **Then** 앱 WebView로 분류됩니다.
2. **Given** 일반 브라우저가 같은 웹을 열었을 때, **When** 웹이 실행 환경을 판별하면, **Then** 일반 웹으로 분류됩니다.
3. **Given** 다른 앱의 WebView가 같은 웹을 열었을 때, **When** YAPP Plus 식별자가 없다면, **Then** YAPP Plus 앱 WebView로 분류되지 않습니다.

---

### User Story 2 - 실행 환경별 Safe Area 유지 (Priority: P2)

사용자는 일반 브라우저와 앱 WebView 모두에서 화면의 안전 영역을 침범하지 않는 레이아웃을 봅니다.

**Why this priority**: 실행 환경 식별 기능을 추가하면서 기존 Safe Area 전달 경로가 변경되거나 일반 브라우저의 기본 안전 영역 처리가 사라지면 화면이 가려질 수 있습니다.

**Independent Test**: 일반 브라우저와 앱 WebView에서 각각 안전 영역 값을 적용하고, 네 방향의 여백이 해당 환경의 값으로 유지되는지 확인합니다.

**Acceptance Scenarios**:

1. **Given** 일반 브라우저에서 웹을 열었을 때, **When** 기기가 브라우저 안전 영역 값을 제공하면, **Then** 웹은 해당 값을 사용합니다.
2. **Given** 앱 WebView에서 웹을 열었을 때, **When** 네이티브 안전 영역 값이 전달되면, **Then** 웹은 전달된 네 방향의 값을 사용합니다.
3. **Given** 앱 WebView의 안전 영역이 변경되었을 때, **When** 새 값이 전달되면, **Then** 웹 레이아웃에 변경값이 반영됩니다.

---

### User Story 3 - 전달 방식의 근거 확인 (Priority: P3)

유지보수자는 실행 환경 식별과 Safe Area 전달이 분리된 이유, 참고한 구현과 대안을 저장소 문서에서 확인할 수 있습니다.

**Why this priority**: 값이 중복 전달되거나 근거 없이 계약이 바뀌는 일을 방지하려면 현재 선택의 배경과 범위를 명시해야 합니다.

**Independent Test**: 저장소 문서만 읽고 식별 정보와 Safe Area 값의 전달 경로, 선택 이유, 참고 자료를 설명할 수 있는지 확인합니다.

**Acceptance Scenarios**:

1. **Given** 유지보수자가 관련 문서를 열었을 때, **When** 실행 환경 식별 방식을 확인하면, **Then** 식별자는 환경 구분에만 사용된다는 설명을 찾을 수 있습니다.
2. **Given** 유지보수자가 Safe Area 전달 방식을 확인할 때, **When** 의사결정 문서를 읽으면, **Then** 값은 기존 브리지로 전달하며 식별 정보에 중복 저장하지 않는 이유와 참고 자료를 확인할 수 있습니다.

### Edge Cases

- 식별 정보가 없거나 빈 값이면 일반 웹으로 판별합니다.
- 식별 정보에 비슷하지만 정확하지 않은 문자열이 포함되어도 YAPP Plus 앱 WebView로 오인하지 않습니다.
- 식별 문자열의 앞뒤에 브라우저 또는 기기 정보가 함께 있어도 고정된 앱 식별자를 인식합니다.
- 네이티브 Safe Area 값이 아직 도착하지 않은 앱 초기 시점에는 기존 기준값을 사용하고, 전달 후 최신 값으로 바뀝니다.
- 일반 브라우저에서는 앱 브리지가 없어도 오류가 발생하지 않고 브라우저가 제공하는 안전 영역 처리를 유지합니다.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 시스템은 YAPP Plus 앱 WebView에 일반 브라우저와 구분되는 고정 식별자를 제공해야 합니다.
- **FR-002**: 시스템은 주어진 실행 환경 정보에 YAPP Plus 앱 식별자가 포함되었는지 판별하는 하나의 공용 계약을 제공해야 합니다.
- **FR-003**: 시스템은 식별자가 없거나 다른 앱의 식별자만 있는 환경을 YAPP Plus 앱 WebView로 판별하지 않아야 합니다.
- **FR-004**: 시스템은 Safe Area 값을 실행 환경 식별 정보에 포함하지 않아야 합니다.
- **FR-005**: 시스템은 앱 WebView에서 Safe Area 변경값을 기존 브리지 경로로 전달하고 웹 레이아웃에 반영해야 합니다.
- **FR-006**: 시스템은 일반 브라우저에서 브라우저가 제공하는 Safe Area 대체값을 유지해야 합니다.
- **FR-007**: 저장소 문서는 WebView 식별과 Safe Area 전달을 분리한 배경, 선택한 방식, 검토한 대안과 참고 자료를 기록해야 합니다.
- **FR-008**: 시스템은 아직 배포되지 않은 앱의 이전 식별 형식에 대한 호환 로직을 추가하지 않아야 합니다.

### Key Entities _(include if feature involves data)_

- **실행 환경 식별자**: 웹이 YAPP Plus 앱 WebView에서 열렸음을 나타내는 고정 문자열입니다. 기기별 화면 값은 포함하지 않습니다.
- **Safe Area 값**: 화면의 위·오른쪽·아래·왼쪽 안전 여백을 나타내며 네이티브 환경 변화에 따라 갱신될 수 있습니다.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: YAPP Plus 앱 식별자가 있는 판별 사례 100%가 앱 WebView로 분류됩니다.
- **SC-002**: 식별자가 없거나 정확하지 않은 판별 사례 100%가 일반 웹으로 분류됩니다.
- **SC-003**: 앱 WebView에서 전달된 Safe Area의 네 방향 값과 변경값이 검증 사례 100%에서 웹 레이아웃에 반영됩니다.
- **SC-004**: 일반 브라우저 검증 사례 100%에서 브라우저의 Safe Area 대체 처리가 유지됩니다.
- **SC-005**: 의사결정 문서에서 선택 이유, 제외한 대안과 외부 참고 자료를 모두 확인할 수 있습니다.

## Assumptions

- 모바일 앱은 아직 배포되지 않아 이전 User-Agent 형식을 지원할 필요가 없습니다.
- 실행 환경 식별은 기능 분기를 위한 힌트이며 인증이나 보안 경계로 사용하지 않습니다.
- Safe Area의 측정과 브리지 전달은 현재 동작하는 계약을 유지합니다.
- 서버 렌더링에서 앱 전용 화면을 별도로 생성하는 작업은 이번 범위에 포함하지 않습니다.
