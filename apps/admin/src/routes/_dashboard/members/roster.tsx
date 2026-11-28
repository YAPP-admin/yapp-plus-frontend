/** 관리자 공통 기수 선택을 업로드 명단 페이지에 전달합니다. */
import { createFileRoute } from '@tanstack/react-router';
import { useAdminGeneration } from '~/features/admin-generation';
import { MemberRosterPage } from '~/pages/member-roster';

export const Route = createFileRoute('/_dashboard/members/roster')({
  staticData: { navigation: { menu: 'members', pageLabel: '업로드 명단' } },
  head: () => ({ meta: [{ title: '업로드 명단 | YAPP+ Admin' }] }),
  component: MemberRosterRoute,
});

function MemberRosterRoute() {
  const { currentGeneration } = useAdminGeneration();
  return (
    <MemberRosterPage
      generationId={currentGeneration.generationId}
      generationNumber={currentGeneration.generationNumber}
    />
  );
}
