/** 팀 생성 모달에서 후보 회원을 검색하고 선택·제거한다. */
import { useRef, useState, type KeyboardEvent, type KeyboardEventHandler } from 'react';
import { ActionButton, TextField, TextFieldInput } from '@yapp-plus/ui';
import {
  getCandidateMembers,
  getMemberByActivityId,
  getMemberTeamId,
  getTeamById,
  teamMappingPartLabels,
  type TeamMappingSnapshot,
} from '~/features/team-management';
import * as styles from './team-member-search.css';

type TeamMemberSearchProps = {
  snapshot: TeamMappingSnapshot;
  selectedActivityIds: readonly string[];
  onSelect: (activityId: string) => void;
  onRemove: (activityId: string) => void;
};

function getMemberAffiliation(snapshot: TeamMappingSnapshot, activityId: string): string {
  const teamId = getMemberTeamId(snapshot, activityId);
  if (teamId === undefined) {
    return '미배정';
  }

  const team = getTeamById(snapshot, teamId);
  return team === undefined ? '현재 소속 확인 필요' : `${team.name} 소속 · 이동 예정`;
}

function getLastMemberBlockReason(snapshot: TeamMappingSnapshot, activityId: string) {
  const teamId = getMemberTeamId(snapshot, activityId);
  if (teamId === undefined) {
    return undefined;
  }

  const team = getTeamById(snapshot, teamId);
  return team?.memberActivityIds.length === 1
    ? `${team.name}은 최소 1명의 팀원을 유지해야 합니다.`
    : undefined;
}

/** 검색 결과를 조작할 때 한글 조합 중 Enter 오선택을 막는다. */
function isComposingEvent(event: KeyboardEvent<HTMLInputElement>): boolean {
  return event.nativeEvent.isComposing || event.keyCode === 229;
}

export function TeamMemberSearch({
  snapshot,
  selectedActivityIds,
  onSelect,
  onRemove,
}: TeamMemberSearchProps) {
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedIds = new Set(selectedActivityIds);
  const candidates = getCandidateMembers(snapshot, query, selectedIds);

  function updateQuery(value: string) {
    setQuery(value);
    setHighlightedIndex(0);
  }

  function selectCandidate(activityId: string) {
    if (getLastMemberBlockReason(snapshot, activityId) !== undefined) {
      return;
    }

    onSelect(activityId);
    updateQuery('');
    inputRef.current?.focus();
  }

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (isComposing || isComposingEvent(event)) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((current) => Math.min(current + 1, Math.max(candidates.length - 1, 0)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const candidate = candidates[highlightedIndex];
      if (candidate !== undefined) {
        selectCandidate(candidate.activityId);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      updateQuery('');
    }
  };

  return (
    <div className={styles.root}>
      <TextField label="회원 검색" value={query} onValueChange={({ value }) => updateQuery(value)}>
        <TextFieldInput
          ref={inputRef}
          type="search"
          name="team-member-search"
          autoComplete="off"
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={handleKeyDown}
        />
      </TextField>

      {candidates.length > 0 ? (
        <ul id="team-member-search-results" className={styles.resultList}>
          {candidates.map((member, index) => {
            const blockReason = getLastMemberBlockReason(snapshot, member.activityId);
            return (
              <li key={member.activityId}>
                <button
                  id={`team-member-option-${member.activityId}`}
                  type="button"
                  data-highlighted={index === highlightedIndex ? '' : undefined}
                  disabled={blockReason !== undefined}
                  title={blockReason}
                  className={styles.resultButton}
                  onClick={() => selectCandidate(member.activityId)}
                >
                  <span className={styles.resultName}>{member.name}</span>
                  <span className={styles.resultMeta}>
                    {teamMappingPartLabels[member.part]} ·{' '}
                    {getMemberAffiliation(snapshot, member.activityId)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.emptyMessage}>검색 결과가 없습니다.</p>
      )}

      {selectedActivityIds.length > 0 && (
        <ul className={styles.selectedList} aria-label="선택 회원 목록">
          {selectedActivityIds.map((activityId) => {
            const member = getMemberByActivityId(snapshot, activityId);
            if (member === undefined) {
              return null;
            }

            return (
              <li key={activityId} className={styles.selectedItem}>
                <div className={styles.selectedInfo}>
                  <span className={styles.resultName}>{member.name}</span>
                  <span className={styles.resultMeta}>
                    {teamMappingPartLabels[member.part]} ·{' '}
                    {getMemberAffiliation(snapshot, activityId)}
                  </span>
                </div>
                <ActionButton
                  type="button"
                  variant="neutralWeak"
                  aria-label={`${member.name} 선택 취소`}
                  onClick={() => onRemove(activityId)}
                >
                  제거
                </ActionButton>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
