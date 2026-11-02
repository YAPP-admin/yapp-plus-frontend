import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { useActivity } from '@stackflow/react';
import { useActivityParams } from '@stackflow/react/future';
import { useEffect, type ReactNode } from 'react';
import { SnackbarProvider } from '@yapp-plus/ui';
import { AlertsPage } from '@/pages/alerts';
import { AttendanceCompletePage } from '@/pages/attendance-complete';
import { AttendancePage } from '@/pages/attendance';
import { AttendanceRulesPage } from '@/pages/attendance-rules';
import { DevRoutesPage } from '@/pages/dev-routes';
import { HomePage } from '@/pages/home';
import { LoginErrorPage } from '@/pages/login-error';
import { LoginPage } from '@/pages/login';
import { MyPage } from '@/pages/my';
import { NotFoundPage } from '@/pages/not-found';
import { NoticeDetailPage } from '@/pages/notice-detail';
import { NoticesPage } from '@/pages/notices';
import { SchedulePage } from '@/pages/schedule';
import { SettingsPage } from '@/pages/settings';
import { SignupCompletePage } from '@/pages/signup-complete';
import { SignupPage } from '@/pages/signup';
import { SignupStatusPage } from '@/pages/signup-status';
import { SignupUnregisteredPage } from '@/pages/signup-unregistered';
import { TeamAttendanceCompletePage } from '@/pages/team-attendance-complete';
import { TeamAttendanceErrorPage } from '@/pages/team-attendance-error';
import { TeamAttendanceUploadPage } from '@/pages/team-attendance-upload';
import { AuthLayout } from '@/app/layouts/auth-layout';
import { DetailLayout } from '@/app/layouts/detail-layout';
import { PageShell } from '@/app/layouts/page-shell';
import { TabsLayout } from '@/app/layouts/tabs-layout';
import { notifyNavigation } from '../legacy/routes';
import { usePathname } from '../legacy/next-navigation';
import { useAppScreenOptions } from '../platform';
import { isTabName, type TabName } from '../tab';

const TAB_TITLES: Record<TabName, string> = {
  home: '홈',
  schedule: '일정',
  notices: '게시판',
  my: '마이페이지',
};

export function LegacyTabsActivity() {
  const { initialTab } = useActivityParams<'Tabs'>();
  const { isTop } = useActivity();
  const pathname = usePathname();
  const activeTab = normalizeTab(tabFromPathname(pathname) ?? initialTab);

  useEffect(() => {
    if (!isTop) {
      return;
    }

    const url = new URL(window.location.href);
    url.pathname = tabPath(activeTab);
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
    notifyNavigation();
  }, [activeTab, isTop]);

  return (
    <LegacyScreen title={TAB_TITLES[activeTab]}>
      <TabsLayout>
        <div hidden={activeTab !== 'home'}>
          <HomePage />
        </div>
        <div hidden={activeTab !== 'schedule'}>
          <SchedulePage />
        </div>
        <div hidden={activeTab !== 'notices'}>
          <NoticesPage />
        </div>
        <div hidden={activeTab !== 'my'}>
          <MyPage />
        </div>
      </TabsLayout>
    </LegacyScreen>
  );
}

function normalizeTab(value: unknown): TabName {
  return isTabName(value) ? value : 'home';
}

function tabPath(tab: TabName) {
  return tab === 'home' ? '/' : `/${tab}`;
}

function tabFromPathname(pathname: string): TabName | undefined {
  if (pathname === '/') {
    return 'home';
  }
  if (pathname === '/schedule' || pathname === '/notices' || pathname === '/my') {
    const tab = pathname.slice(1);
    return isTabName(tab) ? tab : undefined;
  }
  return undefined;
}

export function LegacyAlertsActivity() {
  return (
    <LegacyScreen title="알림">
      <TabsLayout>
        <AlertsPage />
      </TabsLayout>
    </LegacyScreen>
  );
}

export function LegacyNoticeDetailActivity() {
  const { noticeId } = useActivityParams<'NoticeDetail'>();
  return (
    <LegacyScreen title="게시판 상세">
      <PageShell header={null}>
        <NoticeDetailPage noticeId={noticeId} />
      </PageShell>
    </LegacyScreen>
  );
}

export function LegacyAttendanceActivity() {
  return (
    <LegacyScreen title="출석 내역" preventSwipeBack>
      <PageShell header={null} plain>
        <AttendancePage />
      </PageShell>
    </LegacyScreen>
  );
}

export function LegacyAttendanceRulesActivity() {
  return (
    <LegacyScreen title="출석 규칙" preventSwipeBack>
      <DetailLayout fallback="/my/attendance">
        <AttendanceRulesPage />
      </DetailLayout>
    </LegacyScreen>
  );
}

export function LegacyAttendanceCompleteActivity() {
  return (
    <LegacyScreen title="출석 완료" showBack={false} preventSwipeBack>
      <PageShell header={null} plain>
        <AttendanceCompletePage />
      </PageShell>
    </LegacyScreen>
  );
}

export function LegacySettingsActivity() {
  return (
    <LegacyScreen title="설정" preventSwipeBack>
      <PageShell header={null} plain>
        <SettingsPage />
      </PageShell>
    </LegacyScreen>
  );
}

export function LegacyTeamAttendanceUploadActivity() {
  return (
    <LegacyScreen title="팀 세션 인증 사진 올리기" preventSwipeBack>
      <TeamAttendanceUploadPage />
    </LegacyScreen>
  );
}

export function LegacyTeamAttendanceErrorActivity() {
  return (
    <LegacyScreen title="팀 세션 인증 오류">
      <TeamAttendanceErrorPage />
    </LegacyScreen>
  );
}

export function LegacyTeamAttendanceCompleteActivity() {
  return (
    <LegacyScreen title="팀 세션 인증 완료" showBack={false} preventSwipeBack>
      <TeamAttendanceCompletePage />
    </LegacyScreen>
  );
}

export function LegacyLoginActivity() {
  return (
    <LegacyScreen title="로그인" showBack={false} preventSwipeBack>
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    </LegacyScreen>
  );
}

export function LegacyLoginErrorActivity() {
  return (
    <LegacyScreen title="오류 안내">
      <AuthLayout>
        <LoginErrorPage />
      </AuthLayout>
    </LegacyScreen>
  );
}

export function LegacySignupActivity() {
  return (
    <LegacyScreen title="회원가입" preventSwipeBack>
      <AuthLayout>
        <SignupPage />
      </AuthLayout>
    </LegacyScreen>
  );
}

export function LegacySignupStatusActivity() {
  return (
    <LegacyScreen title="가입 승인 상태" preventSwipeBack>
      <AuthLayout>
        <SignupStatusPage />
      </AuthLayout>
    </LegacyScreen>
  );
}

export function LegacySignupCompleteActivity() {
  return (
    <LegacyScreen title="가입 완료" showBack={false} preventSwipeBack>
      <AuthLayout>
        <SignupCompletePage />
      </AuthLayout>
    </LegacyScreen>
  );
}

export function LegacySignupUnregisteredActivity() {
  return (
    <LegacyScreen title="미등록 회원 안내" showBack={false} preventSwipeBack>
      <AuthLayout>
        <SignupUnregisteredPage />
      </AuthLayout>
    </LegacyScreen>
  );
}

export function LegacyDevRoutesActivity() {
  return (
    <LegacyScreen title="개발 경로">
      <PageShell>
        <DevRoutesPage />
      </PageShell>
    </LegacyScreen>
  );
}

export function LegacyNotFoundActivity() {
  return (
    <LegacyScreen title="페이지를 찾을 수 없어요">
      <PageShell>
        <NotFoundPage />
      </PageShell>
    </LegacyScreen>
  );
}

function LegacyScreen({
  children,
  preventSwipeBack,
  showBack: _showBack = true,
  title,
}: {
  children: ReactNode;
  preventSwipeBack?: boolean;
  showBack?: boolean;
  title: string;
}) {
  const appScreenOptions = useAppScreenOptions();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | YAPP+`;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  return (
    <SnackbarProvider>
      <AppScreen {...appScreenOptions} layerOffsetTop="none" preventSwipeBack={preventSwipeBack}>
        <AppScreenContent>{children}</AppScreenContent>
      </AppScreen>
    </SnackbarProvider>
  );
}
