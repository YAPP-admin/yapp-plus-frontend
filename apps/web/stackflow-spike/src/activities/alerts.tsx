import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { AppBar, AppBarBackButton, AppBarMain } from '../../../seed-design/ui/app-bar';
import { useActions } from '@stackflow/react';
import { useStepFlow } from '@stackflow/react/future';
import { useAppScreenOptions } from '../platform';
import type { TabName } from '../tab';

export function AlertsActivity() {
  const actions = useActions();
  const stepFlow = useStepFlow('Tabs');
  const appScreenOptions = useAppScreenOptions();

  const moveToTab = (tab: TabName) => {
    actions.pop({ animate: false });
    window.setTimeout(() => {
      stepFlow.replaceStep({ initialTab: tab });
    }, 0);
  };

  return (
    <AppScreen {...appScreenOptions} preventSwipeBack>
      <AppScreenContent>
        <AppBar>
          <AppBarBackButton />
          <AppBarMain title="알림" />
        </AppBar>
        <main className="spike-content">
          <p className="spike-eyebrow">Alerts Activity</p>
          <h1>알림</h1>
          <p>
            정상 진입에서는 Home 위에 추가 step으로 열리고, 탭 이동 시 pop + replace를 사용합니다.
          </p>
          {(['schedule', 'notices', 'my'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              data-testid={`alerts-${tab}`}
              onClick={() => moveToTab(tab)}
            >
              {tab} 탭으로 이동
            </button>
          ))}
        </main>
      </AppScreenContent>
    </AppScreen>
  );
}
