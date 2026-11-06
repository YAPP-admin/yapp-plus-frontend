import { useHistoryTick } from '@stackflow/plugin-history-sync';
import { useEnterDoneEffect } from '@stackflow/react';
import { tabNames, tabPath, tabUrl, type TabsState } from './tab';

/** history-sync가 다중 Tabs route를 기록한 뒤 활성 탭의 canonical URL로 정규화합니다. */
export function useTabsUrl(params: TabsState) {
  const { requestHistoryTick } = useHistoryTick();
  const { initialTab, session, attendance } = params;

  useEnterDoneEffect(() => {
    let active = true;
    requestHistoryTick((resolve) => {
      // 예약 뒤 최상위에서 내려가거나 해제된 Tabs는 현재 화면의 URL을 덮지 않습니다.
      const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
      if (!active || !tabNames.some((tab) => tabPath(tab) === pathname)) {
        resolve();
        return;
      }
      const nextUrl = tabUrl({ initialTab, session, attendance });
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (currentUrl !== nextUrl) {
        window.history.replaceState(window.history.state, '', nextUrl);
      }
      resolve();
    });
    return () => {
      active = false;
    };
  }, [attendance, initialTab, requestHistoryTick, session]);
}
