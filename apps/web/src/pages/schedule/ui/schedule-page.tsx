'use client';

import { container, content, list, srOnly } from './schedule-page.css';
import { ScheduleEmpty } from './schedule-empty';
import { ScheduleItem, type ScheduleItemProps } from './schedule-item';

export type Schedule = ScheduleItemProps & {
  id: string;
};

export const DEFAULT_SCHEDULES: Schedule[] = [
  {
    id: 'session-1',
    date: '9.12 (토)',
    title: '팀 세션',
    location: '디캠프 선릉 6층 이벤트홀',
    time: '오후 1시 ~ 오후 6시',
    isPast: true,
  },
  {
    id: 'session-2',
    date: '9.19 (토)',
    title: '기획 세션',
    location: 'ICT콤플렉스 6층 커뮤니티라운지',
    time: '오후 12시 ~ 오후 6시',
    chipText: '정규 세션',
    isPast: false,
  },
  {
    id: 'session-3',
    date: '9.26 (토)',
    title: '팀 세션',
    location: '-',
    time: '오후 1시 ~ 오후 6시',
    isPast: false,
  },
  {
    id: 'session-4',
    date: '10.3 (토)',
    title: '팀 세션',
    location: '-',
    time: '오후 1시 ~ 오후 6시',
    isPast: false,
  },
  {
    id: 'session-5',
    date: '10.10 (토)',
    title: '1차 UT 세션',
    location: 'DMC 첨단산업센터 7층 세미나포럼장',
    time: '오후 1시 ~ 오후 5시',
    chipText: '정규 세션',
    isPast: false,
  },
  {
    id: 'session-6',
    date: '10.19 (토)',
    title: '팀 세션',
    location: '-',
    time: '오후 1시 ~ 오후 6시',
    isPast: false,
  },
];

export type SchedulePageProps = {
  schedules?: Schedule[];
};

export function SchedulePage({ schedules = DEFAULT_SCHEDULES }: SchedulePageProps) {
  const hasSchedules = schedules.length > 0;

  return (
    <main className={container}>
      <h1 className={srOnly}>일정</h1>

      <div className={content}>
        {hasSchedules ? (
          <ul className={list} aria-label="세션 일정 목록">
            {schedules.map((schedule) => (
              <li key={schedule.id}>
                <ScheduleItem {...schedule} />
              </li>
            ))}
          </ul>
        ) : (
          <ScheduleEmpty />
        )}
      </div>
    </main>
  );
}
