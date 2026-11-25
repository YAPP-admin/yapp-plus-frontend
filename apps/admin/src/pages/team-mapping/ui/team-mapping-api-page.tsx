/** 생성 SDK를 직접 사용해 팀 매핑 화면의 조회·저장 흐름을 연결한다. */
import { useMemo, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  candidatesOptions,
  create1Mutation,
  deleteMutation,
  findAllOptions,
  findOptions,
  replaceMembersMutation,
  updateMutation,
  type TeamMemberCandidateResponse,
  type TeamResponse,
} from '@yapp-plus/api/generated';
import { ActionButton, ResultSection, Snackbar, useSnackbarAdapter } from '@yapp-plus/ui';
import { Portal, SidePanel } from '@seed-design/react';
import { overlay } from 'overlay-kit';
import { X } from 'lucide-react';
import { useAdminGeneration } from '~/features/admin-generation';
import {
  getMemberTeamId,
  teamMappingSnapshotSchema,
  type TeamDraftValues,
  type TeamMemberChange,
  type TeamMappingMember,
  type TeamMappingPart,
  type TeamMappingSnapshot,
  type TeamMappingTeam,
} from '~/features/team-management';
import { memberTeamOptionsQueryOptions } from '~/pages/members/model/member-api-queries';
import { getTeamApiErrorMessage } from '../model/team-api-error';
import type { TeamMappingSearch } from '../model/team-search';
import { TeamCreateDialog } from './team-create-dialog';
import { TeamDeleteDialog } from './team-delete-dialog';
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

function toMemberRequests(snapshot: TeamMappingSnapshot, memberActivityIds: readonly string[]) {
  return memberActivityIds.map((activityId) => {
    const membershipId = Number(activityId);
    if (!Number.isSafeInteger(membershipId) || membershipId <= 0) {
      throw new Error('회원 식별자를 확인할 수 없어요. 최신 회원 목록을 다시 불러와 주세요.');
    }

    const currentTeamId = getMemberTeamId(snapshot, activityId);
    return {
      membershipId,
      expectedCurrentTeamId: currentTeamId === undefined ? null : Number(currentTeamId),
    };
  });
}

function getTeamVersion(team: TeamMappingTeam): number {
  if (team.version === undefined) {
    throw new Error('팀 버전을 확인할 수 없어요. 최신 팀 목록을 다시 불러와 주세요.');
  }
  return team.version;
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
  const queryClient = useQueryClient();
  const snackbar = useSnackbarAdapter();
  const draft = useTeamMappingDraft();
  const teamListOptions = useMemo(() => findAllOptions({ path: { generationId } }), [generationId]);
  const candidateOptions = useMemo(
    () => candidatesOptions({ path: { generationId } }),
    [generationId],
  );
  const teamsQuery = useQuery(teamListOptions);
  const candidatesQuery = useQuery(candidateOptions);
  const create = useMutation(create1Mutation());
  const update = useMutation(updateMutation());
  const replaceMembers = useMutation(replaceMembersMutation());
  const remove = useMutation(deleteMutation());

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

  async function invalidateTeamQueries(teamId?: number) {
    const queries = [
      queryClient.invalidateQueries({ queryKey: teamListOptions.queryKey }),
      queryClient.invalidateQueries({ queryKey: candidateOptions.queryKey }),
      queryClient.invalidateQueries({
        queryKey: memberTeamOptionsQueryOptions(generationId).queryKey,
      }),
    ];
    if (teamId !== undefined) {
      queries.push(
        queryClient.invalidateQueries({
          queryKey: findOptions({ path: { generationId, teamId } }).queryKey,
        }),
      );
    }
    await Promise.all(queries);
  }

  async function createTeam(values: TeamDraftValues) {
    if (snapshot === undefined) {
      throw new Error('최신 팀 데이터를 불러오는 중이에요. 잠시 후 다시 시도해 주세요.');
    }
    try {
      await create.mutateAsync({
        path: { generationId },
        body: {
          name: values.name.trim(),
          serviceName: values.serviceName.trim() || null,
          members: toMemberRequests(snapshot, values.memberActivityIds),
        },
      });
      await invalidateTeamQueries();
      snackbar.create({
        render: () => <Snackbar variant="positive" message="팀을 만들었어요." />,
      });
    } catch (error) {
      throw new Error(getTeamApiErrorMessage(error, 'save'), { cause: error });
    }
  }

  async function updateTeam(
    team: TeamMappingTeam,
    values: TeamDraftValues,
    destinationTeamIds: Readonly<Record<string, string>> = {},
    snapshotOverride?: TeamMappingSnapshot,
  ) {
    const sourceSnapshot = snapshotOverride ?? snapshot;
    if (sourceSnapshot === undefined) {
      throw new Error('최신 팀 데이터를 불러오는 중이에요. 잠시 후 다시 시도해 주세요.');
    }

    let hasAppliedDestinationMove = false;
    try {
      let expectedVersion = getTeamVersion(team);
      const teamInfoChanged =
        team.name !== values.name.trim() || (team.serviceName ?? '') !== values.serviceName.trim();
      if (teamInfoChanged) {
        const updated = await update.mutateAsync({
          path: { generationId, teamId: Number(team.id) },
          body: {
            expectedVersion,
            name: values.name.trim(),
            serviceName: values.serviceName.trim() || null,
          },
        });
        expectedVersion = updated.version;
      }

      const destinationEntries = Object.entries(destinationTeamIds);
      const destinationMemberIds = new Map<string, string[]>();
      destinationEntries.forEach(([activityId, destinationTeamId]) => {
        const memberIds = destinationMemberIds.get(destinationTeamId) ?? [];
        memberIds.push(activityId);
        destinationMemberIds.set(destinationTeamId, memberIds);
      });

      for (const [destinationTeamId, movedActivityIds] of destinationMemberIds) {
        const destinationTeam = sourceSnapshot.teams.find(
          (candidate) => candidate.id === destinationTeamId,
        );
        if (destinationTeam === undefined) {
          throw new Error('이동할 팀 정보를 찾을 수 없어요. 최신 팀 목록을 다시 불러와 주세요.');
        }

        const destinationMemberActivityIds = [
          ...new Set([...destinationTeam.memberActivityIds, ...movedActivityIds]),
        ];
        await replaceMembers.mutateAsync({
          path: { generationId, teamId: Number(destinationTeamId) },
          body: {
            expectedVersion: getTeamVersion(destinationTeam),
            members: toMemberRequests(sourceSnapshot, destinationMemberActivityIds),
          },
        });
        hasAppliedDestinationMove = true;
      }

      const currentIds = new Set(team.memberActivityIds);
      const nextIds = new Set(values.memberActivityIds);
      const membersChanged =
        currentIds.size !== nextIds.size || [...currentIds].some((id) => !nextIds.has(id));
      if (membersChanged) {
        if (hasAppliedDestinationMove) {
          const latestSourceTeam = await queryClient.fetchQuery(
            findOptions({ path: { generationId, teamId: Number(team.id) } }),
          );
          expectedVersion = latestSourceTeam.version;
        }
        await replaceMembers.mutateAsync({
          path: { generationId, teamId: Number(team.id) },
          body: {
            expectedVersion,
            members: toMemberRequests(sourceSnapshot, values.memberActivityIds),
          },
        });
      }

      await invalidateTeamQueries(Number(team.id));
      snackbar.create({
        render: () => <Snackbar variant="positive" message="팀 정보를 수정했어요." />,
      });
    } catch (error) {
      await invalidateTeamQueries(Number(team.id));
      if (hasAppliedDestinationMove) {
        throw new Error(
          '팀원 이동 중 일부 변경이 반영됐어요. 최신 팀 정보를 확인한 뒤 다시 시도해 주세요.',
          { cause: error },
        );
      }
      throw new Error(getTeamApiErrorMessage(error, 'save'), { cause: error });
    }
  }

  async function deleteTeam(team: TeamMappingTeam) {
    try {
      await remove.mutateAsync({ path: { generationId, teamId: Number(team.id) } });
      await invalidateTeamQueries(Number(team.id));
      snackbar.create({
        render: () => <Snackbar variant="positive" message="팀을 삭제했어요." />,
      });
    } catch (error) {
      await invalidateTeamQueries(Number(team.id));
      throw new Error(getTeamApiErrorMessage(error, 'delete'), { cause: error });
    }
  }

  async function assignUnassigned(changes: readonly TeamMemberChange[]) {
    if (snapshot === undefined) {
      throw new Error('최신 팀 데이터를 불러오는 중이에요. 잠시 후 다시 시도해 주세요.');
    }

    let hasAppliedAssignment = false;
    try {
      const assignmentsByTeam = new Map<string, string[]>();
      changes.forEach((change) => {
        if (change.destinationTeamId === null) {
          return;
        }
        const activityIds = assignmentsByTeam.get(change.destinationTeamId) ?? [];
        activityIds.push(change.activityId);
        assignmentsByTeam.set(change.destinationTeamId, activityIds);
      });

      for (const [destinationTeamId, assignedActivityIds] of assignmentsByTeam) {
        const destinationTeam = snapshot.teams.find(
          (candidate) => candidate.id === destinationTeamId,
        );
        if (destinationTeam === undefined) {
          throw new Error('배정할 팀 정보를 찾을 수 없어요. 최신 팀 목록을 다시 불러와 주세요.');
        }

        const nextMemberActivityIds = [
          ...new Set([...destinationTeam.memberActivityIds, ...assignedActivityIds]),
        ];
        await replaceMembers.mutateAsync({
          path: { generationId, teamId: Number(destinationTeamId) },
          body: {
            expectedVersion: getTeamVersion(destinationTeam),
            members: toMemberRequests(snapshot, nextMemberActivityIds),
          },
        });
        hasAppliedAssignment = true;
      }

      await invalidateTeamQueries();
      snackbar.create({
        render: () => <Snackbar variant="positive" message="회원 배정을 반영했어요." />,
      });
    } catch (error) {
      await invalidateTeamQueries();
      if (hasAppliedAssignment) {
        throw new Error(
          '회원 배정 중 일부 변경이 반영됐어요. 최신 팀 정보를 확인한 뒤 다시 시도해 주세요.',
          { cause: error },
        );
      }
      throw new Error(getTeamApiErrorMessage(error, 'save'), { cause: error });
    }
  }

  function openEditDialog(team: TeamMappingTeam, sourceSnapshot = snapshot) {
    if (sourceSnapshot === undefined) {
      return;
    }
    overlay.open(({ unmount }) => (
      <TeamMappingDraftContext.Provider value={draft}>
        <TeamCreateDialog
          snapshot={sourceSnapshot}
          team={team}
          onClose={unmount}
          onUpdateAsync={(editingTeam, values, destinationTeamIds) =>
            updateTeam(editingTeam, values, destinationTeamIds, sourceSnapshot)
          }
        />
      </TeamMappingDraftContext.Provider>
    ));
  }

  function openDeleteDialog(team: TeamMappingTeam) {
    overlay.open(({ unmount }) => (
      <TeamDeleteDialog team={team} onClose={unmount} onDelete={() => deleteTeam(team)} />
    ));
  }

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
          onEdit={(detailTeam, detailSnapshot) => {
            unmount();
            openEditDialog(detailTeam, detailSnapshot);
          }}
          onDelete={(detailTeam) => {
            unmount();
            openDeleteDialog(detailTeam);
          }}
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
      createTeam={createTeam}
      updateTeam={updateTeam}
      onDeleteTeam={openDeleteDialog}
      assignUnassigned={assignUnassigned}
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
  onEdit: (team: TeamMappingTeam, snapshot: TeamMappingSnapshot) => void;
  onDelete: (team: TeamMappingTeam) => void;
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
      onEdit={() => onEdit(team, snapshot)}
      onDelete={() => onDelete(team)}
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
