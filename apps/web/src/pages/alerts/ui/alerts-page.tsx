'use client';

import { HStack, VStack } from '@seed-design/react';
import { BackButton } from '@/app/navigation/back-button';
import { Image } from '@/app/navigation/image';
import { useState } from 'react';
import {
  body,
  container,
  emptyContainer,
  emptyGraphic,
  emptyText,
  header,
  headerSpacer,
  headerTitle,
  itemDate,
  itemMessage,
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
    date: '9월 30일',
  },
  {
    id: '3',
    message: '새 공지가 올라왔어요. 게시판을 확인해 주세요.',
    date: '9월 30일',
  },
  {
    id: '4',
    message: '새 공지가 올라왔어요. 게시판을 확인해 주세요.',
    date: '9월 28일',
  },
  {
    id: '5',
    message: '10분 뒤에 출석 체크가 끝나요. 얼른 출석해 주세요.',
    date: '9월 27일',
  },
  {
    id: '6',
    message: '오늘 세션 출석이 아직 확인되지 않았어요.',
    date: '9월 22일',
  },
];

export function AlertsPage({ showEmpty = false }: { showEmpty?: boolean }) {
  const [alerts] = useState<AlertItem[]>(showEmpty ? [] : mockAlerts);

  return (
    <VStack className={container}>
      <HStack as="header" align="center" justify="space-between" className={header}>
        <BackButton
          fallbackActivityName="Tabs"
          fallbackActivityParams={{ initialTab: 'home' }}
          iconOnly
        />
        <h1 className={headerTitle}>알림</h1>
        <div className={headerSpacer} aria-hidden="true" />
      </HStack>

      <VStack className={body}>
        {alerts.length === 0 ? (
          <VStack
            as="section"
            align="center"
            justify="center"
            gap="x5"
            className={emptyContainer}
            aria-label="알림 없음"
          >
            <Image
              src="/images/notices/graphic-none.svg"
              alt=""
              width={90}
              height={74}
              className={emptyGraphic}
            />
            <p className={emptyText}>아직 알림이 없어요</p>
          </VStack>
        ) : (
          <VStack as="main" width="full" aria-label="알림 목록">
            {alerts.map((item) => (
              <VStack as="article" key={item.id} gap="x2" className={listItem}>
                <p className={itemMessage}>{item.message}</p>
                <time className={itemDate}>{item.date}</time>
              </VStack>
            ))}
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
