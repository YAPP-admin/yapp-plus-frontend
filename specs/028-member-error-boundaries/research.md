# 조사 근거와 결정

## 조회 오류가 병렬 표시되는 이유

- 근거: `apps/web/src/pages/schedule/ui/schedule-page.tsx`와 my/attendance/notices 화면은
  cache data와 error를 동시에 읽어 이전 내용 옆에 안내를 붙인다. profile/notice-detail 등은 재조회 오류를 표시하지 않는다.
- 결정: 완료된 일반 재조회 오류는 Local로 전달해 영역을 교체한다. 추가 페이지 일반 오류만 예외다.
- 대안: 이전 내용+작은 안내 유지도 제안했으나 사용자가 실패 영역 교체를 선택했다.
- [TanStack Query Suspense 문서](https://tanstack.com/query/latest/docs/framework/react/guides/suspense)는
  cache가 있으면 기본 throw가 발생하지 않으며 필요한 경우 명시적으로 오류를 throw하도록 설명한다.
  기존 상담에서 확인한 근거이며 고정 버전 동작은 구현 회귀 테스트로 검증한다.

## 경계와 인증

- 근거: shared QueryBoundary·ScreenQueryBoundary에 인증 판별이 없고 홈 사진 상태는 일반 ErrorBoundary로 모든 오류를 삼킨다.
- 결정: Local/Auth/App 세 경계만 사용한다. 판별 Context는 app에서 주입해 FSD 방향을 유지한다.
- 근거: native-auth-client는 GET 401을 한 번 갱신·재전송하지만 결과가 SIGNED_IN/SIGNED_OUT일 때만 세션 cache에 반영한다.
  AccountScreen은 세션 phase를 보고 보호 화면을 차단하며 LoginActivity는 SIGNED_IN이면 Tabs로 이동한다.
- 결정: 업무 요청의 최종 인증 실패는 재인증 필요로 반영하고 기본 Login으로 이동한다. 로그인 이동만 추가하면 왕복할 수 있다.
- 대안: 연결 실패·잔여401에서 복구 화면을 제안했지만 사용자가 항상 로그인 이동을 선택했다. 최초 bootstrap 복구는 범위 밖이다.
- 계정 세대·tokenVersion·취소 검사를 유지한다. QueryClient별 작업 상태를 전역 단일 store로 바꾸지 않는다.

## Mutation과 입력

- 근거: 사진 제출은 presign catch와 최종 제출 catch에서 ApiError를 일반 SubmissionError로 바꾼다.
- 결정: 인증 원인을 보존하고 업무 Mutation의 인증 오류만 경계로 전파한다. 외부 PUT HTTP 오류는 별도로 둔다.
- 일반 Mutation은 입력·롤백·결과 불명 동작을 유지한다. 인증 Mutation 자체에 업무 오류 정책을 일괄 적용하지 않는다.
- 사용자는 일반 조회 실패 시 입력 보존보다 구현 단순화를 선택했다. 경계 내부 입력은 초기화하고 새 보존 기능은 만들지 않는다.

## 디자인

- [Hand off 공지 오류](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=222-40786)는
  제목·설명·회색 캐릭터와 뒤로가기이며 재시도·홈 이동은 없다. 그림과 탐색은 컴포넌트지만 오류 화면 자체는 frame이다.
- [공통 팝업](https://www.figma.com/design/LUFGoDnVmwJT43QhecBI8x/YAPP-?node-id=375-11225)은 닫기·제보하기 Dialog다.
- 일정의 과거 참조 `59:28487`은 Wireframe이다. page는 Hand off, section은 작은 안내로 통일한다.
- 다시 시도 추가는 사용자 승인된 보완이다. 일반 오류의 홈 이동은 제외하고 App 최종 오류에만 제공한다.
- 이전 대화에서 MCP metadata·screenshot을 확인했다. 화면 근거는 `.context/figma-notice-error.png`에 있다.

## 기존 명세와의 정책 변경

| 기존 문서                                                     | 변경할 정책                                                |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| specs/017-member-sessions/spec.md·data-model.md·quickstart.md | 재조회 실패의 이전 내용+안내 → 실패 영역 교체              |
| specs/018-my-attendance/spec.md·research.md·quickstart.md     | 이전 출석 값 유지 → 일반 재조회만 교체, 다음 페이지는 유지 |
| specs/019-member-notices/spec.md·data-model.md·quickstart.md  | 목록·상세 오류 규칙을 공통 정책과 연결                     |
| specs/020-member-attendance-submit/contracts/attendance.md    | 401 후 GET 복구·수동 제출 → 로그인, 자동 재제출 없음       |
| specs/022-my-profile/data-model.md                            | 조용한 기존 프로필 유지 → 영역 오류와 재시도               |
| specs/023-member-notifications/spec.md                        | 갱신·추가 실패 모두 목록 유지 → 추가 실패만 유지           |

과거 validation의 실행 기록은 고치지 않고 새 정책과 새 검증 기록을 연결한다.
기존 #329·#166의 완료 조건은 이번 작업 완료로 충족했다고 간주하지 않는다.
