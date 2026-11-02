import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { AppBar, AppBarMain } from '../../../seed-design/ui/app-bar';
import { Link } from '@stackflow/link/future';
import { useAppScreenOptions } from '../platform';

export function HomeActivity() {
  const appScreenOptions = useAppScreenOptions();

  return (
    <AppScreen {...appScreenOptions}>
      <AppScreenContent>
        <AppBar>
          <AppBarMain title="홈" />
        </AppBar>
        <main className="spike-content">
          <p className="spike-eyebrow">Stackflow 호환성 셸</p>
          <h1>Home Activity</h1>
          <p>Next production 경로와 분리된 Vite 검증 화면입니다.</p>
          <Link
            className="spike-link"
            activityName="Tabs"
            activityParams={{ initialTab: 'notices' }}
            data-testid="notices-link"
          >
            공지 목록 열기
          </Link>
        </main>
      </AppScreenContent>
    </AppScreen>
  );
}
