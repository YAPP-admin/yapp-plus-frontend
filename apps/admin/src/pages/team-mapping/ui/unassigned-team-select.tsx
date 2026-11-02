/** 미배정 회원 배정 대상 Select와 공통 옵션을 표시한다. */
import { Select } from '@seed-design/react';
import { Check, ChevronDown } from 'lucide-react';
import { getTeamById, type TeamMappingSnapshot } from '~/features/team-management';
import * as styles from './unassigned-members.css';

export const NO_ASSIGNMENT = '__no_assignment__';

function getAssignmentLabel(snapshot: TeamMappingSnapshot, destinationTeamId: string | undefined) {
  if (destinationTeamId === undefined) {
    return '배정 팀 선택';
  }
  return getTeamById(snapshot, destinationTeamId)?.name ?? '대상 팀 확인 필요';
}

/** 개별·일괄 배정에서 같은 팀 선택 메뉴를 재사용한다. */
export function UnassignedTeamSelect({
  snapshot,
  destinationTeamId,
  label,
  ariaLabel,
  disabled = false,
  bulk = false,
  onChange,
}: {
  snapshot: TeamMappingSnapshot;
  destinationTeamId?: string;
  label?: string;
  ariaLabel: string;
  disabled?: boolean;
  bulk?: boolean;
  onChange: (destinationTeamId: string | null) => void;
}) {
  const value = destinationTeamId ?? NO_ASSIGNMENT;

  return (
    <Select.Root
      value={[value]}
      disabled={disabled}
      onValueChange={(values) => {
        const nextValue = values[0];
        if (nextValue !== undefined) {
          onChange(nextValue === NO_ASSIGNMENT ? null : nextValue);
        }
      }}
    >
      <Select.Trigger
        className={bulk ? styles.bulkSelect : styles.memberSelect}
        aria-label={ariaLabel}
      >
        <Select.Value>{label ?? getAssignmentLabel(snapshot, destinationTeamId)}</Select.Value>
        <Select.SuffixIcon svg={<ChevronDown aria-hidden="true" size={18} />} />
      </Select.Trigger>
      <Select.Positioner>
        <Select.Content data-seed-color-mode="dark-only">
          <Select.ScrollArea>
            <Select.Group>
              <Select.Item value={NO_ASSIGNMENT} label="배정 예정 취소">
                <Select.ItemBody>
                  <Select.ItemLabel />
                </Select.ItemBody>
                <Select.ItemIndicator selected={<Check aria-hidden="true" size={16} />} />
              </Select.Item>
              {snapshot.teams.map((team) => (
                <Select.Item key={team.id} value={team.id} label={`${team.name}으로 배정`}>
                  <Select.ItemBody>
                    <Select.ItemLabel />
                  </Select.ItemBody>
                  <Select.ItemIndicator selected={<Check aria-hidden="true" size={16} />} />
                </Select.Item>
              ))}
            </Select.Group>
          </Select.ScrollArea>
        </Select.Content>
      </Select.Positioner>
      <Select.HiddenSelect />
    </Select.Root>
  );
}
