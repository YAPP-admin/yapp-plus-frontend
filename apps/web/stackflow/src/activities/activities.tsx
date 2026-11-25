/** URL·step params를 화면 슬라이스와 연결하며 탭의 선택과 패널 수명을 소유합니다. */
import { useEffect, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { find5Options } from '@yapp-plus/api/generated';
import { teamAttendanceTargetSchema, type TeamAttendanceReceipt } from '@/features/team-attendance';
import { useActivity, useActivityParams, useStepFlow } from '@stackflow/react';
import { teamPhotoDevelopmentEnabled } from './team-photo-development';
import { ActivityScreen } from './activity-screen';
import { useSignupFunnel } from './use-signup-funnel';
import { IconChevronLeftLine } from '@karrotmarket/react-monochrome-icon';
import { ActionButton, Icon } from '@yapp-plus/ui';
import { AlertsPage } from '@/pages/alerts';
import { AttendanceCompletePage } from '@/pages/attendance-complete';
import { AttendancePage } from '@/pages/attendance';
import { AttendanceRulesPage } from '@/pages/attendance-rules';
import { DevRoutesPage } from '@/pages/dev-routes';
import { DiningListPage, DiningDetailPage } from '@/pages/dining';
import { HomePage, useAttendanceConfirmation } from '@/pages/home';
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
import { SignupStatusContent } from './signup-status-content';
import { SignupUnregisteredPage } from '@/pages/signup-unregistered';
import { TeamAttendanceCompletePage } from '@/pages/team-attendance-complete';
import { TeamAttendanceErrorPage } from '@/pages/team-attendance-error';
import {
  TeamAttendanceUploadPage,
  useTeamAttendancePhotoDraft,
} from '@/pages/team-attendance-upload';
import { AuthLayout } from '@/app/layouts/auth-layout';
import { DetailLayout } from '@/app/layouts/detail-layout';
import { PageShell } from '@/app/layouts/page-shell';
import { TabPanel, TabsLayout } from '@/app/layouts/tabs-layout';
import { BackButton } from '@/app/navigation/back-button';
import { iconBackButton } from '@/app/navigation/back-button.css';
import {
  isNoticeCategory,
  isTabName,
  type NoticeCategory,
  type TabName,
  type TabsState,
} from '@/app/navigation/tab';
import { useTabsUrl } from '@/app/navigation/use-tabs-url';
import { NativeAuthRedirect } from './native-auth-redirect';
import { useNativeAuthSession } from '@/features/auth';
import { staticContentEnabled } from '@/features/static-content';
import { QueryBoundary } from '@/shared/ui/query-boundary';

const TAB_TITLES: Record<TabName, string> = {
  home: '홈',
  schedule: '일정',
  notices: '게시판',
  community: '커뮤니티',
  my: '마이페이지',
};

export function TabsActivity() {
  const activityParams = useActivityParams<'Tabs'>();
  const activity = useActivity();
  const tabsStep = useStepFlow('Tabs');
  const step = activity.steps.filter((item) => item.id !== activity.id).at(-1);
  const stepParams = readTabsParams(step?.params);
  const initialParams = readTabsParams(activityParams);
  const activeTab = normalizeTab(stepParams.initialTab ?? initialParams.initialTab);
  const tabsState = {
    initialTab: activeTab,
    session: stepParams.session ?? initialParams.session,
    attendance: stepParams.attendance ?? initialParams.attendance,
    noticeCategory: stepParams.noticeCategory ?? initialParams.noticeCategory,
  } satisfies TabsState;
  useTabsUrl(tabsState);

  return (
    <ActivityScreen
      title={TAB_TITLES[activeTab]}
      background={activeTab === 'home' ? 'layerBasement' : 'layerDefault'}
    >
      <TabsLayout
        activeTab={activeTab}
        onTabChange={(initialTab) => {
          tabsStep.replaceStep({ ...tabsState, initialTab }, { targetActivityId: activity.id });
        }}
      >
        <TabPanel tab="home" active={activeTab === 'home'}>
          <HomePage
            initialSession={
              import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true'
                ? tabsState.session
                : undefined
            }
            initialAttendance={
              import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true'
                ? tabsState.attendance
                : undefined
            }
          />
        </TabPanel>
        <TabPanel tab="schedule" active={activeTab === 'schedule'}>
          <SchedulePage />
        </TabPanel>
        <TabPanel tab="notices" active={activeTab === 'notices'}>
          <NoticesPage
            category={tabsState.noticeCategory ?? 'ALL'}
            onCategoryChange={(noticeCategory: NoticeCategory) => {
              tabsStep.replaceStep(
                { ...tabsState, initialTab: 'notices', noticeCategory },
                { targetActivityId: activity.id },
              );
            }}
          />
        </TabPanel>
        <TabPanel tab="community" active={activeTab === 'community'}>
          <DiningListPage />
        </TabPanel>
        <TabPanel tab="my" active={activeTab === 'my'}>
          <MyPage />
        </TabPanel>
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
  const noticeCategory = 'noticeCategory' in params ? params.noticeCategory : undefined;
  return {
    ...(isTabName(initialTab) ? { initialTab } : {}),
    session: 'session' in params && params.session === 'team' ? params.session : undefined,
    attendance:
      'attendance' in params && params.attendance === 'attended' ? params.attendance : undefined,
    ...(isNoticeCategory(noticeCategory) ? { noticeCategory } : {}),
  };
}

export function AlertsActivity() {
  return (
    <ActivityScreen title="알림">
      <TabsLayout activeTab={null}>
        <AlertsPage />
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
  return (
    <ActivityScreen title="출석 내역" preventSwipeBack>
      <PageShell header={null} plain>
        <AttendancePage />
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
  const confirmed = useAttendanceConfirmation();
  if (confirmed === null) {
    return <NotFoundActivity />;
  }
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
  const { phase } = useNativeAuthSession();
  const activity = useActivity();
  const params = useActivityParams<'TeamAttendanceUpload'>();
  const { sessionId: sessionIdParam } = params;
  const { selectedPhoto, clearPhoto } = useTeamAttendancePhotoDraft();
  const stepFlow = useStepFlow('TeamAttendanceUpload');
  const step = activity.steps.filter((item) => item.id !== activity.id).at(-1);
  const isSubmissionComplete = (step?.params ?? params).stage === 'complete';
  const [receipt, setReceipt] = useState<TeamAttendanceReceipt | null>(null);
  const sessionId = Number(sessionIdParam);
  useEffect(() => clearPhoto, [clearPhoto]);
  useEffect(() => {
    if (isSubmissionComplete) {
      clearPhoto();
    }
  }, [clearPhoto, isSubmissionComplete]);

  if (
    !sessionIdParam ||
    staticContentEnabled() ||
    (phase !== 'SIGNED_IN' && !teamPhotoDevelopmentEnabled()) ||
    (!selectedPhoto && !isSubmissionComplete)
  ) {
    return <NotFoundActivity />;
  }
  if (isSubmissionComplete) {
    return receipt ? (
      <ActivityScreen title="팀 세션 인증 완료" preventSwipeBack>
        <TeamAttendanceCompletePage receipt={receipt} />
      </ActivityScreen>
    ) : (
      <NotFoundActivity />
    );
  }
  return activity.isTop && selectedPhoto ? (
    <QueryBoundary
      pendingFallback={<output>팀원을 불러오고 있어요…</output>}
      errorFallback={<output role="alert">팀원을 불러오지 못했어요. 다시 확인해 주세요.</output>}
    >
      <TeamPhotoSubmissionFlow
        sessionId={sessionId}
        onSubmitted={(result) => {
          setReceipt(result);
          stepFlow.replaceStep(
            { sessionId: sessionIdParam, stage: 'complete' },
            { targetActivityId: activity.id },
          );
        }}
      />
    </QueryBoundary>
  ) : null;
}

/** 입력·완료를 한 화면 수명으로 묶고 계정 변경 시 기존 인증 경계가 함께 폐기한다. */
function TeamPhotoSubmissionFlow({
  sessionId,
  onSubmitted,
}: {
  sessionId: number;
  onSubmitted: (receipt: TeamAttendanceReceipt) => void;
}) {
  const { apiOptions } = useNativeAuthSession();
  const { data: team } = useSuspenseQuery(find5Options({ ...apiOptions, path: { sessionId } }));
  const target = teamAttendanceTargetSchema.parse({
    sessionId,
    teamId: team.teamId,
    teamName: team.teamName,
    selfMembershipId: team.members.find((member) => member.isMe)?.membershipId ?? 0,
    members: team.members.map((member) => ({
      membershipId: member.membershipId,
      name: member.name,
      positionLabel:
        member.position === null
          ? '—'
          : {
              PM: 'PM',
              DESIGN: 'Design',
              WEB: 'Web',
              MOBILE: 'Mobile',
              ANDROID: 'Android',
              IOS: 'iOS',
              SERVER: 'Server',
              AI_NATIVE: 'AI Native',
            }[member.position],
    })),
  });

  return (
    <ActivityScreen title="팀 세션 인증 사진 올리기" preventSwipeBack>
      <TeamAttendanceUploadPage target={target} onSubmitted={onSubmitted} />
    </ActivityScreen>
  );
}

export function TeamAttendanceErrorActivity() {
  if (!teamPhotoDevelopmentEnabled()) {
    return <NotFoundActivity />;
  }
  return (
    <ActivityScreen title="팀 세션 인증 오류">
      <TeamAttendanceErrorPage />
    </ActivityScreen>
  );
}

export function LoginActivity() {
  const { error } = useActivityParams<'Login'>();

  return (
    <ActivityScreen title="로그인" showBack={false} preventSwipeBack>
      <NativeAuthRedirect target="TABS" when="SIGNED_IN" />
      <NativeAuthRedirect target="REVIEW" when="REVIEW_REQUIRED" />
      <AuthLayout>
        <LoginPage initialError={error === 'true'} />
      </AuthLayout>
    </ActivityScreen>
  );
}

export function LoginErrorActivity() {
  return (
    <ActivityScreen title="오류 안내" preventSwipeBack>
      <AuthLayout>
        <LoginErrorPage />
      </AuthLayout>
    </ActivityScreen>
  );
}

export function SignupActivity() {
  const funnel = useSignupFunnel();

  return (
    <ActivityScreen title="회원가입" preventSwipeBack>
      <NativeAuthRedirect target="REVIEW" when="REVIEW_REQUIRED" />
      <PageShell
        plain
        backButton={
          funnel.step === 'phone' ? (
            <ActionButton
              type="button"
              className={iconBackButton}
              variant="ghost"
              size="medium"
              layout="iconOnly"
              aria-label="뒤로가기"
              onClick={funnel.back}
            >
              <Icon svg={<IconChevronLeftLine />} />
            </ActionButton>
          ) : (
            <BackButton fallbackActivityName="Login" fallbackActivityParams={{}} iconOnly />
          )
        }
      >
        <SignupPage step={funnel.step} onPhoneStep={funnel.next} onNameStep={funnel.back} />
      </PageShell>
    </ActivityScreen>
  );
}

export function SignupStatusActivity() {
  return (
    <ActivityScreen title="가입 승인 상태" preventSwipeBack>
      <SignupStatusContent />
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
  const { isActive } = useActivity();

  return (
    <ActivityScreen title="개발 경로">
      <PageShell>
        <DevRoutesPage isActive={isActive} />
      </PageShell>
    </ActivityScreen>
  );
}

export function DiningDetailActivity() {
  const { diningId } = useActivityParams<'DiningDetail'>();
  return (
    <ActivityScreen title="뒤풀이" snackbarPosition="safeArea">
      <PageShell header={null} plain>
        <DiningDetailPage diningId={diningId} />
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
