import { List, Skeleton, VStack } from '@seed-design/react';
import { item } from './schedule-item.css';
import { list } from './schedule-page.css';
import { placeholder } from './schedule-loading.css';

export function ScheduleLoading() {
  return (
    <section aria-label="일정을 불러오고 있어요" aria-busy="true">
      <List.Root className={list} aria-hidden="true">
        {Array.from({ length: 4 }, (_, row) => (
          <List.Item key={row} className={item} alignItems="flex-start">
            <List.Prefix pr="x4">
              <Skeleton className={placeholder} width="70px" height="lineHeight.t4" />
            </List.Prefix>
            <List.Content gap="x2">
              <Skeleton className={placeholder} width="80%" height="lineHeight.t4" />
              <VStack gap="x1">
                <Skeleton className={placeholder} width="60%" height="lineHeight.t2" />
                <Skeleton className={placeholder} width="90%" height="lineHeight.t2" />
              </VStack>
            </List.Content>
          </List.Item>
        ))}
      </List.Root>
    </section>
  );
}
