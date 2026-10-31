import { createFileRoute } from '@tanstack/react-router';
import { memberPreviewAfterMapping } from '~/features/member-management/fixtures';
import { MemberImportPage } from '~/pages/member-import';

export const Route = createFileRoute('/_dashboard/members/import')({
  staticData: { navigation: { menu: 'members', pageLabel: '명단 업로드' } },
  head: () => ({ meta: [{ title: '명단 업로드 | YAPP+ Admin' }] }),
  component: MemberImportRoute,
});

function MemberImportRoute() {
  return (
    <MemberImportPage
      members={import.meta.env.DEV ? memberPreviewAfterMapping.members : undefined}
      currentGeneration={
        import.meta.env.DEV ? memberPreviewAfterMapping.currentGeneration : undefined
      }
    />
  );
}
