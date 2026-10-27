import { Outlet, createFileRoute } from '@tanstack/react-router';
import { AdminOverlayProvider } from '~/app/ui/admin-overlay-provider';
import { AdminShell } from '~/app/ui/admin-shell';

export const Route = createFileRoute('/_dashboard')({ component: DashboardLayout });

function DashboardLayout() {
  return (
    <AdminShell>
      <AdminOverlayProvider>
        <Outlet />
      </AdminOverlayProvider>
    </AdminShell>
  );
}
