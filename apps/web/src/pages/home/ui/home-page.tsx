import Link from 'next/link';
import { content, description, title } from '../../../shared/ui/page.css';
import { link, links } from '../../../shared/ui/page-links.css';

export function HomePage() {
  return (
    <main className={content}>
      <h1 className={title}>홈</h1>
      <p className={description}>화면을 준비하고 있어요.</p>
      <nav className={links} aria-label="홈 바로가기">
        <Link className={link} href="/schedule">
          이번 달 세션 전체보기
        </Link>
        <Link className={link} href="/notices">
          공지 더보기
        </Link>
        <Link className={link} href="/my/attendance">
          최근 출석 전체보기
        </Link>
      </nav>
      {process.env.NODE_ENV === 'development' && (
        <Link className={link} href="/dev/routes">
          개발용 화면 목록
        </Link>
      )}
    </main>
  );
}
