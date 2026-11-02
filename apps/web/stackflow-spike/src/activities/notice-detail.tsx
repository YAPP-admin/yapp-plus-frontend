import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { AppBar, AppBarBackButton, AppBarMain } from '../../../seed-design/ui/app-bar';
import { useActivityParams } from '@stackflow/react/future';
import { useAppScreenOptions } from '../platform';

export function NoticeDetailActivity() {
  const { noticeId } = useActivityParams<'NoticeDetail'>();
  const appScreenOptions = useAppScreenOptions();

  return (
    <AppScreen {...appScreenOptions}>
      <AppScreenContent>
        <AppBar>
          <AppBarBackButton />
          <AppBarMain title="공지 상세" />
        </AppBar>
        <main className="spike-content">
          <p className="spike-eyebrow">NoticeDetail Activity</p>
          <h1>{noticeId}</h1>
          <p>직접 `/notices/:noticeId`로 진입하면 Notices 탭 위에 상세 화면을 복원합니다.</p>
        </main>
      </AppScreenContent>
    </AppScreen>
  );
}
