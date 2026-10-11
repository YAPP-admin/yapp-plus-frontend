import { page, title, description } from './notifications-page.css';

export function NotificationsPage() {
  return (
    <main className={page}>
      <h1 className={title}>알림 발송 내역</h1>
      <p className={description}>알림 발송 내역을 준비 중입니다.</p>
    </main>
  );
}
