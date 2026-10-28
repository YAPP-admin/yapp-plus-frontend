'use client';

import { BackButton } from '@/app/navigation/back-button';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  absentChip,
  attendedChip,
  body,
  cardHeader,
  cardStats,
  cardTitle,
  container,
  emptyContainer,
  emptyText,
  header,
  headerSpacer,
  headerTitle,
  lateChip,
  listContainer,
  listSection,
  progressGroup,
  progressLabel,
  progressValue,
  sectionTitle,
  sessionItem,
  sessionName,
  statItem,
  statLabel,
  statValue,
  statusCard,
  topCardSection,
  warningBanner,
  warningText,
} from './attendance-page.css';

export type AttendanceStatus = 'attended' | 'late' | 'absent';

export type AttendanceRecord = {
  id: string;
  name: string;
  status: AttendanceStatus;
};

const DEFAULT_SESSIONS: AttendanceRecord[] = [
  { id: '1', name: '개발-디자인 세션', status: 'absent' },
  { id: '2', name: '팀세션', status: 'late' },
  { id: '3', name: '기획 세션', status: 'late' },
  { id: '4', name: '친바라 세션', status: 'absent' },
  { id: '5', name: '팀빌딩', status: 'attended' },
  { id: '6', name: 'OT', status: 'attended' },
];

const WARNING_SESSIONS: AttendanceRecord[] = [
  { id: '1', name: '개발-디자인 세션', status: 'absent' },
  { id: '2', name: '팀세션', status: 'absent' },
  { id: '3', name: '기획 세션', status: 'absent' },
  { id: '4', name: '친바라 세션', status: 'absent' },
  { id: '5', name: '팀빌딩', status: 'absent' },
  { id: '6', name: 'OT', status: 'attended' },
];

export type AttendancePageProps = {
  initialMode?: 'none' | 'active' | 'warning';
  records?: AttendanceRecord[];
};

function parseMode(value: string | null): 'none' | 'active' | 'warning' | null {
  if (value === 'none' || value === 'active' || value === 'warning') {
    return value;
  }
  return null;
}

function getStatusChip(status: AttendanceStatus) {
  switch (status) {
    case 'attended':
      return <span className={attendedChip}>출석</span>;
    case 'late':
      return <span className={lateChip}>지각</span>;
    case 'absent':
    default:
      return <span className={absentChip}>결석</span>;
  }
}

export function AttendancePage({ initialMode, records }: AttendancePageProps) {
  const searchParams = useSearchParams();
  const queryMode = parseMode(searchParams?.get('mode') ?? null);
  const effectiveMode = initialMode ?? queryMode ?? 'active';

  let currentRecords: AttendanceRecord[];
  if (records) {
    currentRecords = records;
  } else if (effectiveMode === 'none') {
    currentRecords = [];
  } else if (effectiveMode === 'warning') {
    currentRecords = WARNING_SESSIONS;
  } else {
    currentRecords = DEFAULT_SESSIONS;
  }

  const absentCount = currentRecords.filter((r) => r.status === 'absent').length;
  const showWarning = effectiveMode === 'warning' || absentCount >= 5;

  const totalSessions = 12;
  const isNone = currentRecords.length === 0;
  const progressPercent = isNone ? '0%' : '50%';
  const remainingSessions = isNone ? '12회' : '5회';

  return (
    <div className={container}>
      <header className={header}>
        <BackButton fallback="/my" iconOnly />
        <h1 className={headerTitle}>출석 내역</h1>
        <div className={headerSpacer} aria-hidden="true" />
      </header>

      <main className={body}>
        <section className={topCardSection} aria-label="세션 현황 요약">
          <div className={statusCard}>
            <div className={cardHeader}>
              <span className={cardTitle}>세션 현황</span>
              <div className={progressGroup}>
                <span className={progressLabel}>진행률</span>
                <span className={progressValue}>{progressPercent}</span>
              </div>
            </div>

            <div className={cardStats}>
              <div className={statItem}>
                <span className={statLabel}>총 세션</span>
                <span className={statValue}>{totalSessions}회</span>
              </div>
              <div className={statItem}>
                <span className={statLabel}>남은 세션</span>
                <span className={statValue}>{remainingSessions}</span>
              </div>
            </div>
          </div>

          {showWarning && (
            <div className={warningBanner} role="alert">
              <Image src="/images/my/info.svg" alt="" width={18} height={18} priority />
              <p className={warningText}>10번 이상 결석하면 재적처리 될 수 있어요. </p>
            </div>
          )}
        </section>

        <section className={listSection} aria-label="세션 출석 내역">
          <h2 className={sectionTitle}>세션 출석 내역</h2>

          {isNone ? (
            <div className={emptyContainer}>
              <Image src="/images/my/attendance-empty.svg" alt="" width={90} height={74} priority />
              <p className={emptyText}>아직 출석 내역이 없어요</p>
            </div>
          ) : (
            <div className={listContainer}>
              {currentRecords.map((record) => (
                <div key={record.id} className={sessionItem}>
                  <span className={sessionName}>{record.name}</span>
                  {getStatusChip(record.status)}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
