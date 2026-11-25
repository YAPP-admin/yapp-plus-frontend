/** 마이페이지 프로필의 조회·오류 수명과 표시를 출석 현황과 분리합니다. */
import { useRefetchOnScreenReturn } from '@/shared/lib/screen-activity';
import { useThrowQueryError } from '@/shared/lib/query-error-policy';
import { ScreenQueryBoundary } from '@/shared/ui/screen-query-boundary';
import { Box, HStack, VStack } from '@seed-design/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, type ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { useNativeAuthSession } from '@/features/auth';
import { Image } from '@/app/navigation/image';
import { ErrorState } from '@/shared/ui/error-state';
import { toProfileDisplay } from '../model/profile-model';
import { profileQueryOptions } from '../model/profile-query';
import { activeChip, avatar, name, queryNotice, subDivider, subText } from './my-page.css';

/** 인증된 조회와 개발 MSW 조회만 프로필 요청을 허용합니다. */
export function ProfileSection({ canQuery }: { canQuery: boolean }) {
  return canQuery ? (
    <ScreenQueryBoundary renderFallback={(props) => <ProfileError {...props} />}>
      <Suspense fallback={<ProfileSummary notice={<ProfileLoading />} />}>
        <ProfileContent />
      </Suspense>
    </ScreenQueryBoundary>
  ) : (
    <ProfileSummary notice="프로필은 YAPP+ 앱에 로그인한 후 확인할 수 있어요." />
  );
}

function ProfileContent() {
  const { apiOptions } = useNativeAuthSession();
  const query = useSuspenseQuery(profileQueryOptions(apiOptions));
  useRefetchOnScreenReturn(query);
  useThrowQueryError(query);
  return <ProfileSummary profile={toProfileDisplay(query.data)} />;
}

function ProfileError({ resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorState
      variant="section"
      title="프로필을 불러오지 못했어요"
      titleAs="h2"
      retryLabel="프로필 다시 시도"
      onRetry={resetErrorBoundary}
    />
  );
}

function ProfileSummary({
  profile = { name: '—', membershipStatus: '—', generation: '—', position: '—' },
  notice,
}: {
  profile?: ReturnType<typeof toProfileDisplay>;
  notice?: ReactNode;
}) {
  return (
    <VStack gap="x1">
      <HStack align="center" py="x4_5" gap="x4">
        <Box className={avatar} width="66px" height="66px" borderRadius="full" flexShrink={0}>
          <Image src="/images/my/user-profile.svg" alt="프로필" width={66} height={66} />
        </Box>
        <VStack gap="x1" minWidth="0px">
          <HStack align="center" gap="x2">
            <span className={name}>{profile.name}</span>
            <span className={activeChip}>{profile.membershipStatus}</span>
          </HStack>
          <HStack align="center" gap="x2_5">
            <span className={subText}>{profile.generation}</span>
            <span className={subDivider} aria-hidden="true" />
            <span className={subText}>{profile.position}</span>
          </HStack>
        </VStack>
      </HStack>
      {notice}
    </VStack>
  );
}

function ProfileLoading() {
  return (
    <VStack as="output" gap="x2" className={queryNotice} aria-live="polite">
      프로필을 불러오는 중이에요
    </VStack>
  );
}
