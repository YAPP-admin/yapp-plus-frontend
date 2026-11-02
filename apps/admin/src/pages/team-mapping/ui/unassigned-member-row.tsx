/** 미배정 회원 한 명의 정보·체크·배정 예정 조작을 표시한다. */
import { Checkbox } from '@seed-design/react';
import { ActionButton, Badge } from '@yapp-plus/ui';
import { Check } from 'lucide-react';
import {
  teamMappingPartLabels,
  type TeamMappingMember,
  type TeamMappingSnapshot,
  type TeamMemberChange,
} from '~/features/team-management';
import { UnassignedTeamSelect } from './unassigned-team-select';
import * as styles from './unassigned-members.css';

function getHistoryLabel(member: TeamMappingMember): string {
  return member.previousGenerations.length === 0
    ? '과거 기수 이력 없음'
    : `과거 ${member.previousGenerations.map((generation) => `${generation}기`).join(' · ')}`;
}

/** 회원 행은 표시와 이벤트 전달만 담당한다. */
export function UnassignedMemberRow({
  snapshot,
  member,
  change,
  checked,
  disabled,
  onCheckedChange,
  onDestinationChange,
  onCancel,
}: {
  snapshot: TeamMappingSnapshot;
  member: TeamMappingMember;
  change: TeamMemberChange | undefined;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
  onDestinationChange: (destinationTeamId: string | null) => void;
  onCancel: () => void;
}) {
  return (
    <li className={styles.item}>
      <Checkbox.Root
        className={styles.checkbox}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      >
        <Checkbox.HiddenInput aria-label={`${member.name} 선택`} />
        <Checkbox.Control>
          <Checkbox.Indicator checked={<Check aria-hidden="true" size={16} />} />
        </Checkbox.Control>
      </Checkbox.Root>
      <div className={styles.info}>
        <span className={styles.name}>{member.name}</span>
        <span className={styles.meta}>
          {teamMappingPartLabels[member.part]} ·{' '}
          <span className={styles.history}>{getHistoryLabel(member)}</span>
        </span>
      </div>
      <div className={styles.assignment}>
        {change !== undefined && (
          <Badge variant="weak" tone="brand">
            배정 예정
          </Badge>
        )}
        <UnassignedTeamSelect
          snapshot={snapshot}
          destinationTeamId={change?.destinationTeamId ?? undefined}
          ariaLabel={`${member.name} 대상 팀`}
          disabled={disabled}
          onChange={onDestinationChange}
        />
        {change !== undefined && (
          <ActionButton
            type="button"
            variant="neutralWeak"
            size="small"
            aria-label={`${member.name} 배정 예정 취소`}
            disabled={disabled}
            onClick={onCancel}
          >
            취소
          </ActionButton>
        )}
      </div>
    </li>
  );
}
