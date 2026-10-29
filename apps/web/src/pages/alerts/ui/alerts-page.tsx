'use client';

import { BackButton } from '@/app/navigation/back-button';
import { IconBellFill } from '@karrotmarket/react-monochrome-icon';
import { vars } from '@seed-design/css/vars';
import { useState } from 'react';
import {
  container,
  emptyContainer,
  emptyText,
  header,
  headerSpacer,
  headerTitle,
  itemDate,
  itemMessage,
  list,
  listItem,
} from './alerts-page.css';

export type AlertItem = {
  id: string;
  message: string;
  date: string;
};

const mockAlerts: AlertItem[] = [
  {
    id: '1',
    message: '내일 세션이 있어요.\n내일 오후 2시, 정기 세션이 열려요. 늦지 않게 와 주세요.',
    date: '10월 1일',
  },
  {
    id: '2',
    message: '세션 장소가 바뀌었어요.\n이번 주 세션은 3층 세미나실에서 진행해요',
    date: '9월 28일',
  },
  {
    id: '3',
    message: '10분 뒤에 출석 체크가 끝나요. 얼른 출석해 주세요.',
    date: '9월 27일',
  },
  {
    id: '4',
    message: '오늘 세션 출석이 아직 확인되지 않았어요.',
    date: '9월 22일',
  },
];

export function AlertsPage() {
  const [alerts] = useState<AlertItem[]>(mockAlerts);

  return (
    <div className={container}>
      <header className={header}>
        <BackButton fallback="/" />
        <h1 className={headerTitle}>알림</h1>
        <div className={headerSpacer} aria-hidden="true" />
      </header>

      {alerts.length === 0 ? (
        <section className={emptyContainer} aria-label="알림 없음">
          <IconBellFill width={48} height={48} color={vars.$color.palette.gray400} />
          <p className={emptyText}>아직 알림이 없어요</p>
        </section>
      ) : (
        <main className={list} aria-label="알림 목록">
          {alerts.map((item) => (
            <article key={item.id} className={listItem}>
              <p className={itemMessage}>{item.message}</p>
              <time className={itemDate}>{item.date}</time>
            </article>
          ))}
        </main>
      )}
    </div>
  );
}
