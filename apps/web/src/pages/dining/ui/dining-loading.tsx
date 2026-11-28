/** 뒤풀이 목록과 상세의 콘텐츠 구조를 구분하며 Query와 탐색 상태는 소유하지 않습니다. */
import { HStack, Skeleton, VStack } from '@seed-design/react';
import { Text } from '@yapp-plus/ui';
import { skeletonPlaceholder } from '@/shared/ui/skeleton.css';
import {
  communityHeader,
  communityTab,
  communityTabSelected,
  communityTabs,
  diningCard,
  listContent,
  listPage,
  page,
} from './dining-list-page.css';
import { detailInformation } from './dining-page.css';

/** 카드 목록과 필터의 자리를 예약하며 실제 필터나 링크처럼 동작하지 않습니다. */
export function DiningListLoading() {
  return (
    <main className={[page, listPage].join(' ')}>
      <header className={communityHeader}>
        <Text as="h1" textStyle="t8Bold">
          커뮤니티
        </Text>
        <div className={communityTabs}>
          <span className={[communityTab, communityTabSelected].join(' ')}>뒤풀이</span>
        </div>
      </header>
      <section className={listContent} aria-label="뒤풀이 목록을 불러오고 있어요" aria-busy="true">
        <HStack gap="x2" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              key={index}
              className={skeletonPlaceholder}
              width="72px"
              height="36px"
              radius="full"
            />
          ))}
        </HStack>
        <div aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={diningCard}>
              <Skeleton className={skeletonPlaceholder} width="64px" height="20px" />
              <Skeleton className={skeletonPlaceholder} width="75%" height="lineHeight.t5" />
              <Skeleton className={skeletonPlaceholder} width="55%" height="lineHeight.t3" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/** 조회와 무관한 상세 헤더 아래에 제목·설명·일정·참석 응답의 자리를 표시합니다. */
export function DiningDetailLoading() {
  return (
    <section aria-label="뒤풀이 상세를 불러오고 있어요" aria-busy="true">
      <VStack className={detailInformation} gap="x4" aria-hidden="true">
        <Skeleton className={skeletonPlaceholder} width="75%" height="lineHeight.t8" />
        <Skeleton className={skeletonPlaceholder} width="full" height="lineHeight.t4" />
        <Skeleton className={skeletonPlaceholder} width="60%" height="lineHeight.t4" />
        {Array.from({ length: 2 }, (_, index) => (
          <HStack key={index} gap="x4">
            <Skeleton className={skeletonPlaceholder} width="64px" height="lineHeight.t3" />
            <Skeleton className={skeletonPlaceholder} width="180px" height="lineHeight.t3" />
          </HStack>
        ))}
      </VStack>
      <VStack gap="x2" aria-hidden="true">
        <Skeleton className={skeletonPlaceholder} width="130px" height="lineHeight.t5" />
        <Skeleton className={skeletonPlaceholder} width="80px" height="lineHeight.t4" />
      </VStack>
    </section>
  );
}
