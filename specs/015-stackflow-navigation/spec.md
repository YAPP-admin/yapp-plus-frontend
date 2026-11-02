# Feature Specification: Stackflow 기반 웹 내비게이션 전환

**Feature Branch**: `015-stackflow-navigation`

**Created**: 2026-11-01

**Status**: Draft

**Input**: User description: "SEED AppScreen과 Stackflow 기반으로 YAPP+ 웹 내비게이션을 단계적으로 전환하고 기존 URL, fallback, 탭 상태, WebView 탐색 계약을 유지한다."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 상세 화면 탐색과 복귀 (Priority: P1)

회원은 홈·게시판·마이페이지에서 상세 화면으로 이동하고, 이전 화면의 위치와 입력 상태를 잃지 않은 채 뒤로 돌아옵니다.

**Why this priority**: 모바일 WebView에서 상세 진입과 복귀는 가장 빈번한 탐색이며, 기존 fallback 정책을 잃으면 사용자가 길을 잃습니다.

**Independent Test**: 홈, 공지 목록과 마이페이지에서 상세 화면을 열고 뒤로가기·브라우저 뒤로가기·직접 URL 진입을 각각 실행하여 화면과 상태를 비교합니다.

**Acceptance Scenarios**:

1. **Given** 사용자가 공지 목록에서 공지를 열었을 때, **When** 상단 뒤로가기를 누르면, **Then** 공지 목록으로 돌아가며 목록의 필터와 스크롤 위치가 유지됩니다.
2. **Given** 사용자가 공지 상세 URL을 직접 열었을 때, **When** 뒤로가기를 누르면, **Then** 공지 목록을 거쳐 홈으로 이어지는 기존 복귀 정책이 복원됩니다.
3. **Given** 사용자가 상세 화면을 열고 브라우저 뒤로가기를 실행했을 때, **When** 이전 이력이 있으면, **Then** 화면이 중복 이동 없이 이전 화면으로 돌아갑니다.

### User Story 2 - 탭과 알림 탐색 (Priority: P1)

회원은 홈·일정·게시판·MY 네 탭을 오가도 현재 실행 중인 각 탭의 스크롤, 필터와 입력 상태를 유지하고 알림을 홈 위의 화면으로 확인합니다.

**Why this priority**: 네 탭은 앱의 기본 진입점이며, 탭 이동이 브라우저 이력을 오염시키면 WebView의 시스템 뒤로가기가 예측과 달라집니다.

**Independent Test**: 네 탭을 왕복하면서 각 탭에 서로 다른 스크롤·필터 상태를 만들고 알림을 열고 닫은 뒤, 상태와 브라우저 이력의 변화를 확인합니다.

**Acceptance Scenarios**:

1. **Given** 사용자가 한 탭의 목록 위치와 필터를 바꿨을 때, **When** 다른 탭으로 이동했다가 돌아오면, **Then** 이전 탭의 상태가 실행 중 유지됩니다.
2. **Given** 사용자가 탭을 여러 번 바꿨을 때, **When** 브라우저 뒤로가기를 누르면, **Then** 탭 전환 기록이 아니라 화면 스택의 이전 화면으로 이동합니다.
3. **Given** 사용자가 홈에서 알림을 열었을 때, **When** 알림에서 뒤로가기를 누르면, **Then** 홈으로 돌아가며 알림은 홈의 하위 화면으로 취급됩니다.

### User Story 3 - 플랫폼별 전환과 접근성 (Priority: P2)

회원은 iOS WebView, Android WebView와 일반 브라우저에서 각 플랫폼에 맞는 전환을 경험하고, 애니메이션을 줄이는 환경에서도 탐색과 포커스를 잃지 않습니다.

**Why this priority**: 같은 URL이라도 WebView의 제스처와 시스템 뒤로가기가 다르므로 플랫폼별 정책이 명확해야 합니다.

**Independent Test**: 세 플랫폼 정책으로 대표 경로를 이동하고 reduced-motion 환경에서 동일 경로를 반복하여 전환, 포커스와 입력 상태를 확인합니다.

**Acceptance Scenarios**:

1. **Given** iOS WebView에서 상세 화면을 연 상태일 때, **When** 화면 가장자리에서 뒤로 스와이프하면, **Then** 입력 화면이 아닌 경우 이전 화면으로 이동합니다.
2. **Given** Android WebView에서 상세 화면을 연 상태일 때, **When** 시스템 뒤로가기를 실행하면, **Then** 웹 이력이 있으면 웹 화면을 먼저 이동하고 루트에서만 네이티브 종료 정책을 사용합니다.
3. **Given** 사용자가 reduced-motion을 설정했을 때, **When** 화면을 이동하면, **Then** 화면 이동은 완료되지만 전환 애니메이션과 스와이프 효과는 발생하지 않습니다.

### Edge Cases

- 새로고침이나 앱을 다시 실행하면 실행 중에만 보존하던 탭·스크롤·필터·입력 상태는 초기화됩니다.
- 존재하지 않는 공지 ID나 알 수 없는 surface로 직접 진입하면 NotFound 또는 기존 오류 화면을 표시합니다.
- 직접 진입한 상세·오류·완료 화면에서 뒤로가기를 누르면 화면별로 정의된 fallback 경로를 복원합니다.
- 가입·팀 출석 사진 업로드처럼 입력을 잃으면 안 되는 화면에서는 iOS 스와이프 뒤로가기를 차단하고 명시적 뒤로가기만 제공합니다.
- lazy 화면을 불러오지 못하면 기존 오류 화면으로 연결하며 빈 화면을 표시하지 않습니다.
- safe area 값이 없거나 유효하지 않으면 0으로 처리하고 브라우저의 기본 `env()` fallback을 유지합니다.
- 브라우저 이력과 화면 스택이 일치하지 않으면 루트 화면을 안전한 시작 화면으로 복원합니다.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 시스템은 현재 공개 URL과 query 의미를 유지해야 합니다: `/`, `/schedule`, `/notices`, `/my`, `/alerts`, 인증·출석·설정·팀 출석 경로 및 `/notices/:noticeId`를 포함합니다.
- **FR-002**: 시스템은 상세 화면을 이전 화면 위에 쌓고 명시적 뒤로가기, 브라우저 뒤로가기와 플랫폼 뒤로가기를 동일한 화면 정책으로 처리해야 합니다.
- **FR-003**: 시스템은 직접 진입한 화면에 대해 기존 화면별 fallback을 복원해야 합니다. 가입·가입 상태는 로그인, 공지 상세는 공지 목록, 출석 규칙은 출석 내역, 설정·출석 내역은 MY, 그 밖의 오류·완료 화면은 기존 홈 또는 정의된 경로를 사용합니다.
- **FR-004**: 시스템은 홈·일정·게시판·MY 탭을 별도 상태 공간으로 취급하고 한 번의 앱 실행 중 각 탭의 스크롤·필터·입력 상태를 보존해야 합니다.
- **FR-005**: 시스템은 탭 전환을 브라우저 history에 누적하지 않아야 하며, 알림은 홈 위의 추가 화면으로 처리해야 합니다.
- **FR-006**: 시스템은 공지 목록에서 상세로 이동할 때 notice ID를 URL에 포함하고, 존재하지 않는 ID를 NotFound 또는 기존 오류 화면으로 처리해야 합니다.
- **FR-007**: 시스템은 iOS에서 일반 상세 화면의 스와이프 뒤로가기를 지원하고, 가입·팀 출석 업로드 입력 화면에서는 스와이프 뒤로가기를 차단해야 합니다.
- **FR-008**: 시스템은 Android에서 웹 history와 네이티브 `canGoBack`·`webView.goBack()` 계약을 사용할 수 있도록 root back 동작을 문서화해야 합니다.
- **FR-009**: 시스템은 User-Agent를 `ios`, `android`, `web` 중 하나의 플랫폼 문맥으로 판별하고, 플랫폼별 화면 전환 정책을 적용해야 합니다.
- **FR-010**: 시스템은 reduced-motion 환경에서 push·replace·pop 전환, fade와 스와이프 효과를 제거하고 화면 이동·포커스 복원은 유지해야 합니다.
- **FR-011**: 시스템은 비활성 화면의 반복 애니메이션과 타이머를 중지하고, 화면이 다시 활성화될 때 필요한 상태만 복원해야 합니다.
- **FR-012**: 시스템은 safe area를 화면 상·하단에 중복 적용하지 않고, WebView 브리지와 CSS 계약을 일관되게 사용해야 합니다.
- **FR-013**: 시스템은 공식 SEED AppScreen의 접근성 이름, stable hook과 화면 계약을 임의로 변경하지 않아야 합니다.
- **FR-014**: 시스템은 Stackflow 호환성 스파이크가 실패하면 기존 Next.js 구조를 유지하고 후속 전환을 진행하지 않아야 합니다.
- **FR-015**: 시스템은 인증 정책, API 계약, 문구와 제품 권한 정책을 변경하지 않아야 합니다.
- **FR-016**: 시스템은 모든 Activity를 lazy-load할 수 있어야 하며 lazy import 실패를 기존 오류 화면에 연결해야 합니다.
- **FR-017**: 시스템은 화면별 document title을 기존 공개 title과 같은 의미로 갱신해야 합니다.

### Key Entities

- **Navigation Surface**: 공개 URL과 연결된 화면 단위. tab, detail, auth, input, error, complete 유형과 fallback 정책을 가집니다.
- **Navigation Entry**: 현재 실행 중인 화면의 순서, surface, URL과 query를 나타내는 이력 단위입니다.
- **Tab State**: 홈·일정·게시판·MY 각각의 실행 중 스크롤·필터·입력 상태입니다. 새로고침 후에는 보존하지 않습니다.
- **Platform Context**: `ios`, `android`, `web` 중 하나와 reduced-motion 선호를 포함하는 화면 실행 문맥입니다.
- **Safe Area Contract**: 네이티브 inset과 웹 CSS 변수가 대응하는 상·하·좌·우 여백 계약입니다.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 기준선에 포함된 모든 공개 URL과 query가 전환 후 자동 경로 검증에서 100% 발견되고, 의도하지 않은 404가 0건입니다.
- **SC-002**: 화면별 fallback 표의 모든 직접 진입 시나리오가 100% 기대 경로로 복원됩니다.
- **SC-003**: 네 탭 왕복·알림 진입·공지 상세의 상태 보존 시나리오가 100% 통과합니다.
- **SC-004**: iOS·Android·Web의 플랫폼별 전환 및 browser/system back 시나리오가 각각 100% 통과합니다.
- **SC-005**: reduced-motion 환경에서 이동 완료율은 일반 환경과 같고, 전환 애니메이션·fade·스와이프 발생이 0건입니다.
- **SC-006**: 입력 화면에서 우발적 스와이프로 입력이 폐기되는 시나리오가 0건입니다.
- **SC-007**: safe area 상·하단 inset의 중복 적용 사례가 0건이며, iOS 노치·홈 인디케이터 확인 항목을 100% 통과합니다.
- **SC-008**: 구현 단계마다 `node --run check`, 필요 시 `node --run build`, 모바일 계약 변경 시 `node --run expo:doctor` 결과를 기록하고 승인된 실패 외의 새 실패가 0건입니다.

## Assumptions

- 사용자는 YAPP+ 회원 앱을 일반 브라우저 또는 iOS·Android WebView에서 사용합니다.
- 전환은 현재 공개 화면과 제품 정책을 보존하는 범위이며 인증, API, 서버 데이터 모델은 범위 밖입니다.
- 탭 상태는 앱 실행 중에만 보존하고 새로고침·재실행 후 초기화합니다.
- Android 네이티브 WebView 구현은 별도 프로젝트가 담당하며 이 저장소에서는 웹 history와 연동 계약을 문서화합니다.
- Stackflow 호환성 스파이크와 공식 SEED AppScreen 사용이 실패하면 Next.js 구조를 유지합니다.
- SEED React 3.1 계열을 유지하고 SEED Stackflow 2.1과 Stackflow core/react 1.x 호환 조합을 검증합니다.
- 화면 전환 효과는 추가 Motion 의존성 없이 Stackflow와 SEED의 공식 전환 계약으로 제공합니다.
