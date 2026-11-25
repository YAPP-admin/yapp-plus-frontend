import { useState } from 'react';
import { Badge } from '@yapp-plus/ui';
import {
  description,
  eyebrow,
  emptyState,
  filter,
  filterActive,
  filterCountLabel,
  filterGroup,
  heading,
  page,
  progress,
  progressGroup,
  responseRate,
  table,
  tableCell,
  tableHeader,
  tableRegion,
  title,
  titleCell,
  visuallyHidden,
} from './dining-management-page.css';

export type DiningStatus = 'OPEN' | 'CLOSED';
type DiningFilter = 'OPEN' | 'CLOSED';

export type DiningItem = Readonly<{
  id: string;
  title: string;
  date: string;
  dateTime: string;
  deadline: string;
  deadlineDateTime: string;
  inviteScope: string;
  responseRate: number;
  attendeeCount: number;
  status: DiningStatus;
}>;

export const DINING_ITEMS: readonly DiningItem[] = [
  {
    id: 'ot-afterparty',
    title: '33기 OT 뒤풀이',
    date: '03.21 (토) 18:30',
    dateTime: '2026-03-21T18:30:00+09:00',
    deadline: '03.20 (금) 23:59',
    deadlineDateTime: '2026-03-20T23:59:00+09:00',
    inviteScope: '33기 운영진 · 활동회원',
    responseRate: 63,
    attendeeCount: 32,
    status: 'OPEN',
  },
  {
    id: 'staff-afterparty',
    title: '운영진 MT 뒤풀이',
    date: '04.04 (토) 19:00',
    dateTime: '2026-04-04T19:00:00+09:00',
    deadline: '04.01 (수) 23:59',
    deadlineDateTime: '2026-04-01T23:59:00+09:00',
    inviteScope: '33기 운영진',
    responseRate: 43,
    attendeeCount: 5,
    status: 'OPEN',
  },
  {
    id: 'april-afterparty',
    title: '4월 정기 뒤풀이',
    date: '04.25 (토) 18:30',
    dateTime: '2026-04-25T18:30:00+09:00',
    deadline: '04.22 (수) 23:59',
    deadlineDateTime: '2026-04-22T23:59:00+09:00',
    inviteScope: '33기 활동회원',
    responseRate: 12,
    attendeeCount: 7,
    status: 'OPEN',
  },
  {
    id: 'march-afterparty',
    title: '3월 정기 뒤풀이',
    date: '03.28 (토) 18:30',
    dateTime: '2026-03-28T18:30:00+09:00',
    deadline: '03.25 (수) 23:59',
    deadlineDateTime: '2026-03-25T23:59:00+09:00',
    inviteScope: '33기 활동회원',
    responseRate: 100,
    attendeeCount: 41,
    status: 'CLOSED',
  },
  {
    id: 'team-afterparty',
    title: '팀별 뒤풀이',
    date: '03.14 (토) 18:30',
    dateTime: '2026-03-14T18:30:00+09:00',
    deadline: '03.11 (수) 23:59',
    deadlineDateTime: '2026-03-11T23:59:00+09:00',
    inviteScope: '33기 활동회원',
    responseRate: 88,
    attendeeCount: 35,
    status: 'CLOSED',
  },
  {
    id: 'winter-afterparty',
    title: '겨울 정기 뒤풀이',
    date: '02.28 (토) 18:30',
    dateTime: '2026-02-28T18:30:00+09:00',
    deadline: '02.25 (수) 23:59',
    deadlineDateTime: '2026-02-25T23:59:00+09:00',
    inviteScope: '33기 활동회원',
    responseRate: 76,
    attendeeCount: 29,
    status: 'CLOSED',
  },
  {
    id: 'new-year-afterparty',
    title: '새해 맞이 뒤풀이',
    date: '02.07 (토) 18:30',
    dateTime: '2026-02-07T18:30:00+09:00',
    deadline: '02.04 (수) 23:59',
    deadlineDateTime: '2026-02-04T23:59:00+09:00',
    inviteScope: '33기 운영진 · 활동회원',
    responseRate: 91,
    attendeeCount: 38,
    status: 'CLOSED',
  },
  {
    id: 'graduation-afterparty',
    title: '32기 수료 뒤풀이',
    date: '01.24 (토) 18:30',
    dateTime: '2026-01-24T18:30:00+09:00',
    deadline: '01.21 (수) 23:59',
    deadlineDateTime: '2026-01-21T23:59:00+09:00',
    inviteScope: '32기 활동회원',
    responseRate: 95,
    attendeeCount: 44,
    status: 'CLOSED',
  },
  {
    id: 'welcome-afterparty',
    title: '32기 OT 뒤풀이',
    date: '01.10 (토) 18:30',
    dateTime: '2026-01-10T18:30:00+09:00',
    deadline: '01.07 (수) 23:59',
    deadlineDateTime: '2026-01-07T23:59:00+09:00',
    inviteScope: '32기 운영진 · 활동회원',
    responseRate: 84,
    attendeeCount: 37,
    status: 'CLOSED',
  },
];

const FILTERS: readonly { value: DiningFilter; label: string }[] = [
  { value: 'OPEN', label: '진행 중' },
  { value: 'CLOSED', label: '마감' },
];

export function DiningManagementPage() {
  const [filterValue, setFilterValue] = useState<DiningFilter>('OPEN');
  const filteredItems = DINING_ITEMS.filter(({ status }) => status === filterValue);

  return (
    <main className={page}>
      <header className={heading}>
        <div>
          <p className={eyebrow}>DINNER</p>
          <h1 className={title}>뒤풀이 관리</h1>
          <p className={description}>뒤풀이 참여 여부 조사를 만들고 응답 현황을 확인해요.</p>
        </div>
      </header>

      <nav className={filterGroup} aria-label="뒤풀이 상태 필터">
        {FILTERS.map(({ value, label }) => {
          const isActive = filterValue === value;
          const itemCount = DINING_ITEMS.filter(({ status }) => status === value).length;
          return (
            <button
              key={value}
              className={[filter, isActive ? filterActive : ''].join(' ')}
              type="button"
              aria-pressed={isActive}
              onClick={() => setFilterValue(value)}
            >
              {label}
              <span className={filterCountLabel}>{itemCount}</span>
            </button>
          );
        })}
      </nav>

      <div className={tableRegion}>
        <table className={table}>
          <caption className={visuallyHidden}>뒤풀이 목록</caption>
          <colgroup>
            <col className={titleCell} />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th className={tableHeader} scope="col">
                제목
              </th>
              <th className={tableHeader} scope="col">
                뒤풀이 날짜
              </th>
              <th className={tableHeader} scope="col">
                조사 기한
              </th>
              <th className={tableHeader} scope="col">
                초대 범위
              </th>
              <th className={tableHeader} scope="col">
                응답률
              </th>
              <th className={tableHeader} scope="col">
                참석
              </th>
              <th className={tableHeader} scope="col">
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <DiningRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 ? (
          <p className={emptyState}>등록된 뒤풀이가 없습니다.</p>
        ) : null}
      </div>
    </main>
  );
}

function DiningRow({ item }: { item: DiningItem }) {
  return (
    <tr>
      <th className={`${tableCell} ${titleCell}`} scope="row">
        {item.title}
      </th>
      <td className={tableCell}>
        <time dateTime={item.dateTime}>{item.date}</time>
      </td>
      <td className={tableCell}>
        <time dateTime={item.deadlineDateTime}>{item.deadline}</time>
      </td>
      <td className={tableCell}>{item.inviteScope}</td>
      <td className={tableCell}>
        <div className={progressGroup}>
          <progress
            className={progress}
            max={100}
            value={item.responseRate}
            aria-label={`${item.title} 응답률`}
          />
          <span className={responseRate}>{item.responseRate}%</span>
        </div>
      </td>
      <td className={tableCell}>{item.attendeeCount}</td>
      <td className={tableCell}>
        <Badge variant="weak" tone={item.status === 'OPEN' ? 'positive' : 'neutral'}>
          {item.status === 'OPEN' ? '진행 중' : '마감'}
        </Badge>
      </td>
    </tr>
  );
}
