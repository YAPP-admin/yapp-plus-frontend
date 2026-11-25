/** 완료된 일반 조회 오류만 가까운 ErrorBoundary에 전달한다. */
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { useErrorBoundaryPolicy } from '@/shared/ui/error-boundary-policy';

export type QueryErrorPolicyState = {
  error: unknown;
  isFetching: boolean;
  isFetchNextPageError?: boolean;
};

/**
 * 기존 데이터를 둔 재조회라도 완료 후 실패하면 화면 영역을 오류 상태로 교체한다.
 * 다음 페이지 실패는 목록이 소유하므로 이후 목록 단계에서 직접 안내한다.
 */
export function shouldThrowQueryError(
  { error, isFetching, isFetchNextPageError = false }: QueryErrorPolicyState,
  shouldRethrow: (error: unknown) => boolean = () => false,
) {
  return error != null && !isFetching && (!isFetchNextPageError || shouldRethrow(error));
}

/**
 * QueryErrorResetBoundary가 재시도를 연 직후에는 이전 오류를 다시 던지지 않는다.
 * TanStack Query가 새 요청을 시작해 성공하거나 다시 완료된 오류를 전달하게 한다.
 */
export function useThrowQueryError(state: QueryErrorPolicyState) {
  const { isReset } = useQueryErrorResetBoundary();
  const { shouldRethrow } = useErrorBoundaryPolicy();

  if (shouldThrowQueryError(state, shouldRethrow) && !isReset()) {
    throw state.error;
  }
}
