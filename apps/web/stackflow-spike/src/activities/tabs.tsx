import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { AppBar, AppBarMain } from '../../../seed-design/ui/app-bar';
import { useStep } from '@stackflow/react';
import { useActivityParams, useFlow, useStepFlow } from '@stackflow/react/future';
import { useEffect, useState, type ReactNode } from 'react';
import { useAppScreenOptions } from '../platform';
import { isTabName, tabNames, tabPath, type TabName } from '../tab';

const tabLabels: Record<TabName, string> = {
  home: '홈',
  schedule: '일정',
  notices: '공지',
  my: '마이',
};

export function TabsActivity() {
  const { initialTab } = useActivityParams<'Tabs'>();
  const step = useStep();
  const flow = useFlow();
  const stepFlow = useStepFlow('Tabs');
  const appScreenOptions = useAppScreenOptions();
  const activeTab = normalizeTab(step?.params.initialTab ?? initialTab);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.history.replaceState(window.history.state, '', tabPath(activeTab));
  }, [activeTab]);

  const selectTab = (tab: TabName) => {
    if (tab === activeTab) {
      return;
    }

    stepFlow.replaceStep({ initialTab: tab });
  };

  return (
    <AppScreen {...appScreenOptions}>
      <AppScreenContent>
        <AppBar>
          <AppBarMain title={tabLabels[activeTab]} />
        </AppBar>
        <main className="spike-tabs-content">
          <div className="spike-tab-panels" aria-live="polite">
            <TabPanel active={activeTab === 'home'} label="홈 패널">
              <HomePanel onOpenAlerts={() => flow.push('Alerts', {}, { animate: false })} />
            </TabPanel>
            <TabPanel active={activeTab === 'schedule'} label="일정 패널">
              <SchedulePanel />
            </TabPanel>
            <TabPanel active={activeTab === 'notices'} label="공지 패널">
              <NoticesPanel />
            </TabPanel>
            <TabPanel active={activeTab === 'my'} label="마이 패널">
              <MyPanel />
            </TabPanel>
          </div>
          <nav className="spike-tab-navigation" aria-label="하단 메뉴">
            {tabNames.map((tab) => (
              <button
                key={tab}
                type="button"
                aria-current={activeTab === tab ? 'page' : undefined}
                data-testid={`tab-${tab}`}
                onClick={() => selectTab(tab)}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </nav>
        </main>
      </AppScreenContent>
    </AppScreen>
  );
}

function normalizeTab(value: unknown): TabName {
  return isTabName(value) ? value : 'home';
}

function TabPanel({
  active,
  children,
  label,
}: {
  active: boolean;
  children: ReactNode;
  label: string;
}) {
  return (
    <section
      aria-label={label}
      className="spike-tab-panel"
      data-active={active ? 'true' : 'false'}
      hidden={!active}
    >
      {children}
    </section>
  );
}

function HomePanel({ onOpenAlerts }: { onOpenAlerts: () => void }) {
  const [draft, setDraft] = useState('');

  return (
    <div className="spike-panel-content">
      <p className="spike-eyebrow">TabsActivity · Home</p>
      <h1>홈 패널</h1>
      <p>탭 전환은 replaceStep으로 처리되어 브라우저 history에 추가되지 않습니다.</p>
      <label>
        홈 입력 상태
        <input
          aria-label="홈 입력 상태"
          data-testid="home-state"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <button type="button" data-testid="open-alerts" onClick={onOpenAlerts}>
        알림 열기
      </button>
    </div>
  );
}

function SchedulePanel() {
  const [filter, setFilter] = useState('전체');

  return (
    <div className="spike-panel-content">
      <p className="spike-eyebrow">TabsActivity · Schedule</p>
      <h1>일정 패널</h1>
      <p>실행 중 탭 이동에서 필터 상태를 유지하는지 확인합니다.</p>
      <label>
        일정 필터
        <select
          aria-label="일정 필터"
          data-testid="schedule-state"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option>전체</option>
          <option>이번 달</option>
          <option>지난 일정</option>
        </select>
      </label>
    </div>
  );
}

function NoticesPanel() {
  const [filter, setFilter] = useState('전체');

  return (
    <div className="spike-panel-content">
      <p className="spike-eyebrow">TabsActivity · Notices</p>
      <h1>공지 패널</h1>
      <p>공지 목록은 5단계에서 대표 흐름으로 이전합니다.</p>
      <label>
        공지 필터
        <select
          aria-label="공지 필터"
          data-testid="notices-state"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option>전체</option>
          <option>세션</option>
          <option>제출</option>
        </select>
      </label>
    </div>
  );
}

function MyPanel() {
  const [name, setName] = useState('');

  return (
    <div className="spike-panel-content">
      <p className="spike-eyebrow">TabsActivity · My</p>
      <h1>마이 패널</h1>
      <p>마이 화면은 6단계에서 상세 화면과 함께 이전합니다.</p>
      <label>
        마이 입력 상태
        <input
          aria-label="마이 입력 상태"
          data-testid="my-state"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
    </div>
  );
}
