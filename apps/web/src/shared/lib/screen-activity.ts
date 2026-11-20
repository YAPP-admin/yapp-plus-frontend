/** 화면 활성 상태만 전달해 조회 코드가 Stackflow 구현에 의존하지 않게 합니다. */
import type { QueryObserverResult } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useEffectEvent, useRef } from 'react';

/** 화면 셸이 제공하는 활성 상태입니다. 셸 밖의 단독 화면은 활성 상태로 취급합니다. */
export const ScreenActiveContext = createContext(true);

/** 화면 셸의 활성 상태를 읽는다. Provider 밖에서는 활성 상태를 반환한다. */
export function useScreenActiveContext() {
  return useContext(ScreenActiveContext);
}

/**
 * 마운트가 유지된 탭·상세 탐색에서 돌아오면 stale 조회를 갱신합니다.
 * always 옵션은 화면별 최신성 정책이 staleTime보다 우선할 때만 사용합니다.
 */
export function useRefetchOnScreenReturn(
  query: Pick<QueryObserverResult<unknown, unknown>, 'isStale' | 'refetch'>,
  { always = false }: { always?: boolean } = {},
) {
  const active = useScreenActiveContext();
  const wasActive = useRef(active);
  const refetchIfStale = useEffectEvent(() => {
    if (always || query.isStale) {
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
