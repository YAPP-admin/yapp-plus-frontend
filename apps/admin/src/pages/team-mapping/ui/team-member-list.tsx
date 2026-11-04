/** 팀 상세 패널의 원본 팀원과 배정 변경 Select를 제공한다. */
import type { RefObject } from 'react';
import { Select } from '@seed-design/react';
import { Check, ChevronDown } from 'lucide-react';
import {
  getMemberByActivityId,
  teamMappingPartLabels,
  type TeamMappingSnapshot,
  type TeamMappingTeam,
} from '~/features/team-management';
import * as styles from './team-detail-panel.css';
import { teamMemberChangeSelectValues } from './use-team-member-changes';

type TeamMemberListProps = {
  snapshot: TeamMappingSnapshot;
  team: TeamMappingTeam;
  panelElement: HTMLDivElement | null;
  panelRef: RefObject<HTMLDivElement | null>;
  readOnly?: boolean;
  getSelection: (activityId: string) => { value: string; label: string };
  onSelectDestination: (activityId: string, value: string) => void;
};

function getTeamMemberLabel(snapshot: TeamMappingSnapshot, activityId: string): string {
  const member = getMemberByActivityId(snapshot, activityId);
  return member === undefined
    ? '회원 확인 필요'
    : `${member.name} · ${teamMappingPartLabels[member.part]}`;
}

/** 팀원별 현재 소속과 이동·제외 대상을 표시한다. */
export function TeamMemberList({
  snapshot,
  team,
  panelElement,
  panelRef,
  readOnly = false,
  getSelection,
  onSelectDestination,
}: TeamMemberListProps) {
  return (
    <ul className={styles.memberList}>
      {team.memberActivityIds.map((activityId) => {
        const selection = getSelection(activityId);
        const member = getMemberByActivityId(snapshot, activityId);
        return (
          <li key={activityId} className={styles.memberItem}>
            <div className={styles.memberInfo}>
              <span className={styles.memberName}>{getTeamMemberLabel(snapshot, activityId)}</span>
              <span className={styles.memberMeta}>현재 팀 소속</span>
            </div>
            <Select.Root
              disabled={readOnly}
              value={[selection.value]}
              onValueChange={(values) => {
                onSelectDestination(activityId, values[0] ?? selection.value);
              }}
            >
              <Select.Trigger
                className={styles.memberAction}
                aria-label={`${member?.name ?? '회원'} 변경`}
              >
                <Select.Value>{selection.label}</Select.Value>
                <Select.SuffixIcon svg={<ChevronDown aria-hidden="true" size={18} />} />
              </Select.Trigger>
              {panelElement !== null && (
                <Select.Positioner container={panelRef}>
                  <Select.Content data-seed-color-mode="dark-only">
                    <Select.ScrollArea>
                      <Select.Group>
                        <Select.Item value={teamMemberChangeSelectValues.none} label="변경 없음">
                          <Select.ItemBody>
                            <Select.ItemLabel />
                          </Select.ItemBody>
                          <Select.ItemIndicator selected={<Check aria-hidden="true" size={16} />} />
                        </Select.Item>
                        {snapshot.teams
                          .filter((candidateTeam) => candidateTeam.id !== team.id)
                          .map((candidateTeam) => (
                            <Select.Item
                              key={candidateTeam.id}
                              value={candidateTeam.id}
                              label={`${candidateTeam.name}으로 이동`}
                            >
                              <Select.ItemBody>
                                <Select.ItemLabel />
                              </Select.ItemBody>
                              <Select.ItemIndicator
                                selected={<Check aria-hidden="true" size={16} />}
                              />
                            </Select.Item>
                          ))}
                        <Select.Item
                          value={teamMemberChangeSelectValues.exclude}
                          label="팀에서 제외"
                        >
                          <Select.ItemBody>
                            <Select.ItemLabel />
                          </Select.ItemBody>
                          <Select.ItemIndicator selected={<Check aria-hidden="true" size={16} />} />
                        </Select.Item>
                      </Select.Group>
                    </Select.ScrollArea>
                  </Select.Content>
                </Select.Positioner>
              )}
              <Select.HiddenSelect />
            </Select.Root>
          </li>
        );
      })}
    </ul>
  );
}
