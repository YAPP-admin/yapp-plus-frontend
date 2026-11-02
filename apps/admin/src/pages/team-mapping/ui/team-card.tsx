/** 원본 팀 정보와 직군 구성 경고를 상세 진입점과 분리해 표시한다. */
import { ActionButton, Badge } from '@yapp-plus/ui';
import { Ellipsis } from 'lucide-react';
import {
  getMemberByActivityId,
  getTeamFilter,
  getTeamPartCounts,
  teamMappingPartLabels,
  teamMappingPartSchema,
  type TeamMappingSnapshot,
  type TeamMappingTeam,
} from '~/features/team-management';
import * as styles from './team-card.css';

/** 팀명·서비스·구성 상태와 원본 팀원을 카드로 표시한다. */
export function TeamCard({
  snapshot,
  team,
  onOpen,
}: {
  snapshot: TeamMappingSnapshot;
  team: TeamMappingTeam;
  onOpen?: (team: TeamMappingTeam) => void;
}) {
  const counts = getTeamPartCounts(snapshot, team);
  const filter = getTeamFilter(snapshot, team);
  const members = team.memberActivityIds
    .map((activityId) => getMemberByActivityId(snapshot, activityId))
    .filter((member) => member !== undefined);
  const missingParts = teamMappingPartSchema.options
    .filter((part) => (part === 'pm' || part === 'design') && counts[part] === 0)
    .map((part) => teamMappingPartLabels[part]);
  const isComplete = filter === 'complete';

  return (
    <article className={styles.card} aria-label={`${team.name} 팀`}>
      <div className={styles.identity}>
        <span className={styles.eyebrow}>TEAM</span>
        <div className={styles.teamNameRow}>
          <h2 className={styles.title}>
            {onOpen ? (
              <button type="button" className={styles.titleButton} onClick={() => onOpen(team)}>
                {team.name}
              </button>
            ) : (
              team.name
            )}
          </h2>
          <span className={styles.memberCount}>{team.memberActivityIds.length}명</span>
        </div>
        <p className={styles.serviceName}>{team.serviceName ?? '서비스명 없음'}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.parts} aria-label={`${team.name} 직군 구성`}>
          {teamMappingPartSchema.options
            .filter((part) => counts[part] > 0)
            .map((part) => (
              <Badge key={part} variant="weak" tone="neutral">
                {teamMappingPartLabels[part]} {counts[part]}
              </Badge>
            ))}
        </div>

        <ul className={styles.members} aria-label={`${team.name} 팀원`}>
          {members.map((member, index) => (
            <li key={member.activityId} className={styles.member}>
              {index > 0 && (
                <span className={styles.memberSeparator} aria-hidden="true">
                  ·
                </span>
              )}
              <span>{member.name}</span>
              <span className={styles.memberPart}>{teamMappingPartLabels[member.part]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.statusRow}>
        <Badge variant="weak" tone={isComplete ? 'positive' : 'critical'}>
          {isComplete ? '구성 완료' : '확인 필요'}
        </Badge>
        {!isComplete && (
          <span className={styles.warning}>{missingParts.join(', ')} 직군이 없어요.</span>
        )}
      </div>

      <ActionButton
        type="button"
        variant="neutralWeak"
        size="small"
        className={styles.menuButton}
        aria-label={`${team.name} 더보기`}
        disabled
      >
        <Ellipsis size={18} aria-hidden="true" />
      </ActionButton>
    </article>
  );
}
