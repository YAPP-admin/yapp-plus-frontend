# 세션 포커스 관리의 수정 범위 제외 결정

발견 ID: S04. 관련 이슈: #149.

## 확인한 제약

필터와 다른 유형으로 수정하면 원래 카드와 메뉴 trigger가 사라집니다. dots는 실제 SEED와
Overlay 조합에서 activeElement가 body에 남는 것을 확인했습니다. 이 결과는 기존 감사 검증입니다.
현재 설치된 `@seed-design/react-dialog`의 공개 UseDialogProps에는 open/onOpenChange,
modal, closeOnInteractOutside, closeOnEscape, lazyMount, unmountOnExit 등이 있으나 별도
복귀 대상 또는 `onCloseAutoFocus` 옵션은 없습니다. 존재하지 않는 props를 넘기거나 내부 DOM
구조를 조회하는 우회는 적용하지 않습니다.

## 사용자 결정

2026-10-29 사용자는 최소 fallback 허용 질문에 “포커스 관리는 신경 쓰지마”라고 답했습니다.
이에 따라 #149의 커스텀 포커스 이동·복귀 처리는 이번 수정 범위에서 제외합니다.
`state-policy.md`의 기존 제외 결정을 유지하며 추가 예외 승인을 기다리지 않습니다.

수정 카드가 필터에서 사라질 때 ‘세션 추가’ 버튼으로 이동하는 fallback은 구현하지 않습니다.
저장·취소·Escape의 포커스 처리는 SEED 기본 동작을 유지합니다. 제품 코드 변경과 전용
회귀 테스트 추가는 없습니다. 기존 감사에서 관찰한 포커스 복귀 문제가 해결됐다는 뜻은 아닙니다.

#146의 휠 UI 유지와 확정 시점 수정은 별도 결정으로 계속 유효합니다.
관련: #68, #88, #152, #178.

## 근거와 완료 판정

기준: `e0d4bf92f007c075b53adc0938d9abe5e8ba4572`.

- [apps/admin/src/pages/sessions/ui/session-dialogs.tsx](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/pages/sessions/ui/session-dialogs.tsx)
- [apps/admin/src/pages/sessions/ui/sessions-page.tsx](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/apps/admin/src/pages/sessions/ui/sessions-page.tsx)
- [specs/010-session-location/state-policy.md](https://github.com/YAPP-admin/yapp-plus-frontend/blob/e0d4bf92f007c075b53adc0938d9abe5e8ba4572/specs/010-session-location/state-policy.md)

이번 PR의 완료 조건은 사용자 제외 결정과 제품 동작 유지 범위를 기록하는 것입니다.
#149는 `Refs`로 연결하고 수정 완료로 자동 종료하지 않습니다. dots 보고서의 재현은 기존
검증이며 이번에 새로 실행한 브라우저·보조기술 검증이 아닙니다.
