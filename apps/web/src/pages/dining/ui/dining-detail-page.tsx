/** 서버에서 조회한 회식 정보와 본인 응답을 표시합니다. */
'use client';

import { BackButton } from '@/app/navigation/back-button';
import { koreanDateString } from '@/shared/lib/korean-date-time';
import { Text } from '@yapp-plus/ui';
import type { ReactNode } from 'react';
import { getDiningDeadline, type Dining } from '../model/dining-model';
import { useDiningDetail } from '../model/dining-query';
import { DiningQueryBoundary } from './dining-query-boundary';
import {
  description,
  detailHeader,
  detailInformation,
  detailPage,
  detailTitle,
  informationRows,
  informationValue,
  page,
} from './dining-page.css';

/** 회식 상세는 실제 서버 응답을 표시합니다. 차수별 응답·명단은 계약 확정 전 표시하지 않습니다. */
export function DiningDetailPage({ diningId }: { diningId: string }) {
  return (
    <DiningQueryBoundary diningId={diningId}>
      <DiningDetailContent diningId={diningId} />
    </DiningQueryBoundary>
  );
}

function DiningDetailContent({ diningId }: { diningId: string }) {
  const query = useDiningDetail(diningId);
  const dining = query.data;
  return (
    <DiningPageFrame
      dining={{
        title: dining.title,
        description: dining.content,
        startsAt: Date.parse(dining.startsAt),
        surveyClosesAt: Date.parse(dining.deadline),
      }}
      now={query.dataUpdatedAt}
    >
      <section aria-label="참석 응답">
        <Text as="h2" textStyle="t5Bold">
          뒤풀이 참여 여부
        </Text>
        <Text as="p" textStyle="t4Regular">
          {{ UNANSWERED: '미응답', ATTENDING: '참석', NOT_ATTENDING: '불참' }[dining.response]}
        </Text>
        {dining.attendingCount !== null && (
          <Text as="p" textStyle="t4Regular">
            참석 {dining.attendingCount}명
          </Text>
        )}
        {dining.state === 'OPEN' && (
          <Text as="p" textStyle="t4Regular">
            참석 여부 변경은 준비 중이에요.
          </Text>
        )}
        {dining.state !== 'OPEN' && (
          <Text as="p" textStyle="t4Regular">
            기한이 지났어요. 변경은 운영진에게 문의해 주세요.
          </Text>
        )}
      </section>
    </DiningPageFrame>
  );
}

/** 회식 상세의 정보·뒤로가기 레이아웃입니다. */
function DiningPageFrame({
  dining,
  now,
  children,
}: {
  dining: Pick<Dining, 'title' | 'description' | 'startsAt' | 'surveyClosesAt'>;
  now: number;
  children: ReactNode;
}) {
  const deadline = getDiningDeadline(dining.surveyClosesAt, now);
  return (
    <main className={[page, detailPage].join(' ')}>
      <header className={detailHeader}>
        <BackButton
          fallbackActivityName="Tabs"
          fallbackActivityParams={{ initialTab: 'community' }}
          iconOnly
        />
        <Text as="h1" textStyle="t6Bold" className={detailTitle}>
          뒤풀이
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
            뒤풀이 날짜
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
      {children}
    </main>
  );
}

function formatDiningDate(timestamp: number) {
  return `${koreanDateString(timestamp).replaceAll('-', '.')} (${koreanWeekday(timestamp)}) ${koreanTime(timestamp)}`;
}

function formatDeadline(timestamp: number, isClosed: boolean) {
  return `${koreanDateString(timestamp).replaceAll('-', '.')} (${koreanWeekday(timestamp)}) ${koreanTime(timestamp)}${isClosed ? ' · 마감' : ''}`;
}

function koreanWeekday(timestamp: number) {
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', weekday: 'short' }).format(
    timestamp,
  );
}

function koreanTime(timestamp: number) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(timestamp);
}
