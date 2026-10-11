import Link from 'next/link';
import { content, description, title } from '../../../shared/ui/page.css';
import { link } from '../../../shared/ui/page-links.css';

export function AttendancePage() {
  return (
    <main className={content}>
      <h1 className={title}>출석 내역</h1>
      <p className={description}>화면을 준비하고 있어요.</p>
      <Link className={link} href="/my/attendance/rules">
        출석 규칙
      </Link>
    </main>
  );
}
