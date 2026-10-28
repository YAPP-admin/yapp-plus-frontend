import Image from 'next/image';
import { emptyContainer, emptyGraphic, emptyText } from './notice-empty.css';

export function NoticeEmpty() {
  return (
    <output className={emptyContainer} aria-label="공지사항 없음">
      <Image
        src="/images/schedule/graphic-empty.svg"
        alt=""
        width={90}
        height={74}
        className={emptyGraphic}
      />
      <p className={emptyText}>아직 작성된 공지사항이 없어요</p>
    </output>
  );
}
