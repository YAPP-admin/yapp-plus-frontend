/** 회식 상세 정보와 응답 화면 수명을 소유하며, 제출 결과는 공용 Snackbar로 알립니다. */
'use client';

import IconChevronLeftLine from '@karrotmarket/react-monochrome-icon/IconChevronLeftLine';
import { ActivityLink } from '@/app/navigation/activity-link';
import { koreanDateString } from '@/shared/lib/korean-date-time';
import { Snackbar, Text, useSnackbarAdapter } from '@yapp-plus/ui';
import { useState } from 'react';
import {
  getDiningDeadline,
  toDiningAttendance,
  type Dining,
  type DiningAttendance,
  type DiningDraft,
} from '../model/dining-model';
import { DiningAttendanceSection } from './dining-attendance-section';
import {
  description,
  detailBackButton,
  detailHeader,
  detailInformation,
  detailPage,
  detailTitle,
  informationRows,
  informationValue,
  page,
} from './dining-page.css';

/** 하나의 회식에 대한 응답·수정 상태는 상세 화면을 떠날 때 함께 폐기됩니다. */
export function DiningDetailPage({
  dining,
  now,
  currentMemberId,
}: {
  dining: Dining;
  now: number;
  currentMemberId: string;
}) {
  const currentMember = dining.members.find(({ id }) => id === currentMemberId);
  const [attendance, setAttendance] = useState<DiningAttendance | null>(
    currentMember?.attendance ?? null,
  );
  const snackbar = useSnackbarAdapter();
  const deadline = getDiningDeadline(dining.surveyClosesAt, now);
  const canRespond = deadline.status === 'open';

  function submitAttendance(draft: DiningDraft, message: string) {
    const nextAttendance = toDiningAttendance(draft);
    if (nextAttendance === null) {
      return;
    }
    setAttendance(nextAttendance);
    snackbar.create({
      render: () => <Snackbar variant="positive" message={message} />,
    });
  }

  return (
    <main className={[page, detailPage].join(' ')}>
      <header className={detailHeader}>
        <ActivityLink
          activityName="DiningList"
          activityParams={{}}
          className={detailBackButton}
          aria-label="뒤로가기"
        >
          <IconChevronLeftLine width={24} height={24} aria-hidden="true" />
        </ActivityLink>
        <Text as="h1" textStyle="t6Bold" className={detailTitle}>
          참석 여부
        </Text>
      </header>

      <section className={detailInformation} aria-labelledby="dining-title">
        <Text as="h2" id="dining-title" textStyle="t8Bold">
          {dining.title}
        </Text>
        <Text as="p" textStyle="t4Regular" className={description}>
          {dining.description}
        </Text>
        <dl className={informationRows}>
          <Text as="dt" textStyle="t3Medium" color="fg.neutralSubtle">
            회식 날짜
          </Text>
          <Text as="dd" textStyle="t3Medium" className={informationValue}>
            {formatDiningDate(dining.startsAt)}
          </Text>
          <Text as="dt" textStyle="t3Medium" color="fg.neutralSubtle">
            조사 기한
          </Text>
          <Text as="dd" textStyle="t3Medium" className={informationValue}>
            {formatDeadline(dining.surveyClosesAt, deadline.status === 'closed')}
          </Text>
        </dl>
      </section>
      <DiningAttendanceSection
        dining={dining}
        attendance={attendance}
        canRespond={canRespond}
        currentMemberId={currentMemberId}
        onSubmit={(draft) => submitAttendance(draft, '참석 여부를 제출했어요.')}
        onEditSubmit={(draft) => submitAttendance(draft, '참석 여부를 수정했어요.')}
      />
    </main>
  );
}

function formatDiningDate(timestamp: number) {
  return `${koreanDateString(timestamp).replaceAll('-', '.')} (${koreanWeekday(timestamp)}) 18:30`;
}

function formatDeadline(timestamp: number, isClosed: boolean) {
  return `${koreanDateString(timestamp).replaceAll('-', '.')} (${koreanWeekday(timestamp)}) 23:59${isClosed ? ' · 마감' : ''}`;
}

function koreanWeekday(timestamp: number) {
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', weekday: 'short' }).format(
    timestamp,
  );
}
