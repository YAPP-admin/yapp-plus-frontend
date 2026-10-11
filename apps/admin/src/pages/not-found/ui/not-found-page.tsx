import { Link } from '@tanstack/react-router';
import { content, description, errorCode, page, returnLink, title } from './not-found-page.css';

export function NotFoundPage() {
  return (
    <main className={page} aria-labelledby="not-found-title">
      <div className={content}>
        <p className={errorCode}>404</p>
        <h1 className={title} id="not-found-title">
          페이지를 찾을 수 없어요
        </h1>
        <p className={description}>주소를 확인하거나 대시보드로 이동해 주세요.</p>
        <Link className={returnLink} to="/">
          대시보드로 이동
        </Link>
      </div>
    </main>
  );
}
