import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Popover } from '@seed-design/react';
import { ActionButton } from '@yapp-plus/ui';
import { Check, ChevronDown, X } from 'lucide-react';
import {
  closeAttendance,
  cancelAttendance,
  AttendanceQueryBoundary,
  attendanceBadgeMutationOptions,
  attendanceCodeIssueMutationOptions,
  attendanceCodeReissueMutationOptions,
  attendanceCloseCancelMutationOptions,
  attendanceCloseMutationOptions,
  attendanceHistoryQueryOptions,
  attendanceOverrideMutationOptions,
  attendanceCodeQueryOptions,
  attendanceCodeApiQueryOptions,
  sessionAttendanceQueryOptions,
  sessionsQueryOptions,
  teamReviewDecisionMutationOptions,
  teamReviewsQueryOptions,
  teamReviewsApiQueryOptions,
  getSessionAttendance,
  useSessionAttendanceQueryState,
  useAttendanceCodeQueryState,
  useSessionsQueryState,
  updateMemberAttendance,
  updateMemberBadge,
  updateTeamPhotoReview,
  issueAttendanceCode,
  reissueAttendanceCode,
  type AttendanceEditInput,
  type AttendanceMutationInput,
  type AttendanceMemberViewModel,
  type AttendanceCodeViewModel,
  type AttendanceSessionViewModel,
  type TeamDecisionInput,
  type TeamReviewViewModel,
} from '~/features/session-management';
import { useOptionalAdminGeneration } from '~/features/admin-generation';
import { attendancePartSchema, partLabels, type AttendancePart } from '../model/attendance-search';
import * as styles from './session-attendance-content.css';

const statusLabels = {
  present: '출석',
  late: '지각',
  earlyLeave: '조퇴',
  absent: '결석',
  undecided: '미정',
  unsupported: '확인 필요',
};
const reportLabels = { late: '지각', earlyLeave: '조퇴', absence: '결석' };
const reviewStateLabels = {
  pending: '검수 대기',
  approved: '검수 완료',
  rejected: '반려됨',
  notSubmitted: '사진 미제출',
  unknown: '상태 확인 필요',
};
const summaryStatuses = ['present', 'late', 'earlyLeave', 'absent', 'undecided'] as const;
const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
const formatTime = (value: string | null) =>
  value ? timeFormatter.format(new Date(value)) : '기록 없음';

type AttendanceEditDetails =
  | {
      status: 'undecided' | 'present';
      penaltyCategory: null;
      durationBand: null;
    }
  | {
      status: 'late' | 'earlyLeave';
      penaltyCategory: 'regular' | 'unauthorized';
      durationBand: 'withinOneHour' | 'withinThreeHours';
    }
  | {
      status: 'absent';
      penaltyCategory: 'regular' | 'unauthorized';
      durationBand: null;
    };

type AttendanceStatusOption = {
  value: string;
  label: string;
  dotClass: string;
  edit: AttendanceEditDetails | null;
};

const attendanceStatusOptions = [
  {
    value: 'undecided',
    label: '미정',
    dotClass: styles.attendanceStatusDotUndecided,
    edit: { status: 'undecided', penaltyCategory: null, durationBand: null },
  },
  {
    value: 'present',
    label: '출석',
    dotClass: styles.attendanceStatusDotPresent,
    edit: { status: 'present', penaltyCategory: null, durationBand: null },
  },
  {
    value: 'absent',
    label: '결석',
    dotClass: styles.attendanceStatusDotAbsent,
    edit: { status: 'absent', penaltyCategory: 'regular', durationBand: null },
  },
  {
    value: 'lateWithinOneHour',
    label: '지각1시간',
    dotClass: styles.attendanceStatusDotLateOneHour,
    edit: {
      status: 'late',
      penaltyCategory: 'regular',
      durationBand: 'withinOneHour',
    },
  },
  {
    value: 'lateWithinThreeHours',
    label: '지각3시간',
    dotClass: styles.attendanceStatusDotLateThreeHours,
    edit: {
      status: 'late',
      penaltyCategory: 'regular',
      durationBand: 'withinThreeHours',
    },
  },
  {
    value: 'earlyLeaveWithinOneHour',
    label: '조퇴1시간',
    dotClass: styles.attendanceStatusDotEarlyLeaveOneHour,
    edit: {
      status: 'earlyLeave',
      penaltyCategory: 'regular',
      durationBand: 'withinOneHour',
    },
  },
  {
    value: 'earlyLeaveWithinThreeHours',
    label: '조퇴3시간',
    dotClass: styles.attendanceStatusDotEarlyLeaveThreeHours,
    edit: {
      status: 'earlyLeave',
      penaltyCategory: 'regular',
      durationBand: 'withinThreeHours',
    },
  },
  {
    value: 'unauthorizedEarlyLeaveWithinOneHour',
    label: '무단조퇴1시간',
    dotClass: styles.attendanceStatusDotUnauthorizedEarlyLeaveOneHour,
    edit: {
      status: 'earlyLeave',
      penaltyCategory: 'unauthorized',
      durationBand: 'withinOneHour',
    },
  },
  {
    value: 'unauthorizedEarlyLeaveWithinThreeHours',
    label: '무단조퇴3시간',
    dotClass: styles.attendanceStatusDotUnauthorizedEarlyLeaveThreeHours,
    edit: {
      status: 'earlyLeave',
      penaltyCategory: 'unauthorized',
      durationBand: 'withinThreeHours',
    },
  },
  {
    value: 'unauthorizedLateWithinOneHour',
    label: '무단지각1시간',
    dotClass: styles.attendanceStatusDotUnauthorizedLateOneHour,
    edit: {
      status: 'late',
      penaltyCategory: 'unauthorized',
      durationBand: 'withinOneHour',
    },
  },
  {
    value: 'unauthorizedLateWithinThreeHours',
    label: '무단지각3시간',
    dotClass: styles.attendanceStatusDotUnauthorizedLateThreeHours,
    edit: {
      status: 'late',
      penaltyCategory: 'unauthorized',
      durationBand: 'withinThreeHours',
    },
  },
  {
    value: 'unauthorizedAbsent',
    label: '무단결석',
    dotClass: styles.attendanceStatusDotUnauthorizedAbsent,
    edit: { status: 'absent', penaltyCategory: 'unauthorized', durationBand: null },
  },
  {
    value: 'lateOneHourAndEarlyLeaveOneHour',
    label: '지각1+조퇴1',
    dotClass: styles.attendanceStatusDotLateOneHourAndEarlyLeaveOneHour,
    edit: null,
  },
  {
    value: 'lateThreeHoursAndEarlyLeaveOneHour',
    label: '지각3+조퇴1',
    dotClass: styles.attendanceStatusDotLateThreeHoursAndEarlyLeaveOneHour,
    edit: null,
  },
  {
    value: 'lateOneHourAndEarlyLeaveThreeHours',
    label: '지각1+조퇴3',
    dotClass: styles.attendanceStatusDotLateOneHourAndEarlyLeaveThreeHours,
    edit: null,
  },
  {
    value: 'lateThreeHoursAndEarlyLeaveThreeHours',
    label: '지각3+조퇴3',
    dotClass: styles.attendanceStatusDotLateThreeHoursAndEarlyLeaveThreeHours,
    edit: null,
  },
] satisfies readonly AttendanceStatusOption[];

type AttendanceStatusOptionValue = (typeof attendanceStatusOptions)[number]['value'];

function getAttendanceStatusOptionValue(
  attendance: AttendanceMemberViewModel['attendance'],
): AttendanceStatusOptionValue {
  if (attendance.status === 'late') {
    if (attendance.penaltyCategory === 'unauthorized') {
      return attendance.durationBand === 'withinThreeHours'
        ? 'unauthorizedLateWithinThreeHours'
        : 'unauthorizedLateWithinOneHour';
    }
    return attendance.durationBand === 'withinThreeHours'
      ? 'lateWithinThreeHours'
      : 'lateWithinOneHour';
  }
  if (attendance.status === 'earlyLeave') {
    if (attendance.penaltyCategory === 'unauthorized') {
      return attendance.durationBand === 'withinThreeHours'
        ? 'unauthorizedEarlyLeaveWithinThreeHours'
        : 'unauthorizedEarlyLeaveWithinOneHour';
    }
    return attendance.durationBand === 'withinThreeHours'
      ? 'earlyLeaveWithinThreeHours'
      : 'earlyLeaveWithinOneHour';
  }
  if (attendance.status === 'present') {
    return 'present';
  }
  if (attendance.status === 'absent') {
    return attendance.penaltyCategory === 'unauthorized' ? 'unauthorizedAbsent' : 'absent';
  }
  return 'undecided';
}

function getAttendanceStatusOption(value: AttendanceStatusOptionValue): AttendanceStatusOption {
  const option = attendanceStatusOptions.find((candidate) => candidate.value === value);
  if (!option) {
    throw new Error(`지원하지 않는 출결 선택값입니다: ${value}`);
  }
  return option;
}

function getAttendanceStatusOptionValueFromEdit(
  edit: Pick<AttendanceEditInput, 'status' | 'penaltyCategory' | 'durationBand'>,
): AttendanceStatusOptionValue {
  if (edit.status === 'late') {
    if (edit.penaltyCategory === 'unauthorized') {
      return edit.durationBand === 'withinThreeHours'
        ? 'unauthorizedLateWithinThreeHours'
        : 'unauthorizedLateWithinOneHour';
    }
    return edit.durationBand === 'withinThreeHours' ? 'lateWithinThreeHours' : 'lateWithinOneHour';
  }
  if (edit.status === 'earlyLeave') {
    if (edit.penaltyCategory === 'unauthorized') {
      return edit.durationBand === 'withinThreeHours'
        ? 'unauthorizedEarlyLeaveWithinThreeHours'
        : 'unauthorizedEarlyLeaveWithinOneHour';
    }
    return edit.durationBand === 'withinThreeHours'
      ? 'earlyLeaveWithinThreeHours'
      : 'earlyLeaveWithinOneHour';
  }
  if (edit.status === 'absent') {
    return edit.penaltyCategory === 'unauthorized' ? 'unauthorizedAbsent' : 'absent';
  }
  return edit.status;
}

type AttendancePickerOption = AttendanceStatusOption & {
  durationLabel?: '1시간' | '3시간';
  scoreLabel: string;
};

type AttendancePickerGroup = {
  value: 'late' | 'earlyLeave' | 'unauthorizedLate' | 'unauthorizedEarlyLeave';
  label: string;
  dotClass: string;
  options: AttendancePickerOption[];
};
type AttendancePickerGroupValue = AttendancePickerGroup['value'];

const createPickerOption = (
  value: AttendanceStatusOptionValue,
  scoreLabel: string,
  durationLabel?: AttendancePickerOption['durationLabel'],
): AttendancePickerOption => ({
  ...getAttendanceStatusOption(value),
  scoreLabel,
  durationLabel,
});

const singleAttendancePickerOptions: AttendancePickerOption[] = [
  createPickerOption('present', '0점'),
  createPickerOption('absent', '-12점'),
  createPickerOption('unauthorizedAbsent', '-20점'),
];

const attendancePickerGroups: AttendancePickerGroup[] = [
  {
    value: 'late',
    label: '지각',
    dotClass: styles.attendanceStatusDotLateOneHour,
    options: [
      createPickerOption('lateWithinOneHour', '-4점', '1시간'),
      createPickerOption('lateWithinThreeHours', '-8점', '3시간'),
    ],
  },
  {
    value: 'unauthorizedLate',
    label: '무단지각',
    dotClass: styles.attendanceStatusDotUnauthorizedLateOneHour,
    options: [
      createPickerOption('unauthorizedLateWithinOneHour', '-10점', '1시간'),
      createPickerOption('unauthorizedLateWithinThreeHours', '-14점', '3시간'),
    ],
  },
  {
    value: 'earlyLeave',
    label: '조퇴',
    dotClass: styles.attendanceStatusDotEarlyLeaveOneHour,
    options: [
      createPickerOption('earlyLeaveWithinOneHour', '-4점', '1시간'),
      createPickerOption('earlyLeaveWithinThreeHours', '-8점', '3시간'),
    ],
  },
  {
    value: 'unauthorizedEarlyLeave',
    label: '무단조퇴',
    dotClass: styles.attendanceStatusDotUnauthorizedEarlyLeaveOneHour,
    options: [
      createPickerOption('unauthorizedEarlyLeaveWithinOneHour', '-10점', '1시간'),
      createPickerOption('unauthorizedEarlyLeaveWithinThreeHours', '-14점', '3시간'),
    ],
  },
];

function getAttendancePickerGroup(value: AttendanceStatusOptionValue) {
  return attendancePickerGroups.find((group) =>
    group.options.some((option) => option.value === value),
  );
}

function getAttendancePickerOption(value: AttendanceStatusOptionValue) {
  return attendancePickerGroups
    .flatMap((group) => group.options)
    .find((option) => option.value === value);
}

function formatAttendancePickerOption(option: AttendancePickerOption) {
  return option.durationLabel
    ? `${option.label.replace(/1시간|3시간/, '')} ${option.durationLabel}`
    : option.label;
}

function getScoreValue(scoreLabel: string) {
  return Number.parseInt(scoreLabel.replace('점', ''), 10);
}

function createAttendanceEdit(
  member: AttendanceMemberViewModel,
  edit: AttendanceEditDetails,
): AttendanceEditInput {
  return {
    membershipId: member.membershipId,
    ...edit,
    reason: member.attendance.reason,
  };
}

function MemberRow({
  member,
  onAttendanceChange,
  onBadgeChange,
  onHistoryOpen,
  disabled,
}: {
  member: AttendanceMemberViewModel;
  onAttendanceChange: (
    member: AttendanceMemberViewModel,
    edit: AttendanceEditDetails | AttendanceEditDetails[],
  ) => void;
  onBadgeChange: (member: AttendanceMemberViewModel) => void;
  onHistoryOpen: (member: AttendanceMemberViewModel) => void;
  disabled: boolean;
}) {
  const part = attendancePartSchema.safeParse(member.part);
  const [pickerOpen, setPickerOpen] = useState(false);
  const serverSelectedOption = getAttendanceStatusOption(
    getAttendanceStatusOptionValue(member.attendance),
  );
  const mockSelectionValues = member.attendanceEdits?.map(getAttendanceStatusOptionValueFromEdit);
  const mockSingleOptionValue = mockSelectionValues?.find(
    (value) => getAttendancePickerGroup(value) === undefined,
  );
  const selectedSingleOption = mockSingleOptionValue
    ? getAttendanceStatusOption(mockSingleOptionValue)
    : serverSelectedOption;
  const [selectedTimeOptionValues, setSelectedTimeOptionValues] = useState<
    AttendanceStatusOptionValue[]
  >(() => {
    const mockTimeOptionValues = mockSelectionValues?.filter(
      (value) => getAttendancePickerGroup(value) !== undefined,
    );
    if (mockTimeOptionValues !== undefined && mockTimeOptionValues.length > 0) {
      return mockTimeOptionValues;
    }
    return getAttendancePickerGroup(serverSelectedOption.value) ? [serverSelectedOption.value] : [];
  });
  const selectedTimeOptions = selectedTimeOptionValues.flatMap((value) => {
    const option = getAttendancePickerOption(value);
    return option === undefined ? [] : [option];
  });
  const triggerOptions =
    selectedTimeOptions.length > 0 ? selectedTimeOptions : [selectedSingleOption];
  const triggerLabel = triggerOptions
    .map((option) => {
      const timeOption = selectedTimeOptions.find((candidate) => candidate.value === option.value);
      return timeOption ? formatAttendancePickerOption(timeOption) : option.label;
    })
    .join(' + ');
  let triggerScore = '점수 확인 필요';
  if (selectedTimeOptions.length > 0) {
    triggerScore = `${selectedTimeOptions.reduce((total, option) => total + getScoreValue(option.scoreLabel), 0)}점`;
  } else if (member.score.delta !== null) {
    triggerScore = `${member.score.delta}점`;
  }
  const isControlDisabled = disabled || !member.isEditable;
  const handleAttendanceSelect = (option: AttendancePickerOption) => {
    if (isControlDisabled || !option.edit) {
      return;
    }
    setSelectedTimeOptionValues([]);
    onAttendanceChange(member, option.edit);
    setPickerOpen(false);
  };
  const handleTimeOptionToggle = (
    group: AttendancePickerGroupValue,
    option: AttendancePickerOption,
  ) => {
    if (isControlDisabled) {
      return;
    }
    setSelectedTimeOptionValues((current) => {
      const withoutGroup = current.filter(
        (value) => getAttendancePickerGroup(value)?.value !== group,
      );
      return current.includes(option.value) ? withoutGroup : [...withoutGroup, option.value];
    });
  };
  const handleTimeSelectionApply = () => {
    const edits = selectedTimeOptions.flatMap((option) =>
      option.edit === null ? [] : [option.edit],
    );
    if (edits.length === 0) {
      return;
    }
    onAttendanceChange(member, edits);
    setPickerOpen(false);
  };
  return (
    <tr>
      <th scope="row">
        <strong>{member.name}</strong>
        <span className={styles.secondary}>
          {part.success ? partLabels[part.data] : '직군 미확인'}
        </span>
      </th>
      <td>{member.latestReport ? reportLabels[member.latestReport.type] : '보고 없음'}</td>
      <td>
        {formatTime(member.attendance.checkedInAt)}
        {member.attendance.earlyLeaveAt && (
          <span className={styles.secondary}>
            조퇴 {formatTime(member.attendance.earlyLeaveAt)}
          </span>
        )}
      </td>
      <td aria-label="현재 출결 및 점수">
        <div className={styles.inlineControl}>
          <Popover.Root
            open={pickerOpen}
            onOpenChange={(open) => setPickerOpen(open)}
            placement="bottom-start"
            flip={false}
            gutter={6}
          >
            <Popover.Trigger
              className={styles.attendanceSelect}
              aria-label={`${member.name} 출결 상태 ${triggerLabel}`}
              aria-disabled={isControlDisabled}
              onClick={(event) => {
                if (isControlDisabled) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }}
            >
              <span className={styles.attendanceTriggerValue}>
                <span
                  className={`${styles.attendanceStatusDot} ${selectedTimeOptions[0]?.dotClass ?? selectedSingleOption.dotClass}`}
                  aria-hidden="true"
                />
                <span>{triggerLabel}</span>
              </span>
              <span className={styles.attendanceTriggerScore}>{triggerScore}</span>
              <ChevronDown aria-hidden="true" size={16} />
            </Popover.Trigger>
            <Popover.Positioner>
              <Popover.Content
                className={styles.attendancePicker}
                aria-label={`${member.name} 출결 선택`}
              >
                <div className={styles.attendancePickerHeader}>
                  <div>
                    <Popover.Title className={styles.attendancePickerTitle}>
                      현재 출결 선택
                    </Popover.Title>
                    <span className={styles.attendancePickerMember}>{member.name}</span>
                  </div>
                  <Popover.CloseButton
                    className={styles.attendancePickerClose}
                    aria-label="출결 선택 닫기"
                    type="button"
                  >
                    <X aria-hidden="true" size={16} />
                  </Popover.CloseButton>
                </div>
                <div className={styles.attendancePickerSection}>
                  <span className={styles.attendancePickerSectionLabel}>
                    단일 상태 · 하나만 선택
                  </span>
                  <div className={styles.attendanceSingleGrid} aria-label="단일 상태">
                    {singleAttendancePickerOptions.map((option) => {
                      const isSelected =
                        selectedTimeOptions.length === 0 &&
                        option.value === selectedSingleOption.value;
                      return (
                        <button
                          className={`${styles.attendanceChoice} ${styles.attendanceSingleChoice} ${isSelected ? styles.attendanceChoiceSelected : ''}`}
                          key={option.value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => handleAttendanceSelect(option)}
                        >
                          <span className={styles.attendanceChoiceLabel}>
                            <span
                              className={`${styles.attendanceStatusDot} ${option.dotClass}`}
                              aria-hidden="true"
                            />
                            {option.label}
                          </span>
                          <span className={styles.attendanceChoiceScore}>{option.scoreLabel}</span>
                          {isSelected && <Check aria-hidden="true" size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.attendancePickerSection}>
                  <span className={styles.attendancePickerSectionLabel}>
                    시간 상태 · 복수 선택 가능
                  </span>
                  <div className={styles.attendanceTimeList}>
                    {attendancePickerGroups.map((group) => (
                      <div className={styles.attendanceTimeRow} key={group.value}>
                        <span className={styles.attendanceTimeLabel}>
                          <span
                            className={`${styles.attendanceStatusDot} ${group.dotClass}`}
                            aria-hidden="true"
                          />
                          {group.label}
                        </span>
                        <div className={styles.attendanceTimeOptions}>
                          {group.options.map((option) => {
                            const isSelected = selectedTimeOptionValues.includes(option.value);
                            return (
                              <button
                                className={`${styles.attendanceTimeChoice} ${isSelected ? styles.attendanceChoiceSelected : ''}`}
                                key={option.value}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => handleTimeOptionToggle(group.value, option)}
                              >
                                <span>{option.durationLabel}</span>
                                <span className={styles.attendanceChoiceScore}>
                                  {option.scoreLabel}
                                </span>
                                {isSelected && <Check aria-hidden="true" size={14} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.attendancePickerActions}>
                    <span className={styles.attendancePickerSelectionCount}>
                      {selectedTimeOptions.length}개 선택
                    </span>
                    <ActionButton
                      variant="brandSolid"
                      size="small"
                      type="button"
                      disabled={selectedTimeOptions.length === 0 || isControlDisabled}
                      onClick={handleTimeSelectionApply}
                    >
                      선택 적용
                    </ActionButton>
                  </div>
                </div>
              </Popover.Content>
            </Popover.Positioner>
          </Popover.Root>
        </div>
      </td>
      <td>
        <ActionButton
          variant="neutralWeak"
          size="small"
          type="button"
          disabled={disabled || !member.isEditable}
          onClick={() => onBadgeChange(member)}
        >
          {member.badge.verified ? '확인 해제' : '명찰 확인'}
        </ActionButton>
        {member.badge.verified && (
          <span className={styles.secondary}>{formatTime(member.badge.verifiedAt)}</span>
        )}
      </td>
      <td>
        <ActionButton
          variant="neutralWeak"
          size="small"
          type="button"
          onClick={() => onHistoryOpen(member)}
        >
          이력
        </ActionButton>
      </td>
    </tr>
  );
}

function ReportRow({ member }: { member: AttendanceMemberViewModel }) {
  const report = member.latestReport;
  if (!report) {
    return null;
  }
  const part = attendancePartSchema.safeParse(member.part);
  const eligibilityLabels = {
    eligible: '인정 대상',
    ineligible: '확인 필요',
    unknown: '판단 보류',
  };
  return (
    <tr>
      <th scope="row">
        <strong>{member.name}</strong>
        <span className={styles.secondary}>
          {part.success ? partLabels[part.data] : '직군 미확인'}
        </span>
      </th>
      <td>{reportLabels[report.type]}</td>
      <td>{report.reason}</td>
      <td>{formatTime(report.submittedAt)}</td>
      <td>{eligibilityLabels[report.eligibility]}</td>
    </tr>
  );
}

function TeamReviewRow({
  review,
  disabled,
  onDecision,
}: {
  review: TeamReviewViewModel;
  disabled: boolean;
  onDecision: (input: TeamDecisionInput) => void;
}) {
  const selectedMembers = review.photo
    ? review.members.filter((member) =>
        review.photo?.selectedMembershipIds.includes(member.membershipId),
      )
    : [];
  let attendanceTargetLabel = '미정';
  if (review.photo) {
    attendanceTargetLabel =
      selectedMembers.length > 0 ? selectedMembers.map((member) => member.name).join(', ') : '없음';
  }
  return (
    <li className={styles.reviewCard}>
      <div>
        <strong>{review.teamName}</strong>
        <span className={styles.secondary}>{reviewStateLabels[review.reviewState]}</span>
      </div>
      {review.photo ? (
        <div className={styles.reviewMeta}>
          {review.photo.access === 'available' ? (
            <a
              className={styles.photoLink}
              href={review.photo.readUrl}
              target="_blank"
              rel="noreferrer"
            >
              검수 사진 열기
            </a>
          ) : (
            <span>사진을 확인할 수 없습니다.</span>
          )}
          <span className={styles.secondary}>
            {review.photo.uploaderName ?? '업로더 미상'} · {formatTime(review.photo.submittedAt)}
          </span>
        </div>
      ) : (
        <span className={styles.secondary}>제출된 사진이 없습니다.</span>
      )}
      <span className={styles.secondary}>출석 대상: {attendanceTargetLabel}</span>
      {review.reviewState === 'pending' && review.photo?.access === 'available' && (
        <div className={styles.reviewActions}>
          <ActionButton
            variant="brandSolid"
            size="small"
            type="button"
            disabled={disabled}
            onClick={() =>
              onDecision({
                photoId: review.photo?.photoId ?? '',
                decision: 'approve',
                reason: null,
              })
            }
          >
            승인
          </ActionButton>
          <ActionButton
            variant="neutralWeak"
            size="small"
            type="button"
            disabled={disabled}
            onClick={() =>
              onDecision({ photoId: review.photo?.photoId ?? '', decision: 'reject', reason: null })
            }
          >
            반려
          </ActionButton>
        </div>
      )}
    </li>
  );
}

function AttendanceCodeCard({
  code,
  isPending,
  error,
  isQueryPending,
  queryError,
  onIssue,
  onReissue,
}: {
  code: AttendanceCodeViewModel | undefined;
  isPending: boolean;
  error: boolean;
  isQueryPending: boolean;
  queryError: boolean;
  onIssue: () => void;
  onReissue: () => void;
}) {
  return (
    <section className={styles.card} aria-busy={isPending || isQueryPending} aria-label="출석 코드">
      <h2 className={styles.heading}>출석 코드</h2>
      {isQueryPending && <output>출석 코드를 불러오는 중입니다.</output>}
      {queryError && <span role="alert">출석 코드를 불러오지 못했습니다.</span>}
      {isPending && <output>출석 코드를 처리하는 중입니다.</output>}
      {code?.state === 'notIssued' && (
        <div className={styles.codeContent}>
          <p className={styles.secondary}>아직 출석 코드가 발급되지 않았습니다.</p>
          <ActionButton
            variant="brandSolid"
            size="small"
            type="button"
            disabled={isPending}
            onClick={onIssue}
          >
            출석 코드 발급
          </ActionButton>
        </div>
      )}
      {code?.state === 'active' && (
        <div className={styles.codeContent}>
          <strong className={styles.codeValue}>{code.code}</strong>
          <span className={styles.secondary}>만료 시각 · {formatTime(code.expiresAt)}</span>
          <ActionButton
            variant="neutralWeak"
            size="small"
            type="button"
            disabled={isPending}
            onClick={onReissue}
          >
            코드 재발급
          </ActionButton>
        </div>
      )}
      {code?.state === 'expired' && (
        <div className={styles.codeContent}>
          {code.code && <strong className={styles.codeValue}>{code.code}</strong>}
          <span className={styles.secondary}>출석 코드가 만료되었습니다.</span>
          <ActionButton
            variant="brandSolid"
            size="small"
            type="button"
            disabled={isPending}
            onClick={onReissue}
          >
            코드 재발급
          </ActionButton>
        </div>
      )}
      {error && <span role="alert">출석 코드 처리에 실패했습니다. 다시 시도해 주세요.</span>}
    </section>
  );
}

export function SessionAttendanceContent({
  sessionId,
  part,
}: {
  sessionId: string;
  part: AttendancePart;
}) {
  return (
    <AttendanceQueryBoundary
      fallback={<output>출석 내역을 불러오는 중입니다.</output>}
      errorMessage="출석 내역을 불러오지 못했습니다."
      resetKey={`session-attendance-${sessionId}`}
    >
      <SessionAttendanceData sessionId={sessionId} part={part} />
    </AttendanceQueryBoundary>
  );
}

function SessionAttendanceData({ sessionId, part }: { sessionId: string; part: AttendancePart }) {
  const generation = useOptionalAdminGeneration();
  if (!generation) {
    return <MockSessionAttendanceData sessionId={sessionId} part={part} />;
  }
  return (
    <ApiSessionAttendanceData
      generationId={generation.currentGeneration.generationId}
      sessionId={sessionId}
      part={part}
    />
  );
}

function MockSessionAttendanceData({
  sessionId,
  part,
}: {
  sessionId: string;
  part: AttendancePart;
}) {
  const [{ data: attendance }, { data: attendanceCode }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['admin', 'sessions', sessionId, 'attendance'],
        queryFn: () => getSessionAttendance(sessionId),
        retry: false,
      },
      attendanceCodeQueryOptions(sessionId),
    ],
  });
  return (
    <SessionAttendanceView
      sessionId={sessionId}
      part={part}
      attendance={attendance}
      attendanceCode={attendanceCode}
    />
  );
}

function ApiSessionAttendanceData({
  generationId,
  sessionId,
  part,
}: {
  generationId: number;
  sessionId: string;
  part: AttendancePart;
}) {
  // 각 query는 같은 렌더에서 시작하고, 결과는 독립적으로 처리해 allSettled와 같은 부분 성공을 보장한다.
  const sessionsQuery = useSessionsQueryState(generationId);
  const attendanceQuery = useSessionAttendanceQueryState(generationId, sessionId);
  const attendanceCodeQuery = useAttendanceCodeQueryState(generationId, sessionId);
  const sessions = sessionsQuery.data;
  const { members } = attendanceQuery;

  if (sessionsQuery.isPending) {
    return <output>세션 정보를 불러오는 중입니다.</output>;
  }
  if (sessionsQuery.isError) {
    throw new Error('세션 정보를 불러오지 못했습니다.', { cause: sessionsQuery.error });
  }
  if (!sessions) {
    return <output>세션 정보를 불러오는 중입니다.</output>;
  }

  const session = sessions.find((item) => item.id === sessionId);
  if (!session) {
    throw new Error('출석을 조회할 세션을 찾을 수 없습니다.');
  }
  const attendance = {
    session: {
      id: session.id,
      generationId: String(generationId),
      title: session.name,
      type: session.type === 'team' ? ('team' as const) : ('regular' as const),
      startsAt: `${session.date}T${session.startTime}+09:00`,
      endsAt: `${session.date}T${session.endTime}+09:00`,
      phase: session.phase,
      canCancelClose: false,
      summary: {
        total: members.length,
        present: members.filter((member) => member.attendance.status === 'present').length,
        late: members.filter((member) => member.attendance.status === 'late').length,
        earlyLeave: members.filter((member) => member.attendance.status === 'earlyLeave').length,
        absent: members.filter((member) => member.attendance.status === 'absent').length,
        undecided: members.filter((member) => member.attendance.status === 'undecided').length,
        reported: members.filter((member) => member.latestReport !== null).length,
      },
    },
    members,
  };
  return (
    <SessionAttendanceView
      sessionId={sessionId}
      part={part}
      attendance={attendance}
      attendanceLoading={attendanceQuery.isPending}
      attendanceError={attendanceQuery.isError}
      attendanceCode={attendanceCodeQuery.data}
      attendanceCodeLoading={attendanceCodeQuery.isPending}
      attendanceCodeError={attendanceCodeQuery.isError}
      generationId={generationId}
    />
  );
}

function SessionAttendanceView({
  sessionId,
  part,
  attendance,
  attendanceLoading = false,
  attendanceError = false,
  attendanceCode,
  attendanceCodeLoading = false,
  attendanceCodeError = false,
  generationId,
}: {
  sessionId: string;
  part: AttendancePart;
  attendance: {
    session: AttendanceSessionViewModel;
    members: AttendanceMemberViewModel[];
  };
  attendanceLoading?: boolean;
  attendanceError?: boolean;
  attendanceCode: AttendanceCodeViewModel | undefined;
  attendanceCodeLoading?: boolean;
  attendanceCodeError?: boolean;
  generationId?: number;
}) {
  const [historyMember, setHistoryMember] = useState<AttendanceMemberViewModel | null>(null);
  const queryClient = useQueryClient();
  const { session, members } = attendance;
  const attendanceApiQueryKey =
    generationId === undefined
      ? ['admin', 'sessions', sessionId, 'attendance']
      : sessionAttendanceQueryOptions(generationId, sessionId).queryKey;
  const sessionsApiQueryKey =
    generationId === undefined
      ? ['admin', 'sessions']
      : sessionsQueryOptions(generationId).queryKey;
  const attendanceCodeApiQueryKey =
    generationId === undefined
      ? ['admin', 'sessions', sessionId, 'attendance-code']
      : attendanceCodeApiQueryOptions(generationId, sessionId).queryKey;
  const teamReviewsApiQueryKey =
    generationId === undefined
      ? ['admin', 'sessions', sessionId, 'team-reviews']
      : teamReviewsApiQueryOptions(generationId, sessionId).queryKey;
  const attendanceMutation = useMutation({
    ...(generationId === undefined
      ? {
          mutationFn: async (input: AttendanceMutationInput) => {
            const edits = Array.isArray(input) ? input : [input];
            for (const edit of edits) {
              await updateMemberAttendance(sessionId, edit);
            }
          },
        }
      : attendanceOverrideMutationOptions(generationId, sessionId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceApiQueryKey }),
  });
  const badgeMutation = useMutation({
    ...(generationId === undefined
      ? {
          mutationFn: async (input: { membershipId: string; verified: boolean }) => {
            await updateMemberBadge(sessionId, input);
          },
        }
      : attendanceBadgeMutationOptions(generationId, sessionId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceApiQueryKey }),
  });
  const issueCodeMutation = useMutation({
    ...(generationId === undefined
      ? {
          mutationFn: () => issueAttendanceCode(sessionId),
        }
      : attendanceCodeIssueMutationOptions(generationId, sessionId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceCodeApiQueryKey }),
  });
  const reissueCodeMutation = useMutation({
    ...(generationId === undefined
      ? {
          mutationFn: () => reissueAttendanceCode(sessionId),
        }
      : attendanceCodeReissueMutationOptions(generationId, sessionId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceCodeApiQueryKey }),
  });
  const closeMutation = useMutation({
    ...(generationId === undefined
      ? {
          mutationFn: async () => {
            await closeAttendance(sessionId);
          },
        }
      : attendanceCloseMutationOptions(generationId, sessionId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attendanceApiQueryKey });
      void queryClient.invalidateQueries({ queryKey: sessionsApiQueryKey });
    },
  });
  const cancelMutation = useMutation({
    ...(generationId === undefined
      ? {
          mutationFn: async () => {
            await cancelAttendance(sessionId);
          },
        }
      : attendanceCloseCancelMutationOptions(generationId, sessionId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attendanceApiQueryKey });
      void queryClient.invalidateQueries({ queryKey: sessionsApiQueryKey });
    },
  });
  const teamReviewMutation = useMutation({
    ...(generationId === undefined
      ? {
          mutationFn: async (input: TeamDecisionInput) => {
            await updateTeamPhotoReview(sessionId, input);
          },
        }
      : teamReviewDecisionMutationOptions(generationId, sessionId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamReviewsApiQueryKey });
      void queryClient.invalidateQueries({ queryKey: attendanceApiQueryKey });
    },
  });
  let displayedSession = session;
  if (closeMutation.isSuccess) {
    displayedSession = { ...session, phase: 'closed', canCancelClose: true };
  }
  if (cancelMutation.isSuccess) {
    displayedSession = { ...session, phase: 'open', canCancelClose: false };
  }
  const attendanceCodeCard = (
    <AttendanceCodeCard
      code={attendanceCode}
      isPending={issueCodeMutation.isPending || reissueCodeMutation.isPending}
      error={issueCodeMutation.isError || reissueCodeMutation.isError}
      isQueryPending={attendanceCodeLoading}
      queryError={attendanceCodeError}
      onIssue={() => issueCodeMutation.mutate()}
      onReissue={() => reissueCodeMutation.mutate()}
    />
  );
  if (session.type === 'team') {
    return (
      <TeamSessionContent
        sessionId={sessionId}
        session={displayedSession}
        generationId={generationId}
        closePending={closeMutation.isPending}
        closeError={closeMutation.isError}
        onClose={() => closeMutation.mutate()}
        cancelPending={cancelMutation.isPending}
        cancelError={cancelMutation.isError}
        onCancel={() => cancelMutation.mutate()}
        teamDecisionPending={teamReviewMutation.isPending}
        teamDecisionError={teamReviewMutation.isError}
        onTeamDecision={(input) => teamReviewMutation.mutate(input)}
      />
    );
  }
  const visibleMembers = members.filter((member) => part === 'all' || member.part === part);
  const reportedMembers = visibleMembers.filter((member) => member.latestReport);
  return (
    <RegularSessionContent
      sessionId={sessionId}
      session={displayedSession}
      visibleMembers={visibleMembers}
      reportedMembers={reportedMembers}
      attendanceLoading={attendanceLoading}
      attendanceError={attendanceError}
      attendanceCodeCard={attendanceCodeCard}
      attendancePending={attendanceMutation.isPending}
      onAttendanceChange={(input) => attendanceMutation.mutate(input)}
      badgePending={badgeMutation.isPending}
      onBadgeChange={(member) =>
        badgeMutation.mutate({
          membershipId: member.membershipId,
          verified: !member.badge.verified,
        })
      }
      historyMember={historyMember}
      onHistoryOpen={setHistoryMember}
      onHistoryClose={() => setHistoryMember(null)}
      closePending={closeMutation.isPending}
      closeError={closeMutation.isError}
      onClose={() => closeMutation.mutate()}
      cancelPending={cancelMutation.isPending}
      cancelError={cancelMutation.isError}
      onCancel={() => cancelMutation.mutate()}
    />
  );
}

function TeamSessionContent({
  sessionId,
  session,
  generationId,
  closePending,
  closeError,
  onClose,
  cancelPending,
  cancelError,
  onCancel,
  teamDecisionPending,
  teamDecisionError,
  onTeamDecision,
}: {
  sessionId: string;
  session: AttendanceSessionViewModel;
  generationId?: number;
  closePending: boolean;
  closeError: boolean;
  onClose: () => void;
  cancelPending: boolean;
  cancelError: boolean;
  onCancel: () => void;
  teamDecisionPending: boolean;
  teamDecisionError: boolean;
  onTeamDecision: (input: TeamDecisionInput) => void;
}) {
  const teamReviewsQuery = useQuery(
    generationId === undefined
      ? teamReviewsQueryOptions(sessionId)
      : teamReviewsApiQueryOptions(generationId, sessionId),
  );
  const teamReviews = teamReviewsQuery.data ?? [];
  const pendingReviewCount = teamReviews.filter(
    (review) => review.reviewState === 'pending',
  ).length;
  const sessionAction = getSessionAction({
    session,
    closePending,
    onClose,
    cancelPending,
    onCancel,
    blockClose: pendingReviewCount > 0 || teamReviewsQuery.isPending || teamReviewsQuery.isError,
  });

  return (
    <>
      <section className={styles.card} aria-label="세션 정보">
        <h2 className={styles.heading}>{session.title}</h2>
        <p className={styles.secondary}>
          팀 세션 ·{' '}
          {{ closed: '출석 마감', open: '출석 진행 중', unknown: '상태 확인 필요' }[session.phase]}
        </p>
        <div className={styles.sessionActions}>
          {sessionAction}
          {pendingReviewCount > 0 && (
            <output>검수 대기 사진 {pendingReviewCount}건을 먼저 처리해 주세요.</output>
          )}
          {closeError && <span role="alert">출석 마감에 실패했습니다. 다시 시도해 주세요.</span>}
          {cancelError && <span role="alert">마감 취소에 실패했습니다. 다시 시도해 주세요.</span>}
          {teamDecisionError && (
            <span role="alert">사진 검수 저장에 실패했습니다. 다시 시도해 주세요.</span>
          )}
        </div>
      </section>
      <section className={styles.card} aria-label="팀 사진 검수">
        <h2 className={styles.heading}>팀 사진 검수</h2>
        <ul className={styles.reviewList}>
          {teamReviews.map((review) => (
            <TeamReviewRow
              key={review.teamId}
              review={review}
              disabled={teamDecisionPending || session.phase === 'closed'}
              onDecision={onTeamDecision}
            />
          ))}
        </ul>
        {teamReviewsQuery.isPending && <output>팀 사진 검수 목록을 불러오는 중입니다.</output>}
        {teamReviewsQuery.isError && (
          <span role="alert">팀 사진 검수 목록을 불러오지 못했습니다.</span>
        )}
        {!teamReviewsQuery.isPending && !teamReviewsQuery.isError && teamReviews.length === 0 && (
          <output>검수할 팀 사진이 없습니다.</output>
        )}
      </section>
    </>
  );
}

function RegularSessionContent({
  sessionId,
  session,
  visibleMembers,
  reportedMembers,
  attendanceLoading,
  attendanceError,
  attendanceCodeCard,
  attendancePending,
  onAttendanceChange,
  badgePending,
  onBadgeChange,
  historyMember,
  onHistoryOpen,
  onHistoryClose,
  closePending,
  closeError,
  onClose,
  cancelPending,
  cancelError,
  onCancel,
}: {
  sessionId: string;
  session: AttendanceSessionViewModel;
  visibleMembers: AttendanceMemberViewModel[];
  reportedMembers: AttendanceMemberViewModel[];
  attendanceLoading: boolean;
  attendanceError: boolean;
  attendanceCodeCard: ReactNode;
  attendancePending: boolean;
  onAttendanceChange: (input: AttendanceMutationInput) => void;
  badgePending: boolean;
  onBadgeChange: (member: AttendanceMemberViewModel) => void;
  historyMember: AttendanceMemberViewModel | null;
  onHistoryOpen: (member: AttendanceMemberViewModel) => void;
  onHistoryClose: () => void;
  closePending: boolean;
  closeError: boolean;
  onClose: () => void;
  cancelPending: boolean;
  cancelError: boolean;
  onCancel: () => void;
}) {
  const [tab, setTab] = useState<'attendance' | 'reports'>('attendance');
  const sessionAction = getSessionAction({
    session,
    closePending,
    onClose,
    cancelPending,
    onCancel,
    blockClose: false,
  });

  return (
    <>
      <section className={styles.card} aria-label="세션 정보">
        <h2 className={styles.heading}>{session.title}</h2>
        <p className={styles.secondary}>
          정규 세션 ·{' '}
          {{ closed: '출석 마감', open: '출석 진행 중', unknown: '상태 확인 필요' }[session.phase]}
        </p>
        <div className={styles.sessionActions}>
          {sessionAction}
          {closeError && <span role="alert">출석 마감에 실패했습니다. 다시 시도해 주세요.</span>}
          {cancelError && <span role="alert">마감 취소에 실패했습니다. 다시 시도해 주세요.</span>}
        </div>
      </section>
      {attendanceCodeCard}
      <section className={styles.card} aria-label="출석 요약">
        <h2 className={styles.heading}>출석 요약 · 전체 {session.summary.total}명</h2>
        <dl className={styles.summary}>
          {summaryStatuses.map((status) => (
            <div className={styles.stat} key={status}>
              <dt>{statusLabels[status]}</dt>
              <dd>{session.summary[status]}명</dd>
            </div>
          ))}
        </dl>
      </section>
      <div className={styles.tabs} aria-label="출석부 보기" role="tablist">
        <button
          className={tab === 'attendance' ? styles.activeTab : styles.tab}
          id="attendance-tab"
          role="tab"
          aria-controls="attendance-panel"
          aria-selected={tab === 'attendance'}
          type="button"
          onClick={() => setTab('attendance')}
        >
          출석 체크 {visibleMembers.length}
        </button>
        <button
          className={tab === 'reports' ? styles.activeTab : styles.tab}
          id="reports-tab"
          role="tab"
          aria-controls="reports-panel"
          aria-selected={tab === 'reports'}
          type="button"
          onClick={() => setTab('reports')}
        >
          사전 보고 기록 {reportedMembers.length}
        </button>
      </div>
      {tab === 'reports' ? (
        <section
          className={styles.scroll}
          id="reports-panel"
          role="tabpanel"
          aria-labelledby="reports-tab"
          aria-label="사전 보고 기록 목록"
          tabIndex={0}
        >
          <table className={styles.table}>
            <caption className={styles.caption}>
              사전 보고 기록 · {reportedMembers.length}명
            </caption>
            <thead>
              <tr>
                {['참가자', '보고 유형', '사유', '제출 시각', '적격성'].map((label) => (
                  <th scope="col" key={label}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportedMembers.map((member) => (
                <ReportRow key={member.membershipId} member={member} />
              ))}
            </tbody>
          </table>
          {attendanceLoading && <output>출석 명단을 불러오는 중입니다.</output>}
          {attendanceError && <span role="alert">출석 명단을 불러오지 못했습니다.</span>}
          {!attendanceLoading && !attendanceError && reportedMembers.length === 0 && (
            <output>사전 보고 기록이 없습니다.</output>
          )}
        </section>
      ) : (
        <section
          className={styles.scroll}
          id="attendance-panel"
          role="tabpanel"
          aria-labelledby="attendance-tab"
          aria-label="회원 출석 목록"
          tabIndex={0}
        >
          <table className={styles.table}>
            <caption className={styles.caption}>출석 체크 · {visibleMembers.length}명</caption>
            <thead>
              <tr>
                {[
                  '참가자',
                  '사전 보고',
                  '앱 출석',
                  '현재 출결 · 점수',
                  '명찰 확인',
                  '변경 이력',
                ].map((label) => (
                  <th scope="col" key={label}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleMembers.map((member) => (
                <MemberRow
                  key={member.membershipId}
                  member={member}
                  disabled={attendancePending || badgePending}
                  onAttendanceChange={(nextMember, status) => {
                    const edits = Array.isArray(status) ? status : [status];
                    const inputs = edits.map((edit) => createAttendanceEdit(nextMember, edit));
                    const [firstInput] = inputs;
                    if (firstInput === undefined) {
                      return;
                    }
                    onAttendanceChange(inputs.length === 1 ? firstInput : inputs);
                  }}
                  onBadgeChange={onBadgeChange}
                  onHistoryOpen={onHistoryOpen}
                />
              ))}
            </tbody>
          </table>
          {attendanceLoading && <output>출석 명단을 불러오는 중입니다.</output>}
          {attendanceError && <span role="alert">출석 명단을 불러오지 못했습니다.</span>}
          {!attendanceLoading && !attendanceError && visibleMembers.length === 0 && (
            <output>해당 직군의 출석 대상자가 없습니다.</output>
          )}
        </section>
      )}
      {historyMember && (
        <section className={styles.historyPanel} aria-label="출결 변경 이력">
          <div className={styles.historyHeader}>
            <h2 className={styles.heading}>{historyMember.name} 출결 변경 이력</h2>
            <ActionButton variant="neutralWeak" size="small" type="button" onClick={onHistoryClose}>
              닫기
            </ActionButton>
          </div>
          <AttendanceQueryBoundary
            fallback={<output>변경 이력을 불러오는 중입니다.</output>}
            errorMessage="변경 이력을 불러오지 못했습니다."
            resetKey={`attendance-history-${sessionId}-${historyMember.membershipId}`}
          >
            <AttendanceHistoryData
              sessionId={sessionId}
              membershipId={historyMember.membershipId}
            />
          </AttendanceQueryBoundary>
        </section>
      )}
    </>
  );
}

function AttendanceHistoryData({
  sessionId,
  membershipId,
}: {
  sessionId: string;
  membershipId: string;
}) {
  const { data: history } = useSuspenseQuery(
    attendanceHistoryQueryOptions(sessionId, membershipId),
  );

  if (history.length === 0) {
    return <output>변경 이력이 없습니다.</output>;
  }

  return (
    <ul className={styles.historyList}>
      {history.map((entry) => (
        <li key={entry.id}>
          <strong>
            {statusLabels[entry.before.status]} → {statusLabels[entry.after.status]}
          </strong>
          <span className={styles.secondary}>
            {formatTime(entry.changedAt)} · {entry.actorName ?? '담당자 미상'}
          </span>
          {entry.reason && <span className={styles.secondary}>사유: {entry.reason}</span>}
        </li>
      ))}
    </ul>
  );
}

function getSessionAction({
  session,
  closePending,
  onClose,
  cancelPending,
  onCancel,
  blockClose,
}: {
  session: AttendanceSessionViewModel;
  closePending: boolean;
  onClose: () => void;
  cancelPending: boolean;
  onCancel: () => void;
  blockClose: boolean;
}) {
  if (session.phase === 'closed' && session.canCancelClose) {
    return (
      <ActionButton
        variant="neutralWeak"
        size="small"
        type="button"
        disabled={cancelPending}
        onClick={onCancel}
      >
        마감 취소
      </ActionButton>
    );
  }
  if (session.phase === 'open') {
    return (
      <ActionButton
        variant="brandSolid"
        size="small"
        type="button"
        disabled={closePending || blockClose}
        onClick={onClose}
      >
        출석 마감
      </ActionButton>
    );
  }
  return null;
}
