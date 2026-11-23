import { Outlet, createFileRoute } from '@tanstack/react-router';
import { AdminGenerationBoundary } from '~/app/ui/admin-generation-boundary';
import { SessionGenerationOverlayProvider } from '~/app/ui/admin-overlay-provider';
import { AdminShell } from '~/app/ui/admin-shell';
import { useAdminGeneration } from '~/features/admin-generation';

export const Route = createFileRoute('/_dashboard')({ component: DashboardLayout });

function DashboardLayout() {
  return (
    <AdminGenerationBoundary>
      <DashboardWorkspace />
    </AdminGenerationBoundary>
  );
}

function DashboardWorkspace() {
  const { currentGeneration } = useAdminGeneration();

  return (
    <AdminShell>
      <SessionGenerationOverlayProvider generationId={currentGeneration.generationId}>
        <Outlet />
      </SessionGenerationOverlayProvider>
    </AdminShell>
  );
}
