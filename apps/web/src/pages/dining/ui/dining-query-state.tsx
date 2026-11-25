/** 회식 조회의 대기·접근 불가·실패를 안내하며 실패에만 재시도 버튼을 제공합니다. */
import { ActionButton, Text } from '@yapp-plus/ui';
import { content } from '@/shared/ui/page.css';

/** 조회 실패 시 전달된 콜백으로 같은 Query를 다시 요청합니다. */
export function DiningQueryState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={content} role={onRetry ? 'alert' : 'status'}>
      <Text as="p" textStyle="t4Regular">
        {message}
      </Text>
      {onRetry && (
        <ActionButton type="button" variant="neutralWeak" onClick={onRetry}>
          다시 시도
        </ActionButton>
      )}
    </div>
  );
}
