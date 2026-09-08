import { createFileRoute } from '@tanstack/react-router';
import {
  description,
  emptyDescription,
  emptyState,
  emptyTitle,
  headingGroup,
  page,
  title,
} from './index.css';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

export function DashboardPage() {
  return (
    <main className={page}>
      <div className={headingGroup}>
        <h1 className={title}>대시보드</h1>
        <p className={description}>YAPP+ 운영 현황을 확인합니다.</p>
      </div>

      <section className={emptyState} aria-labelledby="empty-title">
        <h2 id="empty-title" className={emptyTitle}>
          표시할 데이터가 없습니다
        </h2>
        <p className={emptyDescription}>연결된 운영 데이터가 이곳에 표시됩니다.</p>
      </section>
    </main>
  );
}
