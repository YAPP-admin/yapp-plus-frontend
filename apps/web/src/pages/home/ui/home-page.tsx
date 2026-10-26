'use client';

import { IconChevronRightFill, IconLocationpinFill } from '@karrotmarket/react-monochrome-icon';
import { ActionButton } from '@yapp-plus/ui';
import Image from 'next/image';
import Link from 'next/link';
import {
  attendanceButton,
  calendarDateBadge,
  calendarDateBadgeActive,
  calendarDayItem,
  calendarDayLabel,
  calendarWeek,
  cardsSection,
  chipBlue,
  chipGray,
  chipRow,
  container,
  content,
  devRoutesLink,
  locationPin,
  locationRow,
  locationText,
  noticeCard,
  noticeChevron,
  noticeContent,
  noticesHeader,
  noticesList,
  noticesSection,
  noticesSectionTitle,
  noticeTitle,
  quickCard,
  quickCardGraphic,
  quickCardsGrid,
  quickCardSubtitle,
  quickCardTitle,
  sessionCard,
  sessionHeader,
  sessionTitle,
  srOnly,
} from './home-page.css';

const weekSchedule = [
  { day: '일', date: 1, isToday: false },
  { day: '월', date: 2, isToday: false },
  { day: '화', date: 3, isToday: false },
  { day: '수', date: 4, isToday: false },
  { day: '목', date: 5, isToday: false },
  { day: '금', date: 6, isToday: false },
  { day: '토', date: 7, isToday: true },
];

const weeklyNotices = [
  {
    id: 1,
    tag: '세션',
    isSession: true,
    title: '5주차 개발-디자인 세션 공지',
    href: '/notices',
  },
  {
    id: 2,
    tag: '기타',
    isSession: false,
    title: '뒷풀이 참석 여부 수요 조사',
    href: '/notices',
  },
  {
    id: 3,
    tag: '기타',
    isSession: false,
    title: '운영진 공지 사항',
    href: '/notices',
  },
];

export function HomePage() {
  return (
    <main className={container}>
      <h1 className={srOnly}>홈</h1>

      <div className={content}>
        <section className={cardsSection} aria-label="세션 및 바로가기">
          <div className={sessionCard}>
            <div className={sessionHeader}>
              <div className={locationRow}>
                <span className={locationPin} aria-hidden="true">
                  <IconLocationpinFill width={14} height={14} />
                </span>
                <span className={locationText}>DMC 첨단산업센터</span>
              </div>
              <h2 className={sessionTitle}>이번 주는 유저 플로우 리뷰 세션이에요</h2>
            </div>

            <div className={calendarWeek} aria-label="주간 일정">
              {weekSchedule.map((item) => (
                <div key={item.day} className={calendarDayItem}>
                  <span className={calendarDayLabel}>{item.day}</span>
                  <span className={item.isToday ? calendarDateBadgeActive : calendarDateBadge}>
                    {item.date}
                  </span>
                </div>
              ))}
            </div>

            <ActionButton asChild variant="neutralSolid" size="medium" className={attendanceButton}>
              <Link href="/my/attendance">출석하기</Link>
            </ActionButton>
          </div>

          <nav className={quickCardsGrid} aria-label="홈 바로가기">
            <Link href="/schedule" className={quickCard} aria-label="이번 달 세션 전체보기">
              <p className={quickCardTitle}>전체 세션</p>
              <p className={quickCardSubtitle}>확인하기</p>
              <Image
                src="/images/home/graphic-spot-session.svg"
                alt=""
                width={110}
                height={78}
                className={quickCardGraphic}
              />
            </Link>

            <Link href="/my/attendance" className={quickCard} aria-label="최근 출석 전체보기">
              <p className={quickCardTitle}>출결 보고</p>
              <p className={quickCardSubtitle}>미리하기</p>
              <Image
                src="/images/home/graphic-spot-attendance.svg"
                alt=""
                width={110}
                height={78}
                className={quickCardGraphic}
              />
            </Link>
          </nav>
        </section>

        <section className={noticesSection} aria-label="이번 주 공지">
          <div className={noticesHeader}>
            <h2 className={noticesSectionTitle}>이번 주 공지</h2>
          </div>

          <div className={noticesList}>
            {weeklyNotices.map((notice) => (
              <Link
                key={notice.id}
                href={notice.href}
                className={noticeCard}
                aria-label={notice.title}
              >
                <div className={noticeContent}>
                  <div className={chipRow}>
                    <span className={notice.isSession ? chipBlue : chipGray}>{notice.tag}</span>
                  </div>
                  <p className={noticeTitle}>{notice.title}</p>
                </div>
                <span className={noticeChevron} aria-hidden="true">
                  <IconChevronRightFill width={20} height={20} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {process.env.NODE_ENV === 'development' && (
          <Link href="/dev/routes" className={devRoutesLink}>
            개발용 화면 목록
          </Link>
        )}
      </div>
    </main>
  );
}
