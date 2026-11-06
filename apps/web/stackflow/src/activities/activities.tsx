import { AppScreen, AppScreenContent } from '../../../seed-design/ui/app-screen';
import { useActivity, useStep } from '@stackflow/react';
import { useActivityParams } from '@stackflow/react/future';
import { Activity, type ReactNode } from 'react';
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
import { NativeAuthRedirect } from './native-auth-redirect';

const TAB_TITLES: Record<TabName, string> = {
  home: '홈',
  schedule: '일정',
  notices: '게시판',
  my: '마이페이지',
};

export function TabsActivity() {
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
    <ActivityScreen title={TAB_TITLES[activeTab]}>
      <TabsLayout activeTab={activeTab}>
        <Activity mode={activeTab === 'home' ? 'visible' : 'hidden'} name="HomeTab">
          <HomePage initialSession={tabsState.session} initialAttendance={tabsState.attendance} />
        </Activity>
        <Activity mode={activeTab === 'schedule' ? 'visible' : 'hidden'} name="ScheduleTab">
          <SchedulePage />
        </Activity>
        <Activity mode={activeTab === 'notices' ? 'visible' : 'hidden'} name="NoticesTab">
          <NoticesPage />
        </Activity>
        <Activity mode={activeTab === 'my' ? 'visible' : 'hidden'} name="MyTab">
          <MyPage />
        </Activity>
      </TabsLayout>
    </ActivityScreen>
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

export function AlertsActivity() {
  const { empty } = useActivityParams<'Alerts'>();
  return (
    <ActivityScreen title="알림">
      <TabsLayout activeTab={null}>
        <AlertsPage showEmpty={empty === 'true'} />
      </TabsLayout>
    </ActivityScreen>
  );
}

export function NoticeDetailActivity() {
  const { noticeId } = useActivityParams<'NoticeDetail'>();
  return (
    <ActivityScreen title="게시판 상세">
      <PageShell header={null}>
        <NoticeDetailPage noticeId={noticeId} />
      </PageShell>
    </ActivityScreen>
  );
}

export function AttendanceActivity() {
  const { mode } = useActivityParams<'Attendance'>();
  return (
    <ActivityScreen title="출석 내역" preventSwipeBack>
      <PageShell header={null} plain>
        <AttendancePage initialMode={mode} />
      </PageShell>
    </ActivityScreen>
  );
}

export function AttendanceRulesActivity() {
  return (
    <ActivityScreen title="출석 규칙" preventSwipeBack>
      <DetailLayout>
        <AttendanceRulesPage />
      </DetailLayout>
    </ActivityScreen>
  );
}

export function AttendanceCompleteActivity() {
  return (
    <ActivityScreen title="출석 완료" showBack={false} preventSwipeBack>
      <PageShell header={null} plain>
        <AttendanceCompletePage />
      </PageShell>
    </ActivityScreen>
  );
}

export function SettingsActivity() {
  return (
    <ActivityScreen title="설정" preventSwipeBack>
      <PageShell header={null} plain>
        <SettingsPage />
      </PageShell>
    </ActivityScreen>
  );
}

export function TeamAttendanceUploadActivity() {
  const { error } = useActivityParams<'TeamAttendanceUpload'>();
  return (
    <ActivityScreen title="팀 세션 인증 사진 올리기" preventSwipeBack>
      <TeamAttendanceUploadPage simulateError={error === 'true'} />
    </ActivityScreen>
  );
}

export function TeamAttendanceErrorActivity() {
  return (
    <ActivityScreen title="팀 세션 인증 오류">
      <TeamAttendanceErrorPage />
    </ActivityScreen>
  );
}

export function TeamAttendanceCompleteActivity() {
  return (
    <ActivityScreen title="팀 세션 인증 완료" showBack={false} preventSwipeBack>
      <TeamAttendanceCompletePage />
    </ActivityScreen>
  );
}

export function LoginActivity() {
  const { error } = useActivityParams<'Login'>();

  return (
    <ActivityScreen title="로그인" showBack={false} preventSwipeBack>
      <NativeAuthRedirect target="TABS" when="SIGNED_IN" />
      <AuthLayout>
        <LoginPage initialError={error === 'true'} />
      </AuthLayout>
    </ActivityScreen>
  );
}

export function LoginErrorActivity() {
  return (
    <ActivityScreen title="오류 안내">
      <AuthLayout>
        <LoginErrorPage />
      </AuthLayout>
    </ActivityScreen>
  );
}

export function SignupActivity() {
  return (
    <ActivityScreen title="회원가입" preventSwipeBack>
      <AuthLayout showBack>
        <SignupPage />
      </AuthLayout>
    </ActivityScreen>
  );
}

export function SignupStatusActivity() {
  return (
    <ActivityScreen title="가입 승인 상태" preventSwipeBack>
      <AuthLayout showBack>
        <SignupStatusPage />
      </AuthLayout>
    </ActivityScreen>
  );
}

export function SignupCompleteActivity() {
  return (
    <ActivityScreen title="가입 완료" showBack={false} preventSwipeBack>
      <AuthLayout>
        <SignupCompletePage />
      </AuthLayout>
    </ActivityScreen>
  );
}

export function SignupUnregisteredActivity() {
  return (
    <ActivityScreen title="미등록 회원 안내" showBack={false} preventSwipeBack>
      <AuthLayout>
        <SignupUnregisteredPage />
      </AuthLayout>
    </ActivityScreen>
  );
}

export function DevRoutesActivity() {
  return (
    <ActivityScreen title="개발 경로">
      <PageShell>
        <DevRoutesPage />
      </PageShell>
    </ActivityScreen>
  );
}

export function NotFoundActivity() {
  return (
    <ActivityScreen title="페이지를 찾을 수 없어요">
      <PageShell>
        <NotFoundPage />
      </PageShell>
    </ActivityScreen>
  );
}

function ActivityScreen({
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
  const appScreenOptions = useAppScreenOptions(preventSwipeBack);
  const { isTop } = useActivity();

  return (
    <>
      {isTop ? <title>{`${title} | YAPP+`}</title> : null}
      <SnackbarProvider>
        <AppScreen {...appScreenOptions} layerOffsetTop="none">
          <AppScreenContent>{children}</AppScreenContent>
        </AppScreen>
      </SnackbarProvider>
    </>
  );
}
