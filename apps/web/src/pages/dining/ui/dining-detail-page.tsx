/** 회식 상세의 고정 정보를 표시하며, 응답 입력은 별도 기능으로 연결합니다. */

import IconChevronLeftLine from '@karrotmarket/react-monochrome-icon/IconChevronLeftLine';
import { ActivityLink } from '@/app/navigation/activity-link';
import { koreanDateString } from '@/shared/lib/korean-date-time';
import { Text } from '@yapp-plus/ui';
import { getDiningDeadline, type Dining } from '../model/dining-model';
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

/** 하나의 회식의 제목·일정·조사 기한을 상세 화면에 표시합니다. */
export function DiningDetailPage({ dining, now }: { dining: Dining; now: number }) {
  const deadline = getDiningDeadline(dining.surveyClosesAt, now);

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
