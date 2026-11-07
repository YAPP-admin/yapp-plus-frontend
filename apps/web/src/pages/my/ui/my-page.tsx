import { QueryErrorResetBoundary, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import type { MyAttendanceScoreResponse } from '@yapp-plus/api/generated';
import { sessionNameSchema } from '@yapp-plus/app-bridge';
import { ActionButton } from '@yapp-plus/ui';
import { useNativeAuthSession } from '@/features/auth';
import { memberScoreQueryOptions } from '@/features/member-attendance';
import { IconQuestionmarkCircleFill } from '@karrotmarket/react-monochrome-icon';
import { ActivityLink } from '@/app/navigation/activity-link';
import { Image } from '@/app/navigation/image';
import { AttendanceRulesDialog } from './attendance-rules-dialog';
import {
  activeChip,
  attendanceCard,
  avatar,
  cardStats,
  cardTitle,
  cardTitleGroup,
  container,
  menuChevron,
  menuItem,
  menuLabel,
  menuList,
  name,
  nameRow,
  profileInfo,
  profileRow,
  profileSection,
  questionButton,
  scoreGroup,
  scoreLabel,
  scoreValue,
  sectionDivider,
  queryNotice,
  statItem,
  statLabel,
  statValue,
  subDivider,
  subRow,
  subText,
} from './my-page.css';

export function MyPage() {
  const { phase, session } = useNativeAuthSession();
  const displayName = sessionNameSchema.parse(session?.name) ?? '—';
  const canQuery =
    phase === 'SIGNED_IN' ||
    (phase === 'BROWSER' && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true');
  return (
    <div className={container}>
      <section className={profileSection} aria-label="프로필 및 출석 현황">
        <div className={profileRow}>
          <div className={avatar}>
            <Image src="/images/my/user-profile.svg" alt="프로필" width={66} height={66} priority />
          </div>
          <div className={profileInfo}>
            <div className={nameRow}>
              <span className={name}>{displayName}</span>
              <span className={activeChip}>—</span>
            </div>
            <div className={subRow}>
              <span className={subText}>—</span>
              <span className={subDivider} aria-hidden="true" />
              <span className={subText}>—</span>
            </div>
          </div>
        </div>

        <div className={attendanceCard} aria-label="내 출석 현황">
          <div className={cardTitleGroup}>
            <span className={cardTitle}>내 출석 현황</span>
            <AttendanceRulesDialog>
              <button
                type="button"
                className={questionButton}
                aria-label="출석 규칙 안내"
                title="출석 규칙 안내"
              >
                <IconQuestionmarkCircleFill width={20} height={20} />
              </button>
            </AttendanceRulesDialog>
          </div>
          {canQuery ? (
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary onReset={reset} FallbackComponent={ScoreError}>
                  <Suspense
                    fallback={
                      <ScoreSummary
                        notice={
                          <output className={queryNotice}>출석 현황을 불러오고 있어요…</output>
                        }
                      />
                    }
                  >
                    <ScoreContent />
                  </Suspense>
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          ) : (
            <ScoreSummary
              notice={
                <output className={queryNotice}>
                  출석 현황은 YAPP+ 앱에 로그인한 후 확인할 수 있어요.
                </output>
              }
            />
          )}
        </div>
      </section>

      <hr className={sectionDivider} />

      <nav className={menuList} aria-label="마이페이지 메뉴">
        <ActivityLink activityName="Attendance" activityParams={{}} className={menuItem}>
          <span className={menuLabel}>출석 내역</span>
          <Image
            src="/images/my/chevron-right.svg"
            alt=""
            width={24}
            height={24}
            className={menuChevron}
          />
        </ActivityLink>
      </nav>
    </div>
  );
}

function ScoreError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ScoreSummary
      notice={
        <div className={queryNotice} role="alert">
          <p>출석 현황을 불러오지 못했어요.</p>
          <ActionButton
            type="button"
            variant="neutralWeak"
            size="small"
            onClick={resetErrorBoundary}
          >
            다시 시도
          </ActionButton>
        </div>
      }
    />
  );
}

function ScoreContent() {
  const { apiOptions } = useNativeAuthSession();
  const { data, error, isFetching, refetch } = useSuspenseQuery(
    memberScoreQueryOptions(apiOptions),
  );
  return (
    <ScoreSummary
      score={data.status === 'available' ? data.score : undefined}
      notice={
        error ? (
          <div className={queryNotice} role="alert">
            <p>출석 현황을 새로 불러오지 못했어요. 이전 내용을 표시하고 있어요.</p>
            <ActionButton
              type="button"
              variant="neutralWeak"
              size="small"
              loading={isFetching}
              disabled={isFetching}
              onClick={() => {
                void refetch({ cancelRefetch: false });
              }}
            >
              다시 시도
            </ActionButton>
          </div>
        ) : null
      }
    />
  );
}

function ScoreSummary({
  score,
  notice,
}: {
  score?: MyAttendanceScoreResponse;
  notice?: ReactNode;
}) {
  const stats = [
    { label: '출석', value: score?.attendanceCount ?? '—' },
    { label: '지각', value: score?.lateCount ?? '—' },
    { label: '결석', value: score?.absentCount ?? '—' },
    { label: '지각 면제권', value: '—' },
  ];
  return (
    <>
      <div className={scoreGroup}>
        <span className={scoreLabel}>총 점수</span>
        <span className={scoreValue}>{score ? `${score.totalScore}점` : '—'}</span>
      </div>
      {notice}
      <div className={cardStats}>
        {stats.map((stat) => (
          <div key={stat.label} className={statItem}>
            <span className={statLabel}>{stat.label}</span>
            <span className={statValue}>{stat.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}
