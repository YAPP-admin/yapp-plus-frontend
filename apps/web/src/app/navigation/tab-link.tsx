import { useActivity, useStack, useFlow, useStepFlow } from '@stackflow/react';
import { type MouseEvent, type ReactNode } from 'react';
import { isTabName, tabUrl, type TabName, type TabsState } from './tab';
import { useHistoryTick } from '@stackflow/plugin-history-sync';

type TabLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> & {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  params?: Pick<TabsState, 'session' | 'attendance'>;
  tab: TabName;
};

/** 탭 history를 추가하지 않고 기존 Tabs Activity의 step만 교체합니다. */
export function TabLink({ children, onClick, params, tab, ...props }: TabLinkProps) {
  const { requestHistoryTick } = useHistoryTick();
  const { name: currentActivityName } = useActivity();
  const flow = useFlow();
  const stack = useStack();
  const tabsStep = useStepFlow('Tabs');
  const tabsActivity = stack.activities.find((activity) => activity.name === 'Tabs');
  const currentParams = readTabsState(tabsActivity?.steps.at(-1)?.params ?? tabsActivity?.params);
  const nextParams = { ...currentParams, ...params, initialTab: tab } satisfies TabsState;

  function replaceTabStep() {
    if (!tabsActivity) {
      return;
    }
    tabsStep.replaceStep(nextParams, { targetActivityId: tabsActivity.id });
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    if (currentActivityName === 'Tabs' && tabsActivity) {
      replaceTabStep();
      return;
    }

    if (currentActivityName === 'Alerts' && tabsActivity) {
      // pop이 예약한 history 이동 뒤에 같은 Stack의 step 교체를 실행합니다.
      flow.pop({ animate: false });
      requestHistoryTick((resolve) => {
        replaceTabStep();
        resolve();
      });
      return;
    }

    flow.push('Tabs', nextParams);
  }

  return (
    <a {...props} href={tabUrl(nextParams)} onClick={handleClick} draggable={false}>
      {children}
    </a>
  );
}

function readTabsState(params: unknown): TabsState {
  if (!params || typeof params !== 'object') {
    return {};
  }

  const initialTab = 'initialTab' in params ? params.initialTab : undefined;
  const session = 'session' in params ? params.session : undefined;
  const attendance = 'attendance' in params ? params.attendance : undefined;

  return {
    ...(isTabName(initialTab) ? { initialTab } : {}),
    ...(session === 'team' ? { session } : {}),
    ...(attendance === 'attended' ? { attendance } : {}),
  };
}
