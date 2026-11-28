/** 공지 상세 조회 중 제목·메타 정보·본문의 자리를 예약합니다. */
import { HStack, Skeleton, VStack } from '@seed-design/react';
import { skeletonPlaceholder } from '@/shared/ui/skeleton.css';
import { NoticeDetailHeader } from './notice-detail-header';
import { container, headerSection, contentSection } from './notice-detail-page.css';

/** 조회 중에도 상세 헤더의 뒤로가기를 사용할 수 있습니다. */
export function NoticeDetailLoading() {
  return (
    <>
      <NoticeDetailHeader categoryLabel="공지사항" />
      <main className={container}>
        <section aria-label="공지 상세를 불러오고 있어요" aria-busy="true">
          <VStack className={headerSection} gap="x3" aria-hidden="true">
            <Skeleton className={skeletonPlaceholder} width="85%" height="lineHeight.t7" />
            <HStack gap="x2">
              <Skeleton className={skeletonPlaceholder} width="52px" height="24px" />
              <Skeleton className={skeletonPlaceholder} width="100px" height="lineHeight.t3" />
            </HStack>
          </VStack>
          <div className={contentSection} aria-hidden="true">
            {Array.from({ length: 3 }, (_, index) => (
              <VStack key={index} gap="x2">
                <Skeleton className={skeletonPlaceholder} width="full" height="lineHeight.t4" />
                <Skeleton className={skeletonPlaceholder} width="full" height="lineHeight.t4" />
                <Skeleton className={skeletonPlaceholder} width="65%" height="lineHeight.t4" />
              </VStack>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
