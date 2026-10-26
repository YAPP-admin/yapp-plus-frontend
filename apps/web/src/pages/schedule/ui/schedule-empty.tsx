import Image from 'next/image';
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
      <p className={emptyText}>일정을 준비중이에요</p>
    </output>
  );
}
