import Link from 'next/link';
import { content, description, title } from '../../../shared/ui/page.css';
import { link } from '../../../shared/ui/page-links.css';

export function NotFoundPage() {
  return (
    <main className={content}>
      <h1 className={title}>페이지를 찾을 수 없어요</h1>
      <p className={description}>주소를 확인하거나 홈으로 이동해 주세요.</p>
      <Link className={link} href="/">
        홈으로 이동
      </Link>
    </main>
  );
}
