import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { AppBar, AppBarBackButton, AppBarMain } from '../../../seed-design/ui/app-bar';
import { Link } from '@stackflow/link/future';
import { useAppScreenOptions } from '../platform';

export function NoticesActivity() {
  const appScreenOptions = useAppScreenOptions();

  return (
    <AppScreen {...appScreenOptions}>
      <AppScreenContent>
        <AppBar>
          <AppBarBackButton />
          <AppBarMain title="공지" />
        </AppBar>
        <main className="spike-content">
          <p className="spike-eyebrow">Notices Activity</p>
          <h1>공지 목록</h1>
          <p>BackButton과 typed Link가 future Stack과 함께 동작합니다.</p>
          <Link
            className="spike-link"
            activityName="NoticeDetail"
            activityParams={{ noticeId: 'spike-notice' }}
            data-testid="notice-detail-link"
          >
            공지 상세 열기
          </Link>
        </main>
      </AppScreenContent>
    </AppScreen>
  );
}
