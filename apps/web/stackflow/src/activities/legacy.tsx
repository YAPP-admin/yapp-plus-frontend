import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { useActivity, useStep } from '@stackflow/react';
import { useActivityParams } from '@stackflow/react/future';
import type { ReactNode } from 'react';
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
import { useAppScreenOptions } from '../platform';
import { isTabName, type TabName, type TabsState } from '@/app/navigation/tab';
import { useTabsUrl } from '@/app/navigation/use-tabs-url';

const TAB_TITLES: Record<TabName, string> = {
  home: '홈',
  schedule: '일정',
  notices: '게시판',
  my: '마이페이지',
};

export function LegacyTabsActivity() {
  const activityParams = useActivityParams<'Tabs'>();
  const step = useStep();
  const stepParams = readTabsParams(step?.params);
  const initialParams = readTabsParams(activityParams);
  const activeTab = normalizeTab(stepParams.initialTab ?? initialParams.initialTab);
  const tabsState = {
    initialTab: activeTab,
    session: stepParams.session ?? initialParams.session,
    attendance: stepParams.attendance ?? initialParams.attendance,
  } satisfies TabsState;
  useTabsUrl(tabsState);

  return (
    <LegacyScreen title={TAB_TITLES[activeTab]}>
      <TabsLayout activeTab={activeTab}>
        <div hidden={activeTab !== 'home'}>
          <HomePage initialSession={tabsState.session} initialAttendance={tabsState.attendance} />
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

function readTabsParams(params: unknown): TabsState {
  if (!params || typeof params !== 'object') {
    return {};
  }

  const initialTab = 'initialTab' in params ? params.initialTab : undefined;
  return {
    ...(isTabName(initialTab) ? { initialTab } : {}),
    session: 'session' in params && params.session === 'team' ? params.session : undefined,
    attendance:
      'attendance' in params && params.attendance === 'attended' ? params.attendance : undefined,
  };
}

export function LegacyAlertsActivity() {
  const { empty } = useActivityParams<'Alerts'>();
  return (
    <LegacyScreen title="알림">
      <TabsLayout activeTab={null}>
        <AlertsPage showEmpty={empty === 'true'} />
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
  const { mode } = useActivityParams<'Attendance'>();
  return (
    <LegacyScreen title="출석 내역" preventSwipeBack>
      <PageShell header={null} plain>
        <AttendancePage initialMode={mode} />
      </PageShell>
    </LegacyScreen>
  );
}

export function LegacyAttendanceRulesActivity() {
  return (
    <LegacyScreen title="출석 규칙" preventSwipeBack>
      <DetailLayout>
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
  const { error } = useActivityParams<'TeamAttendanceUpload'>();
  return (
    <LegacyScreen title="팀 세션 인증 사진 올리기" preventSwipeBack>
      <TeamAttendanceUploadPage simulateError={error === 'true'} />
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
  const { error } = useActivityParams<'Login'>();
  return (
    <LegacyScreen title="로그인" showBack={false} preventSwipeBack>
      <AuthLayout>
        <LoginPage initialError={error === 'true'} />
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
      <AuthLayout showBack>
        <SignupPage />
      </AuthLayout>
    </LegacyScreen>
  );
}

export function LegacySignupStatusActivity() {
  return (
    <LegacyScreen title="가입 승인 상태" preventSwipeBack>
      <AuthLayout showBack>
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
  const { isTop } = useActivity();

  return (
    <>
      {isTop ? <title>{`${title} | YAPP+`}</title> : null}
      <SnackbarProvider>
        <AppScreen {...appScreenOptions} layerOffsetTop="none" preventSwipeBack={preventSwipeBack}>
          <AppScreenContent>{children}</AppScreenContent>
        </AppScreen>
      </SnackbarProvider>
    </>
  );
}
