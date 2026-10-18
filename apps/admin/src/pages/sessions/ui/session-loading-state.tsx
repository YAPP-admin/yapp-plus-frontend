/** 목록의 초기 로딩은 카드 윤곽으로, 재조회 진행은 별도의 원형 표시로 안내합니다. */
import { ProgressCircle, Skeleton, VStack } from '@seed-design/react';
import { loadingCard, loadingStatus } from './session-state.css';

export function SessionLoadingState() {
  return (
    <VStack gap="x4">
      <output className={loadingStatus}>세션 목록을 불러오는 중입니다.</output>
      <div aria-hidden="true">
        <VStack gap="x4">
          {[0, 1].map((index) => (
            <VStack key={index} className={loadingCard} gap="x4">
              <Skeleton width="80px" height="x5" radius="8" />
              <Skeleton width="50%" height="x6" radius="8" />
              <Skeleton width="70%" height="x4" radius="8" />
              <Skeleton width="full" height="x10" radius="8" />
            </VStack>
          ))}
        </VStack>
      </div>
    </VStack>
  );
}

export function SessionRefreshingState() {
  return (
    <output className={loadingStatus}>
      <ProgressCircle.Root size="24" aria-hidden="true">
        <ProgressCircle.Track />
        <ProgressCircle.Range />
      </ProgressCircle.Root>
      세션 목록을 갱신하고 있어요.
    </output>
  );
}
