# 사라지는 수정 버튼의 포커스 복귀 결정안 기록

발견 ID: S04. 관련 이슈: #149.

## 확인한 제약

필터와 다른 유형으로 수정하면 원래 카드와 메뉴 trigger가 사라집니다. dots는 실제 SEED와
Overlay 조합에서 activeElement가 body에 남는 것을 확인했습니다. 이 결과는 기존 감사 검증입니다.
현재 설치된 `@seed-design/react-dialog`의 공개 UseDialogProps에는 open/onOpenChange,
modal, closeOnInteractOutside, closeOnEscape, lazyMount, unmountOnExit 등이 있으나 별도
복귀 대상 또는 `onCloseAutoFocus` 옵션은 없습니다. 존재하지 않는 props를 넘기거나 내부 DOM
구조를 조회하는 우회는 적용하지 않습니다.

`state-policy.md`는 사용자 결정에 따라 별도 포커스 이동·복귀 로직을 구현하지 않는다고
명시합니다. 이번에 최소 예외 허용을 질문했으며 아직 결정되지 않았습니다. #146의 휠 UI 유지
답변을 포커스 정책 변경 승인으로 확장하지 않습니다.

## 승인 후 구현할 최소안

원래 trigger가 유지되는 저장·취소는 SEED 기본 복귀를 유지합니다. 현재 필터에서 수정 카드가
사라진 성공 경로에서만 계속 존재하는 ‘세션 추가’ 버튼을 복귀 대상으로 사용합니다. 렌더가
완료된 뒤 실제 공개 ref로 이동하며 문서 전체 selector·임의 지연 timer로 포커스를 찾지 않습니다.
화면을 떠났거나 다른 사용자 조작으로 포커스가 이동한 경우 이전 콜백이 포커스를 빼앗지 않게 합니다.

검증은 같은 유형 저장, 취소·Escape, 다른 유형으로 변경, 마지막 카드 제거, 저장 중 경로 이동,
저장 실패를 포함합니다. 실제 SEED·Overlay 테스트와 키보드·VoiceOver/NVDA에서 복귀 대상을
확인합니다. 예외가 승인되지 않으면 제품 동작은 유지하고 해당 결함과 잔여 위험을 계속 추적합니다.

관련: #68, #88, #152, #178. 이 문서는 수정 완료가 아니라 검토 가능한 정책 결정안입니다.

## 근거와 완료 판정

기준: `e0d4bf92f007c075b53adc0938d9abe5e8ba4572`.

- [apps/admin/src/pages/sessions/ui/session-dialogs.tsx](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/pages/sessions/ui/session-dialogs.tsx)
- [apps/admin/src/pages/sessions/ui/sessions-page.tsx](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/pages/sessions/ui/sessions-page.tsx)
- [specs/010-session-location/state-policy.md](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/specs/010-session-location/state-policy.md)

이번 PR은 확인된 현재 상태와 후속 검증 기준을 기록합니다. 미실행 항목을 통과로 처리하지 않으며,
이슈는 실제 완료 조건을 충족할 때 닫습니다. dots 보고서의 재현은 기존 검증이며 아래 신규 확인과
구분합니다.
