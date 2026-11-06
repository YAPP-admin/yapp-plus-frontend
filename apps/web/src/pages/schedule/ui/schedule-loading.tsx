import { List, Skeleton } from '@seed-design/react';
import { item, metaContainer } from './schedule-item.css';
import { list, srOnly } from './schedule-page.css';
import { placeholder } from './schedule-loading.css';

export function ScheduleLoading() {
  return (
    <div>
      <output className={srOnly}>일정을 불러오고 있어요…</output>
      <List.Root className={list} aria-hidden="true">
        {[0, 1, 2, 3].map((row) => (
          <List.Item key={row} className={item} alignItems="flex-start">
            <List.Prefix pr="x4">
              <Skeleton className={placeholder} width="70px" height="lineHeight.t4" />
            </List.Prefix>
            <List.Content gap="x2">
              <Skeleton className={placeholder} width="80%" height="lineHeight.t4" />
              <div className={metaContainer}>
                <Skeleton className={placeholder} width="60%" height="lineHeight.t2" />
                <Skeleton className={placeholder} width="90%" height="lineHeight.t2" />
              </div>
            </List.Content>
          </List.Item>
        ))}
      </List.Root>
    </div>
  );
}
