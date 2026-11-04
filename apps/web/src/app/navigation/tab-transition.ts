let pendingTransition: (() => void) | undefined;

/** Alerts pop이 끝난 뒤 실행할 탭 전환을 한 건만 보관합니다. */
export function requestTabTransitionAfterPop(transition: () => void) {
  pendingTransition = transition;
}

export function runPendingTabTransition() {
  const transition = pendingTransition;
  pendingTransition = undefined;
  transition?.();
}
