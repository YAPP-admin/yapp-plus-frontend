/** 회식 참석 응답의 최초 제출·요약·수정 시트를 상세 화면 안에서 전환합니다. */
'use client';

import {
  ActionButton,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetRoot,
  Text,
} from '@yapp-plus/ui';
import { Chip, HStack } from '@seed-design/react';
import { useState } from 'react';
import {
  DiningRound,
  countDiningMembers,
  createDiningDraft,
  diningRoundLabel,
  selectDiningMembers,
  selectDiningRound,
  toDiningAttendance,
  type Dining,
  type DiningAttendance,
  type DiningDraft,
  type DiningMemberFilter,
} from '../model/dining-model';
import {
  answerSummary,
  answerSummaryItem,
  attendanceButton,
  attendanceButtonSelected,
  attendanceButtons,
  attendee,
  attendeeFilter,
  attendeeFilterCount,
  attendeeFilterSelected,
  attendeeFilters,
  attendeeList,
  attendeeMeta,
  attendeeName,
  attendeeProfile,
  attendeeSection,
  avatar,
  divider,
  editButton,
  meBadge,
  noticeBox,
  roundGroup,
  roundLabel,
  sheetBody,
  sheetContent,
  sheetFooter,
  stickyFooter,
  submitButton,
  surveyHeading,
  surveySection,
} from './dining-attendance-section.css';

const ATTENDEE_FILTERS: readonly DiningMemberFilter[] = [
  DiningRound.FIRST,
  DiningRound.SECOND,
  'ABSENT',
];

const ATTENDEE_FILTER_BY_VALUE: Readonly<Record<string, DiningMemberFilter>> = {
  [DiningRound.FIRST]: DiningRound.FIRST,
  [DiningRound.SECOND]: DiningRound.SECOND,
  ABSENT: 'ABSENT',
};

/** 제출한 응답은 상세 화면 상태로만 유지하고, 수정 시트가 닫히면 초안을 폐기합니다. */
export function DiningAttendanceSection({
  dining,
  attendance,
  canRespond,
  currentMemberId,
  onSubmit,
  onEditSubmit,
}: {
  dining: Dining;
  attendance: DiningAttendance | null;
  canRespond: boolean;
  currentMemberId: string;
  onSubmit: (draft: DiningDraft) => void;
  onEditSubmit: (draft: DiningDraft) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [memberFilter, setMemberFilter] = useState<DiningMemberFilter>(DiningRound.FIRST);

  if (attendance === null) {
    return <SurveyForm onSubmit={onSubmit} />;
  }

  const diningWithCurrentAttendance: Dining = {
    ...dining,
    members: dining.members.map((member) =>
      member.id === currentMemberId ? { ...member, attendance } : member,
    ),
  };

  return (
    <>
      <AnsweredSurvey
        attendance={attendance}
        canRespond={canRespond}
        memberFilter={memberFilter}
        dining={diningWithCurrentAttendance}
        currentMemberId={currentMemberId}
        onEdit={() => setIsEditing(true)}
        onMemberFilterChange={setMemberFilter}
      />
      {isEditing ? (
        <EditAttendanceSheet
          attendance={attendance}
          onDismiss={() => setIsEditing(false)}
          onSubmit={onEditSubmit}
        />
      ) : null}
    </>
  );
}

function SurveyForm({ onSubmit }: { onSubmit: (draft: DiningDraft) => void }) {
  const [draft, setDraft] = useState<DiningDraft>(() => createDiningDraft(null));
  const isComplete = toDiningAttendance(draft) !== null;
  return (
    <>
      <section className={surveySection} aria-labelledby="survey-heading">
        <Text as="h2" id="survey-heading" textStyle="t5Bold">
          회식 참여 여부
        </Text>
        <RoundChoices draft={draft} onChange={setDraft} />
        <SurveyNotice>
          1차·2차 모두 사전 조사 인원을 기준으로 예약하고, 정산도 참석한 차수만큼 나눠요.
        </SurveyNotice>
      </section>
      <footer className={stickyFooter}>
        <ActionButton
          className={submitButton}
          variant="brandSolid"
          size="large"
          disabled={!isComplete}
          onClick={() => onSubmit(draft)}
        >
          제출하기
        </ActionButton>
      </footer>
    </>
  );
}

function AnsweredSurvey({
  attendance,
  canRespond,
  memberFilter,
  dining,
  currentMemberId,
  onEdit,
  onMemberFilterChange,
}: {
  attendance: DiningAttendance;
  canRespond: boolean;
  memberFilter: DiningMemberFilter;
  dining: Dining;
  currentMemberId: string;
  onEdit: () => void;
  onMemberFilterChange: (filter: DiningMemberFilter) => void;
}) {
  const count = countDiningMembers(dining.members);
  const attendees = selectDiningMembers(dining.members, memberFilter, currentMemberId);
  return (
    <>
      <section className={surveySection} aria-labelledby="survey-heading">
        <div className={surveyHeading}>
          <Text as="h2" id="survey-heading" textStyle="t5Bold">
            회식 참여 여부
          </Text>
          {canRespond ? (
            <button className={editButton} type="button" onClick={onEdit}>
              수정하기
            </button>
          ) : null}
        </div>
        <div className={answerSummary}>
          {Object.values(DiningRound).map((round) => (
            <div key={round} className={answerSummaryItem}>
              <Text as="span" textStyle="t4Medium" color="fg.neutralSubtle">
                {diningRoundLabel[round]}
              </Text>
              <Text as="strong" textStyle="t5Bold">
                {attendance[round] ? '참석' : '불참'}
              </Text>
            </div>
          ))}
        </div>
        <SurveyNotice>
          {canRespond
            ? '참석 여부가 바뀌면 꼭 수정해 주세요. 당일 변동 시 운영진과 식당이 어려움을 겪을 수 있어요.'
            : '기한이 지났어요. 변경은 운영진에게 문의해 주세요.'}
        </SurveyNotice>
      </section>

      <section className={attendeeSection} aria-label="응답자 명단">
        <Chip.RadioRoot
          value={memberFilter}
          name="dining-member-filter"
          aria-label="참석 차수 필터"
          onValueChange={(value) => {
            const nextFilter = ATTENDEE_FILTER_BY_VALUE[value];
            if (nextFilter) {
              onMemberFilterChange(nextFilter);
            }
          }}
        >
          <ul className={attendeeFilters}>
            {ATTENDEE_FILTERS.map((filter) => (
              <li key={filter}>
                <Chip.RadioItem
                  value={filter}
                  size="medium"
                  variant="outlineWeak"
                  className={[
                    attendeeFilter,
                    memberFilter === filter ? attendeeFilterSelected : '',
                  ].join(' ')}
                >
                  <Chip.Label>
                    {getAttendeeFilterLabel(filter)}{' '}
                    <span className={attendeeFilterCount}>{count[filter]}</span>
                  </Chip.Label>
                </Chip.RadioItem>
              </li>
            ))}
          </ul>
        </Chip.RadioRoot>
        <ul className={attendeeList} aria-label={`${getAttendeeFilterLabel(memberFilter)} 응답자`}>
          {attendees.map((member) => (
            <li key={member.id} className={attendee}>
              <HStack className={attendeeProfile}>
                <span className={avatar} aria-hidden="true">
                  <Text as="span" textStyle="t4Bold">
                    {member.name.at(0)}
                  </Text>
                </span>
                <span>
                  <Text as="strong" textStyle="t4Bold" className={attendeeName}>
                    {member.name}
                  </Text>
                  <HStack className={attendeeMeta}>
                    <Text as="span" textStyle="t3Medium">
                      {member.groupName}
                    </Text>
                    <span className={divider} aria-hidden="true" />
                    <Text as="span" textStyle="t3Medium">
                      {member.position}
                    </Text>
                  </HStack>
                </span>
              </HStack>
              {member.id === currentMemberId ? <span className={meBadge}>나</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function RoundChoices({
  draft,
  onChange,
}: {
  draft: DiningDraft;
  onChange: (draft: DiningDraft) => void;
}) {
  return Object.values(DiningRound).map((round) => (
    <div key={round} className={roundGroup}>
      <div className={roundLabel}>
        <Text as="h3" textStyle="t4Bold">
          {diningRoundLabel[round]}
        </Text>
        <Text as="span" textStyle="t3Medium" color="fg.neutralSubtle">
          {round === DiningRound.FIRST ? '18:30' : '1차 이후'}
        </Text>
      </div>
      <div className={attendanceButtons}>
        {([false, true] as const).map((attending) => (
          <button
            key={String(attending)}
            className={[
              attendanceButton,
              draft[round] === attending ? attendanceButtonSelected : '',
            ].join(' ')}
            type="button"
            aria-pressed={draft[round] === attending}
            onClick={() => onChange(selectDiningRound(draft, round, attending))}
          >
            {attending ? '참석' : '불참'}
          </button>
        ))}
      </div>
    </div>
  ));
}

function SurveyNotice({ children }: { children: string }) {
  return (
    <div className={noticeBox}>
      <Text as="p" textStyle="t3Regular">
        {children}
      </Text>
    </div>
  );
}

function EditAttendanceSheet({
  attendance,
  onDismiss,
  onSubmit,
}: {
  attendance: DiningAttendance;
  onDismiss: () => void;
  onSubmit: (draft: DiningDraft) => void;
}) {
  const [draft, setDraft] = useState(() => createDiningDraft(attendance));
  return (
    <BottomSheetRoot open onOpenChange={(open) => !open && onDismiss()}>
      <BottomSheetContent
        className={sheetContent}
        title="참석 여부 수정"
        description="사전 조사 인원을 기준으로 식당을 예약해요"
        showCloseButton={false}
        showHandle
      >
        <BottomSheetBody className={sheetBody}>
          <RoundChoices draft={draft} onChange={setDraft} />
          <SurveyNotice>
            신중하게 선택해 주세요. 당일 변동 시 운영진과 식당이 어려움을 겪을 수 있어요.
          </SurveyNotice>
        </BottomSheetBody>
        <BottomSheetFooter className={sheetFooter}>
          <ActionButton
            className={submitButton}
            variant="brandSolid"
            size="large"
            onClick={() => onSubmit(draft)}
          >
            수정하기
          </ActionButton>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}

function getAttendeeFilterLabel(filter: DiningMemberFilter) {
  return filter === 'ABSENT' ? '불참' : diningRoundLabel[filter];
}
