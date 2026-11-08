import { useRefetchOnScreenReturn } from '@/shared/lib/screen-activity';
import { Box, Grid, HStack, VStack } from '@seed-design/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { sessionNameSchema } from '@yapp-plus/app-bridge';
import { ActionButton } from '@yapp-plus/ui';
import { useNativeAuthSession } from '@/features/auth';
import { memberScoreQueryOptions } from '@/features/member-attendance';
import { IconQuestionmarkCircleFill } from '@karrotmarket/react-monochrome-icon';
import { ActivityLink } from '@/app/navigation/activity-link';
import { Image } from '@/app/navigation/image';
import { AttendanceRulesDialog } from './attendance-rules-dialog';
import { ScoreErrorBoundary } from './score-error-boundary';
import { ScoreSummary } from './score-summary';
import {
  activeChip,
  attendanceCard,
  avatar,
  cardTitle,
  container,
  menuChevron,
  menuItem,
  menuLabel,
  name,
  questionButton,
  sectionDivider,
  queryNotice,
  subDivider,
  subText,
} from './my-page.css';

export function MyPage() {
  const { phase, session } = useNativeAuthSession();
  const displayName = sessionNameSchema.parse(session?.name) ?? '—';
  const canQuery =
    phase === 'SIGNED_IN' ||
    (phase === 'BROWSER' && import.meta.env.DEV && import.meta.env.VITE_API_MOCKING === 'true');
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
        <HStack align="center" py="x4_5" gap="x4">
          <Box className={avatar} width="66px" height="66px" borderRadius="full" flexShrink={0}>
            <Image src="/images/my/user-profile.svg" alt="프로필" width={66} height={66} priority />
          </Box>
          <VStack gap="x1" minWidth="0px">
            <HStack align="center" gap="x2">
              <span className={name}>{displayName}</span>
              <span className={activeChip}>—</span>
            </HStack>
            <HStack align="center" gap="x2_5">
              <span className={subText}>—</span>
              <span className={subDivider} aria-hidden="true" />
              <span className={subText}>—</span>
            </HStack>
          </VStack>
        </HStack>

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
              <Suspense
                fallback={
                  <ScoreSummary
                    notice={
                      <VStack as="output" gridColumn="1 / -1" p="x4" className={queryNotice}>
                        출석 현황을 불러오고 있어요…
                      </VStack>
                    }
                  />
                }
              >
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
      </VStack>
    </VStack>
  );
}

function ScoreContent() {
  const { apiOptions } = useNativeAuthSession();
  const query = useSuspenseQuery(memberScoreQueryOptions(apiOptions));
  useRefetchOnScreenReturn(query);
  const { data, error, isFetching, refetch } = query;
  return (
    <ScoreSummary
      score={data.status === 'available' ? data.score : undefined}
      notice={
        error ? (
          <VStack
            gridColumn="1 / -1"
            align="flex-start"
            gap="x2"
            p="x4"
            className={queryNotice}
            role="alert"
          >
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
          </VStack>
        ) : null
      }
    />
  );
}
