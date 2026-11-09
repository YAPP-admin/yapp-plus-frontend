/** 링크의 기본 동작과 Stackflow 탭 탐색 경계를 소유합니다. */
import { useActivity, useFlow, useStepFlow } from '@stackflow/react';
import { type ComponentProps, type MouseEvent, type ReactNode } from 'react';
import { isTabName, tabUrl, type TabName, type TabsState } from './tab';
import { useHistoryTick } from '@stackflow/plugin-history-sync';

type TabLinkProps = Omit<ComponentProps<'a'>, 'href' | 'onClick'> & {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  params?: Pick<TabsState, 'session' | 'attendance' | 'noticeCategory'>;
  tab: TabName;
};

/** 탭 history를 추가하지 않고 기존 Tabs Activity의 step만 교체합니다. */
export function TabLink({ children, onClick, params, tab, ...props }: TabLinkProps) {
  const { requestHistoryTick } = useHistoryTick();
  const currentActivity = useActivity();
  const flow = useFlow();
  const tabsStep = useStepFlow('Tabs');
  const nextParams = { ...params, initialTab: tab } satisfies TabsState;

  function replaceTabStep() {
    // Stackflow가 현재 활성 Tabs를 대상으로 선택하게 하고 그 화면의 조회 조건을 유지합니다.
    tabsStep.replaceStep((currentParams) => ({
      ...readTabsState(currentParams),
      ...params,
      initialTab: tab,
    }));
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (props.target !== undefined && props.target !== '_self') ||
      props.download !== undefined
    ) {
      return;
    }

    event.preventDefault();
    // 현재 메뉴를 다시 누르는 동작은 무시하되 수정키·새 창 링크는 위에서 그대로 허용합니다.
    if (props['aria-current'] === 'page' && params === undefined) {
      return;
    }
    if (currentActivity.name === 'Tabs') {
      replaceTabStep();
      return;
    }

    if (currentActivity.name === 'Alerts') {
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
  const noticeCategory = 'noticeCategory' in params ? params.noticeCategory : undefined;

  return {
    ...(isTabName(initialTab) ? { initialTab } : {}),
    ...(session === 'team' ? { session } : {}),
    ...(attendance === 'attended' ? { attendance } : {}),
    ...(noticeCategory === 'ALL' ||
    noticeCategory === 'SESSION' ||
    noticeCategory === 'ASSIGNMENT' ||
    noticeCategory === 'OPERATION'
      ? { noticeCategory }
      : {}),
  };
}
