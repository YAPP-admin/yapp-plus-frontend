import { Outlet, createFileRoute } from '@tanstack/react-router';
import { AdminShell } from '~/app/ui/admin-shell';

export const Route = createFileRoute('/_dashboard')({ component: DashboardLayout });

function DashboardLayout() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
