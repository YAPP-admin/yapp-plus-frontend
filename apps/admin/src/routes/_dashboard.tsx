import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import { brand, header, navigation, navigationLink, shell } from './_dashboard.css';

export const Route = createFileRoute('/_dashboard')({ component: DashboardLayout });

function DashboardLayout() {
  return (
    <div className={shell}>
      <header className={header}>
        <Link className={brand} to="/">
          YAPP+ Admin
        </Link>
        <nav className={navigation} aria-label="주요 메뉴">
          <Link className={navigationLink} to="/">
            대시보드
          </Link>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
