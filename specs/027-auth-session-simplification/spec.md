# Feature Specification: 인증 세션 단순화

**Feature Branch**: `027-auth-session-simplification`

**Created**: 2026-11-20

**Status**: 구현 중

**Input**: 로그인 진단을 보강하고 로그아웃·탈퇴·갱신 저장 실패의 세션 정리 규칙을 단순화한다.

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - 로그인 실패 원인 확인 (Priority: P1)

개발자는 실제 사용자 정보나 토큰을 보지 않고도 공급자 인증, 서버 교환, 저장 중 어느 단계에서 로그인 흐름이 끝났는지 확인한다.

**Why this priority**: 첫 Google 로그인처럼 재현이 어려운 실패를 로그인 화면의 일반 오류와 구분한다.

**Independent Test**: 개발 모드에서 성공·취소·실패 로그인마다 단계와 결과만 기록되고 민감한 값이 기록되지 않는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 개발 모드의 WebView 로그인, **When** provider·exchange·storage가 완료되거나 실패하면, **Then** 각 단계의 결과와 HTTP 상태만 기록된다.
2. **Given** 일반 브라우저 또는 운영 빌드, **When** 로그인하면, **Then** 개발 진단 로그가 추가로 출력되지 않는다.

---

### User Story 2 - 일관된 로컬 로그아웃과 탈퇴 (Priority: P2)

사용자는 서버의 로그아웃 요청이 실패해도 이 기기에서 즉시 로그아웃되고, 탈퇴 성공 뒤에도 같은 로컬 정리를 받는다.

**Why this priority**: 네트워크 실패가 사용자를 로그인 화면으로 돌려보내지 못하는 문제를 없앤다.

**Independent Test**: revoke 실패·timeout과 withdrawal 204·401·503·응답 유실, 세션 변경 경합을 단위 테스트로 확인한다.

**Acceptance Scenarios**:

1. **Given** 서버 revoke가 실패한 로그인 세션, **When** 로그아웃하면, **Then** 로컬 저장소는 삭제되고 `SIGNED_OUT`이 반환된다.
2. **Given** 탈퇴 API가 204를 반환한 현재 세션, **When** 로컬 삭제가 성공하면, **Then** `WITHDRAWN`이 반환된다.
3. **Given** 탈퇴 요청 중 새 세션이 확정됨, **When** 이전 탈퇴 응답이 도착하면, **Then** 이전 결과는 폐기되고 새 세션을 삭제하지 않는다.

---

### User Story 3 - 안전한 갱신 저장 실패 처리 (Priority: P3)

사용자는 refresh token 회전 결과를 저장하지 못하면 이전 refresh token을 재사용하지 않고 로컬 세션을 정리한다.

**Why this priority**: 서버가 회전으로 폐기한 이전 token을 재시도하는 모순을 막는다.

**Independent Test**: 갱신 저장 실패 후 다음 조회가 이전 token으로 갱신하지 않고 삭제 재시도만 수행하는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 갱신 성공 뒤 SecureStore 쓰기 실패, **When** 갱신이 끝나면, **Then** 메모리·저장 세션을 정리하고 이전 token으로 갱신하지 않는다.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- 서버 로그아웃 실패·timeout은 로컬 정리를 막지 않지만 서버 세션 또는 푸시 등록은 남을 수 있다.
- 탈퇴 요청의 응답이 유실되면 성공으로 추정하지 않고 오류를 반환한다.
- 로컬 삭제 실패는 기존 삭제 재시도 경로를 사용하며 성공으로 숨기지 않는다.

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: 개발 빌드에서 provider·exchange·storage와 웹 브릿지 요청·응답·반영 결과를 민감 값 없이 기록해야 한다.
- **FR-002**: 로그아웃은 서버 revoke를 한 번 시도하고 결과와 무관하게 로컬 세션 삭제를 시도해야 한다.
- **FR-003**: 로컬 삭제 실패만 로그아웃 실패로 반환하고 기존 삭제 재시도 정책을 유지해야 한다.
- **FR-004**: 탈퇴는 204 응답에만 성공 처리하고 성공 뒤 로컬 세션을 삭제해야 한다.
- **FR-005**: 탈퇴 결과는 시작한 세션 세대가 여전히 현재일 때만 반영해야 한다.
- **FR-006**: 갱신 결과 저장 실패 시 현재 세션을 정리하고 이전 refresh token 재시도를 금지해야 한다.
- **FR-007**: 공개 브릿지 계약·저장 형식·새 전역 상태·`AUTHENTICATING` 복구·자동 재시도는 추가하지 않아야 한다.

### Key Entities _(include if feature involves data)_

- **세션 세대**: 늦은 인증·탈퇴·갱신 결과가 현재 세션에 속하는지 확인하는 내부 번호다.
- **로컬 세션**: Keychain의 refresh token과 메모리 access token으로 구성되며 공개 브릿지에는 access token만 전달한다.

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 로그인 실패 fixture가 provider·exchange·storage 중 하나의 단계로 구분된다.
- **SC-002**: 서버 revoke 실패·timeout fixture 100%가 로컬 `SIGNED_OUT`으로 끝난다.
- **SC-003**: 탈퇴의 204·401·503·timeout·응답 유실과 세션 경합이 단위 테스트로 구분된다.
- **SC-004**: 갱신 저장 실패 뒤 이전 refresh token을 사용하는 추가 renew 호출이 0회다.

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- 서버 revoke와 탈퇴 API의 성공 계약은 HTTP 204이다.
- 서버 세션·푸시 등록 해제 정책은 이 변경 범위 밖이며 운영 문서에 잔존 가능성만 기록한다.
- 실기기 Apple·Google 검증은 개발 빌드와 계정이 있어야 하므로 자동 검증과 별도 기록한다.
