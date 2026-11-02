import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { AppBar, AppBarMain } from '../../../seed-design/ui/app-bar';
import { useAppScreenOptions } from '../platform';

export function NotFoundActivity() {
  const appScreenOptions = useAppScreenOptions();

  return (
    <AppScreen {...appScreenOptions} preventSwipeBack>
      <AppScreenContent>
        <AppBar>
          <AppBarMain title="페이지를 찾을 수 없음" />
        </AppBar>
        <main className="spike-content">
          <p className="spike-eyebrow">NotFound Activity</p>
          <h1>요청한 화면을 찾을 수 없습니다.</h1>
        </main>
      </AppScreenContent>
    </AppScreen>
  );
}
