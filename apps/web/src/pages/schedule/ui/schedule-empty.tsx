import { Image } from '@/app/navigation/image';
import { emptyContainer, emptyGraphic, emptyText } from './schedule-empty.css';

export function ScheduleEmpty() {
  return (
    <output className={emptyContainer} aria-label="일정 없음">
      <Image
        src="/images/schedule/graphic-empty.svg"
        alt=""
        width={90}
        height={74}
        className={emptyGraphic}
      />
      <p className={emptyText}>등록된 세션 일정이 없어요</p>
    </output>
  );
}
