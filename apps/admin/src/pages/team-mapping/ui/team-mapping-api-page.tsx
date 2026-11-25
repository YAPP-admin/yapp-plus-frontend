/** 생성 SDK를 직접 사용해 팀 매핑 화면의 조회·저장 흐름을 연결한다. */
import { useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  candidatesOptions,
  findAllOptions,
  findOptions,
  type TeamMemberCandidateResponse,
  type TeamResponse,
} from '@yapp-plus/api/generated';
import { ActionButton, ResultSection } from '@yapp-plus/ui';
import { Portal, SidePanel } from '@seed-design/react';
import { overlay } from 'overlay-kit';
import { X } from 'lucide-react';
import { useAdminGeneration } from '~/features/admin-generation';
import {
  teamMappingSnapshotSchema,
  type TeamMappingMember,
  type TeamMappingPart,
  type TeamMappingSnapshot,
  type TeamMappingTeam,
} from '~/features/team-management';
import { getTeamApiErrorMessage } from '../model/team-api-error';
import type { TeamMappingSearch } from '../model/team-search';
import { TeamDetailPanel } from './team-detail-panel';
import * as detailStyles from './team-detail-panel.css';
import { TeamMappingPage } from './team-mapping-page';
import { TeamMappingDraftContext, useTeamMappingDraft } from './team-mapping-draft-context';

const apiPartToTeamMappingPart: Record<
  Exclude<TeamMemberCandidateResponse['position'], null>,
  Exclude<TeamMappingPart, 'unassigned'>
> = {
  PM: 'pm',
  DESIGN: 'design',
  ANDROID: 'android',
  IOS: 'ios',
  WEB: 'web',
  SERVER: 'server',
  MOBILE: 'mobile',
  AI_NATIVE: 'ai-native',
};

function toTeamMappingPart(position: TeamMemberCandidateResponse['position']): TeamMappingPart {
  if (position === null) {
    return 'unassigned';
  }
  return apiPartToTeamMappingPart[position];
}

function toTeamMappingSnapshot(
  generationNumber: number,
  teams: readonly TeamResponse[],
  candidates: readonly TeamMemberCandidateResponse[],
): TeamMappingSnapshot {
  const memberById = new Map<number, TeamMappingMember>();

  candidates.forEach((candidate) => {
    memberById.set(candidate.membershipId, {
      activityId: String(candidate.membershipId),
      name: candidate.name,
      part: toTeamMappingPart(candidate.position),
      previousGenerations: [],
    });
  });

  teams.forEach((team) => {
    team.members.forEach((member) => {
      if (!memberById.has(member.membershipId)) {
        memberById.set(member.membershipId, {
          activityId: String(member.membershipId),
          name: member.name,
          part: toTeamMappingPart(member.position),
          previousGenerations: [],
        });
      }
    });
  });

  return teamMappingSnapshotSchema.parse({
    generation: generationNumber,
    status: teams.length === 0 ? 'before' : 'draft',
    members: [...memberById.values()],
    teams: teams.map((team) => ({
      id: String(team.teamId),
      name: team.name,
      serviceName: team.serviceName,
      memberActivityIds: team.members.map((member) => String(member.membershipId)),
      leaderActivityId:
        team.members.find((member) => member.position === 'PM')?.membershipId.toString() ?? null,
      version: team.version,
    })),
  });
}

function TeamMappingQueryState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry: () => void;
}) {
  return (
    <main
      style={{
        display: 'grid',
        gap: '2rem',
        maxWidth: '72rem',
        margin: '0 auto',
        padding: '4rem 1.5rem',
      }}
    >
      <section aria-live="polite">
        <ResultSection
          size="medium"
          titleAs="h2"
          title={title}
          description={description}
          primaryActionProps={{
            type: 'button',
            variant: 'neutralSolid',
            onClick: onRetry,
            children: '다시 시도',
          }}
        />
      </section>
    </main>
  );
}

/** 팀 목록과 후보를 조회한 뒤 기존 화면 컴포넌트에 실제 서버 원본을 전달한다. */
export function TeamMappingApiPage({
  search,
  onFilterChange,
}: {
  search: TeamMappingSearch;
  onFilterChange: (filter: TeamMappingSearch['filter']) => void;
}) {
  const { currentGeneration } = useAdminGeneration();
  const generationId = currentGeneration.generationId;
  const draft = useTeamMappingDraft();
  const teamListOptions = useMemo(() => findAllOptions({ path: { generationId } }), [generationId]);
  const candidateOptions = useMemo(
    () => candidatesOptions({ path: { generationId } }),
    [generationId],
  );
  const teamsQuery = useQuery(teamListOptions);
  const candidatesQuery = useQuery(candidateOptions);

  const snapshot = useMemo(() => {
    if (teamsQuery.data === undefined || candidatesQuery.data === undefined) {
      return undefined;
    }
    return toTeamMappingSnapshot(
      currentGeneration.generationNumber,
      teamsQuery.data,
      candidatesQuery.data,
    );
  }, [candidatesQuery.data, currentGeneration.generationNumber, teamsQuery.data]);

  function openDetail(team: TeamMappingTeam) {
    if (snapshot === undefined) {
      return;
    }
    overlay.open(({ unmount }) => (
      <TeamMappingDraftContext.Provider value={draft}>
        <TeamDetailApiPanel
          generationId={generationId}
          teamId={Number(team.id)}
          listTeams={teamsQuery.data ?? []}
          candidates={candidatesQuery.data ?? []}
          onClose={unmount}
        />
      </TeamMappingDraftContext.Provider>
    ));
  }

  if (teamsQuery.isPending || candidatesQuery.isPending) {
    return (
      <TeamMappingQueryState
        title="팀 정보를 불러오는 중이에요"
        description="잠시만 기다려 주세요."
        onRetry={() => {
          void Promise.all([teamsQuery.refetch(), candidatesQuery.refetch()]);
        }}
      />
    );
  }

  if (teamsQuery.error !== null || candidatesQuery.error !== null || snapshot === undefined) {
    const error = teamsQuery.error ?? candidatesQuery.error;
    return (
      <TeamMappingQueryState
        title="팀 정보를 불러오지 못했어요"
        description={getTeamApiErrorMessage(error, 'list')}
        onRetry={() => {
          void Promise.all([teamsQuery.refetch(), candidatesQuery.refetch()]);
        }}
      />
    );
  }

  return (
    <TeamMappingPage
      snapshot={snapshot}
      search={search}
      onFilterChange={onFilterChange}
      onTeamSelect={openDetail}
    />
  );
}

function TeamDetailApiPanel({
  generationId,
  teamId,
  listTeams,
  candidates,
  onClose,
  onEdit,
  onDelete,
}: {
  generationId: number;
  teamId: number;
  listTeams: readonly TeamResponse[];
  candidates: readonly TeamMemberCandidateResponse[];
  onClose: () => void;
  onEdit?: (team: TeamMappingTeam, snapshot: TeamMappingSnapshot) => void;
  onDelete?: (team: TeamMappingTeam) => void;
}) {
  const detailQuery = useQuery(findOptions({ path: { generationId, teamId } }));

  if (detailQuery.isPending) {
    return (
      <TeamDetailPanelShell teamName="팀 상세" onClose={onClose}>
        <output aria-busy="true">최신 팀 정보를 불러오는 중이에요.</output>
      </TeamDetailPanelShell>
    );
  }

  if (detailQuery.error !== null || detailQuery.data === undefined) {
    return (
      <TeamDetailPanelShell teamName="팀 상세" onClose={onClose}>
        <p role="alert">{getTeamApiErrorMessage(detailQuery.error, 'detail')}</p>
        <ActionButton
          type="button"
          variant="neutralSolid"
          onClick={() => void detailQuery.refetch()}
        >
          다시 시도
        </ActionButton>
      </TeamDetailPanelShell>
    );
  }

  const detailTeams = listTeams.map((team) => (team.teamId === teamId ? detailQuery.data : team));
  const snapshot = toTeamMappingSnapshot(0, detailTeams, candidates);
  const team = snapshot.teams.find((candidate) => candidate.id === String(teamId));
  if (team === undefined) {
    return (
      <TeamDetailPanelShell teamName="팀 상세" onClose={onClose}>
        <p role="alert">팀을 찾을 수 없어요. 최신 팀 목록을 확인해 주세요.</p>
      </TeamDetailPanelShell>
    );
  }

  return (
    <TeamDetailPanel
      snapshot={snapshot}
      team={team}
      onClose={onClose}
      readOnly
      onEdit={onEdit === undefined ? undefined : () => onEdit(team, snapshot)}
      onDelete={onDelete === undefined ? undefined : () => onDelete(team)}
    />
  );
}

function TeamDetailPanelShell({
  teamName,
  onClose,
  children,
}: {
  teamName: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <SidePanel.Root direction="right" open onOpenChange={(open) => !open && onClose()}>
      <Portal>
        <SidePanel.Backdrop />
        <SidePanel.Positioner>
          <SidePanel.Content className={detailStyles.panel} data-seed-color-mode="dark-only">
            <SidePanel.Header>
              <SidePanel.Title>{teamName}</SidePanel.Title>
              <SidePanel.CloseButton aria-label="닫기">
                <X size={20} aria-hidden="true" />
              </SidePanel.CloseButton>
            </SidePanel.Header>
            <SidePanel.Body className={detailStyles.body}>{children}</SidePanel.Body>
          </SidePanel.Content>
        </SidePanel.Positioner>
      </Portal>
    </SidePanel.Root>
  );
}
