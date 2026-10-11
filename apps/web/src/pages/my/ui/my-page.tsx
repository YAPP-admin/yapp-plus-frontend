import Link from 'next/link';
import { content, description, title } from '../../../shared/ui/page.css';
import { link, links } from '../../../shared/ui/page-links.css';

export function MyPage() {
  return (
    <main className={content}>
      <h1 className={title}>마이페이지</h1>
      <p className={description}>화면을 준비하고 있어요.</p>
      <nav className={links} aria-label="마이페이지 바로가기">
        <Link className={link} href="/my/attendance">
          출석 내역
        </Link>
        <Link className={link} href="/settings">
          설정
        </Link>
      </nav>
    </main>
  );
}
