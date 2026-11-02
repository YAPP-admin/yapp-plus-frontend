/** 팀 상세 패널에서 회원을 검색하고 추가 예정으로 선택하는 UI를 제공한다. */
import { TextField, TextFieldInput } from '@yapp-plus/ui';
import {
  getMemberTeamId,
  teamMappingPartLabels,
  type TeamMappingMember,
  type TeamMappingSnapshot,
} from '~/features/team-management';
import * as styles from './team-detail-panel.css';

type TeamMemberSearchPanelProps = {
  snapshot: TeamMappingSnapshot;
  query: string;
  candidates: readonly TeamMappingMember[];
  onQueryChange: (query: string) => void;
  onSelectMember: (activityId: string) => void;
};

/** 검색 결과를 원본 소속 정보와 함께 표시하고 선택 이벤트를 전달한다. */
export function TeamMemberSearchPanel({
  snapshot,
  query,
  candidates,
  onQueryChange,
  onSelectMember,
}: TeamMemberSearchPanelProps) {
  return (
    <div className={styles.addArea}>
      <TextField
        label="회원 검색"
        value={query}
        onValueChange={({ value }) => onQueryChange(value)}
      >
        <TextFieldInput type="search" name="team-detail-member-search" autoComplete="off" />
      </TextField>
      {candidates.length > 0 ? (
        <ul className={styles.candidateList} aria-label="추가 후보 회원">
          {candidates.map((member) => (
            <li key={member.activityId}>
              <button
                type="button"
                className={styles.candidateButton}
                onClick={() => onSelectMember(member.activityId)}
              >
                <span className={styles.memberName}>{member.name}</span>
                <span className={styles.memberMeta}>
                  {teamMappingPartLabels[member.part]} ·{' '}
                  {getMemberTeamId(snapshot, member.activityId) === undefined
                    ? '미배정'
                    : '다른 팀 소속'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyMessage}>검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
