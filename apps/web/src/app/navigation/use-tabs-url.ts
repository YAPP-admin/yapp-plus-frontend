import { useHistoryTick } from '@stackflow/plugin-history-sync';
import { useEnterDoneEffect } from '@stackflow/react';
import { tabUrl, type TabsState } from './tab';

/** history-sync가 다중 Tabs route를 기록한 뒤 활성 탭의 canonical URL로 정규화합니다. */
export function useTabsUrl(params: TabsState) {
  const { requestHistoryTick } = useHistoryTick();
  const { initialTab, session, attendance } = params;

  useEnterDoneEffect(() => {
    requestHistoryTick((resolve) => {
      const nextUrl = tabUrl({ initialTab, session, attendance });
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (currentUrl !== nextUrl) {
        window.history.replaceState(window.history.state, '', nextUrl);
      }
      resolve();
    });
  }, [attendance, initialTab, requestHistoryTick, session]);
}
