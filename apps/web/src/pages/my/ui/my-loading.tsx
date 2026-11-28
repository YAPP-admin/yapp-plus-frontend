/** 프로필·점수의 실제 자리만 표현하며 데이터 조회와 재시도는 호출자가 소유합니다. */
import { HStack, Skeleton, VStack } from '@seed-design/react';
import { avatarPlaceholder, placeholder } from './my-loading.css';

/** 기본 캐릭터나 임시 소속을 노출하지 않는 프로필 조회 placeholder입니다. */
export function ProfileLoading() {
  return (
    <HStack as="section" aria-label="프로필 불러오는 중" aria-busy="true" py="x4_5" gap="x4">
      <HStack aria-hidden="true" align="center" gap="x4" width="full">
        <Skeleton className={avatarPlaceholder} radius="full" width="66px" height="66px" />
        <VStack gap="x1" grow>
          <HStack gap="x2" align="center">
            <Skeleton className={placeholder} width="100px" height="lineHeight.t7" />
            <Skeleton className={placeholder} width="60px" height="lineHeight.t3" />
          </HStack>
          <Skeleton className={placeholder} width="100px" height="lineHeight.t4" />
        </VStack>
      </HStack>
    </HStack>
  );
}

/** 카드 헤더와 규칙 버튼은 유지하고 총점·통계 값의 자리를 예약합니다. */
export function ScoreLoading() {
  return (
    <>
      <HStack
        gridColumn="2"
        gridRow="1"
        py="x2"
        pr="x4"
        bg="bg.neutralMuted"
        align="center"
        aria-hidden="true"
      >
        <Skeleton className={placeholder} width="80px" height="lineHeight.t5" />
      </HStack>
      <HStack
        as="section"
        aria-label="출석 현황 불러오는 중"
        aria-busy="true"
        gridColumn="1 / -1"
        p="x1"
        gap="x1"
      >
        {Array.from({ length: 4 }, (_, item) => (
          <VStack key={item} grow align="center" py="x3" gap="x1" aria-hidden="true">
            <Skeleton className={placeholder} width="48px" height="lineHeight.t2" />
            <Skeleton className={placeholder} width="24px" height="lineHeight.t4" />
          </VStack>
        ))}
      </HStack>
    </>
  );
}
