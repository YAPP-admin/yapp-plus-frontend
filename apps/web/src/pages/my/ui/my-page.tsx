/** 프로필·출석 카드와 메뉴를 조합하고 각 조회 영역의 로딩·오류를 격리합니다. */
import { useRefetchOnScreenReturn } from '@/shared/lib/screen-activity';
import { useThrowQueryError } from '@/shared/lib/query-error-policy';
import { Grid, HStack, VStack } from '@seed-design/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { useNativeAuthSession } from '@/features/auth';
import { memberScoreQueryOptions } from '@/features/member-attendance';
import { IconQuestionmarkCircleFill } from '@karrotmarket/react-monochrome-icon';
import { ActivityLink } from '@/app/navigation/activity-link';
import { Image } from '@/app/navigation/image';
import { AttendanceRulesDialog } from './attendance-rules-dialog';
import { ScoreErrorBoundary } from './score-error-boundary';
import { ScoreSummary } from './score-summary';
import { ScoreLoading } from './my-loading';
import {
  attendanceCard,
  cardTitle,
  container,
  menuChevron,
  menuItem,
  menuLabel,
  questionButton,
  sectionDivider,
  queryNotice,
} from './my-page.css';
import { ProfileSection } from './profile-section';

/** 인증 가능한 회원의 프로필·출석 조회와 마이페이지 탐색을 제공합니다. */
export function MyPage() {
  const { phase, isNative } = useNativeAuthSession();
  const canQuery =
    phase === 'SIGNED_IN' ||
    (phase === 'BROWSER' &&
      import.meta.env.DEV &&
      import.meta.env.VITE_API_MOCKING === 'true' &&
      import.meta.env.VITE_STATIC_CONTENT !== 'true');
  return (
    <VStack
      className={container}
      width="full"
      maxWidth="480px"
      mx="auto"
      minHeight="full"
      pb="x8"
      bg="bg.layerDefault"
    >
      <VStack as="section" px="x5" gap="x0_5" aria-label="프로필 및 출석 현황">
        <ProfileSection canQuery={canQuery} />

        <Grid
          columns="minmax(0, 1fr) auto"
          className={attendanceCard}
          borderRadius="r2"
          bg="bg.layerDefault"
          aria-label="내 출석 현황"
        >
          <HStack
            gridColumn="1"
            gridRow="1"
            py="x2"
            px="x4"
            bg="bg.neutralMuted"
            align="center"
            gap="x1"
          >
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
          </HStack>
          {canQuery ? (
            <ScoreErrorBoundary>
              <Suspense fallback={<ScoreLoading />}>
                <ScoreContent />
              </Suspense>
            </ScoreErrorBoundary>
          ) : (
            <ScoreSummary
              notice={
                <VStack as="output" gridColumn="1 / -1" p="x4" className={queryNotice}>
                  출석 현황은 YAPP+ 앱에 로그인한 후 확인할 수 있어요.
                </VStack>
              }
            />
          )}
        </Grid>
      </VStack>

      <hr className={sectionDivider} />

      <VStack as="nav" px="x5" mt="x2_5" aria-label="마이페이지 메뉴">
        <HStack asChild align="center" justify="space-between" py="x4">
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
        </HStack>
        <HStack asChild align="center" justify="space-between" py="x4">
          <a
            href="https://pf.kakao.com/_aGxofd"
            target={isNative ? '_self' : '_blank'}
            rel={isNative ? undefined : 'noopener noreferrer'}
            className={menuItem}
          >
            <span className={menuLabel}>이용문의</span>
            <Image
              src="/images/my/chevron-right.svg"
              alt=""
              width={24}
              height={24}
              className={menuChevron}
            />
          </a>
        </HStack>
      </VStack>
    </VStack>
  );
}

function ScoreContent() {
  const { apiOptions } = useNativeAuthSession();
  const query = useSuspenseQuery(memberScoreQueryOptions(apiOptions));
  useRefetchOnScreenReturn(query);
  useThrowQueryError(query);
  const { data } = query;
  return <ScoreSummary score={data.status === 'available' ? data.score : undefined} />;
}
