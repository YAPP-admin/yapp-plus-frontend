/** 팀 생성 모달에서 후보 회원을 검색하고 선택·제거한다. */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type KeyboardEventHandler,
} from 'react';
import { Menu, Portal } from '@seed-design/react';
import { ActionButton, Badge, TextField, TextFieldInput } from '@yapp-plus/ui';
import { Ellipsis, Plus } from 'lucide-react';
import {
  getCandidateMembers,
  getMemberByActivityId,
  getMemberTeamId,
  getTeamById,
  teamMappingPartLabels,
  type TeamMappingSnapshot,
  type TeamMappingTeam,
} from '~/features/team-management';
import * as styles from './team-member-search.css';

type TeamMemberSearchProps = {
  snapshot: TeamMappingSnapshot;
  selectedActivityIds: readonly string[];
  onSelect: (activityId: string) => void;
  onRemove: (activityId: string) => void;
  editingTeam?: TeamMappingTeam;
  onMoveMember?: (activityId: string, destinationTeamId: string) => void;
};

const SEARCH_DEBOUNCE_MS = 300;

function getMemberAffiliation(snapshot: TeamMappingSnapshot, activityId: string): string {
  const teamId = getMemberTeamId(snapshot, activityId);
  if (teamId === undefined) {
    return '미배정';
  }

  const team = getTeamById(snapshot, teamId);
  return team === undefined ? '현재 소속 확인 필요' : `${team.name} 소속`;
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
  editingTeam,
  onMoveMember,
}: TeamMemberSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [resultPosition, setResultPosition] = useState<Readonly<{
    top: number;
    left: number;
    width: number;
  }> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchFieldRef = useRef<HTMLDivElement>(null);
  const resultListRef = useRef<HTMLUListElement>(null);
  const selectedIds = new Set(selectedActivityIds);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const updateResultPosition = useCallback(() => {
    const searchField = searchFieldRef.current;
    if (searchField === null) {
      return;
    }

    const rect = searchField.getBoundingClientRect();
    setResultPosition({ top: rect.bottom + 8, left: rect.left, width: rect.width });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateResultPosition();
      window.addEventListener('resize', updateResultPosition);
      window.addEventListener('scroll', updateResultPosition, true);
      return () => {
        window.removeEventListener('resize', updateResultPosition);
        window.removeEventListener('scroll', updateResultPosition, true);
      };
    }
    return undefined;
  }, [isOpen, updateResultPosition]);

  const candidates = getCandidateMembers(snapshot, debouncedQuery, selectedIds);

  function updateQuery(value: string) {
    setQuery(value);
    setHighlightedIndex(0);
    if (value === '') {
      setDebouncedQuery('');
    }
  }

  function selectCandidate(activityId: string) {
    if (getLastMemberBlockReason(snapshot, activityId) !== undefined) {
      return;
    }

    onSelect(activityId);
    updateQuery('');
    inputRef.current?.focus();
    window.requestAnimationFrame(updateResultPosition);
  }

  function removeCandidate(activityId: string) {
    onRemove(activityId);
    window.requestAnimationFrame(updateResultPosition);
  }

  function handleSearchBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;
    if (
      nextTarget instanceof Node &&
      (event.currentTarget.contains(nextTarget) || resultListRef.current?.contains(nextTarget))
    ) {
      return;
    }
    setIsOpen(false);
    setResultPosition(null);
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
      <div
        ref={searchFieldRef}
        className={styles.searchField}
        onBlur={handleSearchBlur}
        onFocus={() => {
          setResultPosition(null);
          setIsOpen(true);
        }}
      >
        <TextField
          label="회원 검색"
          value={query}
          onValueChange={({ value }) => updateQuery(value)}
        >
          <TextFieldInput
            ref={inputRef}
            type="search"
            name="team-member-search"
            autoComplete="off"
            aria-controls="team-member-search-results"
            aria-expanded={isOpen}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={handleKeyDown}
          />
        </TextField>

        {isOpen &&
          resultPosition !== null &&
          (candidates.length > 0 ? (
            <Portal>
              <ul
                ref={resultListRef}
                id="team-member-search-results"
                className={styles.resultList}
                style={resultPosition}
              >
                {candidates.map((member, index) => {
                  const blockReason = getLastMemberBlockReason(snapshot, member.activityId);
                  const affiliation = getMemberAffiliation(snapshot, member.activityId);
                  return (
                    <li key={member.activityId}>
                      <button
                        id={`team-member-option-${member.activityId}`}
                        type="button"
                        data-highlighted={index === highlightedIndex ? '' : undefined}
                        disabled={blockReason !== undefined}
                        title={blockReason}
                        className={styles.resultButton}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectCandidate(member.activityId)}
                      >
                        <span className={styles.resultIcon} aria-hidden="true">
                          <Plus size={14} />
                        </span>
                        <span className={styles.resultInfo}>
                          <span className={styles.resultIdentity}>
                            <span className={styles.resultName}>{member.name}</span>
                            <span className={styles.resultBadges}>
                              <Badge variant="weak" tone="neutral">
                                {teamMappingPartLabels[member.part]}
                              </Badge>
                              <Badge variant="weak" tone="neutral">
                                {affiliation}
                              </Badge>
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Portal>
          ) : (
            <Portal>
              <p className={styles.emptyMessage} style={resultPosition}>
                검색 결과가 없습니다.
              </p>
            </Portal>
          ))}
      </div>

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
                  <span className={styles.resultIdentity}>
                    <span className={styles.resultName}>{member.name}</span>
                    <span className={styles.resultBadges}>
                      <Badge variant="weak" tone="neutral">
                        {teamMappingPartLabels[member.part]}
                      </Badge>
                      <Badge variant="weak" tone="neutral">
                        {getMemberAffiliation(snapshot, activityId)}
                      </Badge>
                    </span>
                  </span>
                </div>
                {editingTeam === undefined ? (
                  <ActionButton
                    type="button"
                    variant="neutralWeak"
                    aria-label={`${member.name} 선택 취소`}
                    onClick={() => removeCandidate(activityId)}
                  >
                    제거
                  </ActionButton>
                ) : (
                  <Menu.Root placement="bottom-end" gutter={4}>
                    <Menu.Trigger asChild>
                      <ActionButton
                        type="button"
                        variant="neutralWeak"
                        size="small"
                        aria-label={`${member.name} 메뉴`}
                      >
                        <Ellipsis size={18} aria-hidden="true" />
                      </ActionButton>
                    </Menu.Trigger>
                    <Menu.Positioner data-seed-color-mode="dark-only">
                      <Menu.Content>
                        <Menu.Group>
                          {snapshot.teams
                            .filter((candidateTeam) => candidateTeam.id !== editingTeam.id)
                            .map((candidateTeam) => (
                              <Menu.Item
                                key={candidateTeam.id}
                                onClick={() => onMoveMember?.(activityId, candidateTeam.id)}
                              >
                                <Menu.ItemBody>
                                  <Menu.ItemLabel>{candidateTeam.name}으로 이동</Menu.ItemLabel>
                                </Menu.ItemBody>
                              </Menu.Item>
                            ))}
                          <Menu.Item onClick={() => removeCandidate(activityId)}>
                            <Menu.ItemBody>
                              <Menu.ItemLabel className={styles.removeMenuLabel}>
                                팀에서 빼기
                              </Menu.ItemLabel>
                            </Menu.ItemBody>
                          </Menu.Item>
                        </Menu.Group>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Menu.Root>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
