import { Link } from '@tanstack/react-router';
import { page, title, description, returnLink } from './member-import-page.css';

export function MemberImportPage() {
  return (
    <main className={page}>
      <h1 className={title}>명단 업로드</h1>
      <p className={description}>회원 명단 업로드 기능을 준비 중입니다.</p>
      <Link className={returnLink} to="/members" search={{}}>
        회원 목록으로 돌아가기
      </Link>
    </main>
  );
}
