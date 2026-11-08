/** 화면 활성 상태만 전달해 조회 코드가 Stackflow 구현에 의존하지 않게 합니다. */
import type { QueryObserverResult } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useEffectEvent, useRef } from 'react';

/** 화면 셸이 제공하는 활성 상태입니다. 셸 밖의 단독 화면은 활성 상태로 취급합니다. */
export const ScreenActiveContext = createContext(true);

/**
 * 마운트가 유지된 상세 탐색에서 돌아올 때만 stale 조회를 갱신합니다.
 * 최초 진입과 탭의 Effect 재연결은 React Query에 맡기고 진행 중 요청은 공유합니다.
 */
export function useRefetchOnScreenReturn(
  query: Pick<QueryObserverResult<unknown, unknown>, 'isStale' | 'refetch'>,
) {
  const active = useContext(ScreenActiveContext);
  const wasActive = useRef(active);
  const refetchIfStale = useEffectEvent(() => {
    if (query.isStale) {
      void query.refetch({ cancelRefetch: false });
    }
  });

  useEffect(() => {
    const returned = active && !wasActive.current;
    wasActive.current = active;
    if (returned) {
      refetchIfStale();
    }
  }, [active]);
}
