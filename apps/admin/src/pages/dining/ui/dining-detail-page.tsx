import { useState } from 'react';
import { Badge } from '@yapp-plus/ui';
import { DINING_ITEMS } from './dining-management-page';
import * as styles from './dining-detail-page.css';

type ResponseStatus = 'ATTENDING' | 'DECLINED' | 'UNANSWERED';
type ResponseFilter = 'ALL' | ResponseStatus;

type MemberResponse = Readonly<{
  name: string;
  generation: string;
  team: string;
  part: string;
  status: ResponseStatus;
  respondedAt: string;
}>;

const TEAM_RESPONSES = [
  ['1팀', 5, 1, 1],
  ['2팀', 4, 2, 1],
  ['3팀', 3, 1, 3],
  ['4팀', 4, 0, 3],
  ['5팀', 2, 2, 3],
  ['6팀', 3, 1, 3],
  ['7팀', 4, 1, 2],
  ['8팀', 2, 2, 3],
  ['운영진', 5, 2, 7],
] as const;

const MEMBER_RESPONSES: readonly MemberResponse[] = [
  {
    name: '갈랑이',
    generation: '33기',
    team: '운영진',
    part: 'Server',
    status: 'ATTENDING',
    respondedAt: '03.14 10:12',
  },
  {
    name: '이쁜',
    generation: '33기',
    team: '1팀',
    part: 'Design',
    status: 'ATTENDING',
    respondedAt: '03.14 11:30',
  },
  {
    name: '박미열',
    generation: '33기',
    team: '1팀',
    part: 'PM',
    status: 'DECLINED',
    respondedAt: '03.15 08:02',
  },
  {
    name: '최록윤',
    generation: '33기',
    team: '2팀',
    part: 'Mobile',
    status: 'ATTENDING',
    respondedAt: '03.15 20:44',
  },
  {
    name: '정스위',
    generation: '33기',
    team: '3팀',
    part: 'Mobile',
    status: 'UNANSWERED',
    respondedAt: '-',
  },
  {
    name: '강리액',
    generation: '33기',
    team: '4팀',
    part: 'Web',
    status: 'ATTENDING',
    respondedAt: '03.16 13:20',
  },
  {
    name: '한노드',
    generation: '33기',
    team: '2팀',
    part: 'Server',
    status: 'DECLINED',
    respondedAt: '03.16 22:05',
  },
  {
    name: '오뷰',
    generation: '33기',
    team: '5팀',
    part: 'Web',
    status: 'UNANSWERED',
    respondedAt: '-',
  },
  {
    name: '서디자',
    generation: '33기',
    team: '5팀',
    part: 'Design',
    status: 'ATTENDING',
    respondedAt: '03.17 08:41',
  },
];

const RESPONSE_FILTERS: readonly { value: ResponseFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'ATTENDING', label: '참석' },
  { value: 'DECLINED', label: '불참' },
  { value: 'UNANSWERED', label: '미응답' },
];

const responseStatusLabels: Record<ResponseStatus, string> = {
  ATTENDING: '참석',
  DECLINED: '불참',
  UNANSWERED: '미응답',
};

export function DiningDetailPage({ diningId }: { diningId: string }) {
  const [responseFilter, setResponseFilter] = useState<ResponseFilter>('ALL');
  const dining = getDiningItem(diningId);
  const filteredMembers =
    responseFilter === 'ALL'
      ? MEMBER_RESPONSES
      : MEMBER_RESPONSES.filter((member) => member.status === responseFilter);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>DINNER</p>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{dining.title}</h1>
            <Badge variant="weak" tone={dining.status === 'OPEN' ? 'positive' : 'neutral'}>
              {dining.status === 'OPEN' ? '진행 중' : '마감'}
            </Badge>
          </div>
          <p className={styles.meta}>
            뒤풀이 {dining.date} · 조사 기한 {dining.deadline} · 대상 70명
          </p>
        </div>
      </header>

      <section className={styles.metricGrid} aria-label="응답 요약">
        <MetricCard label="참석" value="32" percentage="46%" tone="attending" />
        <MetricCard label="불참" value="12" percentage="17%" tone="declined" />
        <MetricCard label="미응답" value="26" percentage="37%" tone="unanswered" />
      </section>

      <section className={styles.responseGrid} aria-label="뒤풀이 응답 현황">
        <section className={styles.section} aria-labelledby="team-response-title">
          <div className={styles.sectionHeader}>
            <h2 id="team-response-title" className={styles.sectionTitle}>
              팀별 응답
            </h2>
          </div>
          <div className={styles.tableRegion}>
            <table className={`${styles.table} ${styles.teamTable}`}>
              <caption className={styles.visuallyHidden}>팀별 응답 현황</caption>
              <thead>
                <tr>
                  <th className={styles.tableHeader} scope="col">
                    팀
                  </th>
                  <th className={styles.tableHeader} scope="col">
                    참석
                  </th>
                  <th className={styles.tableHeader} scope="col">
                    불참
                  </th>
                  <th className={styles.tableHeader} scope="col">
                    미응답
                  </th>
                </tr>
              </thead>
              <tbody>
                {TEAM_RESPONSES.map(([team, attending, declined, unanswered]) => (
                  <tr key={team}>
                    <th className={`${styles.tableCell} ${styles.memberName}`} scope="row">
                      {team}
                    </th>
                    <td className={`${styles.tableCell} ${styles.attending}`}>{attending}</td>
                    <td className={`${styles.tableCell} ${styles.declined}`}>{declined}</td>
                    <td className={`${styles.tableCell} ${styles.unanswered}`}>{unanswered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="member-response-title">
          <div className={styles.sectionHeader}>
            <h2 id="member-response-title" className={styles.sectionTitle}>
              전체 명단<span className={styles.sectionCount}>70</span>
            </h2>
            <nav className={styles.responseFilters} aria-label="응답 상태 필터">
              {RESPONSE_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  className={`${styles.responseFilter} ${responseFilter === value ? styles.responseFilterActive : ''}`}
                  type="button"
                  aria-pressed={responseFilter === value}
                  onClick={() => setResponseFilter(value)}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className={`${styles.tableRegion} ${styles.memberTableRegion}`}>
            <table className={`${styles.table} ${styles.memberTable}`}>
              <caption className={styles.visuallyHidden}>뒤풀이 참석 응답 명단</caption>
              <colgroup>
                <col />
                <col />
                <col />
                <col />
                <col className={styles.responseTimeColumn} />
              </colgroup>
              <thead>
                <tr>
                  <th className={styles.tableHeader} scope="col">
                    이름
                  </th>
                  <th className={styles.tableHeader} scope="col">
                    팀
                  </th>
                  <th className={styles.tableHeader} scope="col">
                    직군
                  </th>
                  <th className={styles.tableHeader} scope="col">
                    응답
                  </th>
                  <th className={styles.tableHeader} scope="col">
                    응답 일시
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.name}>
                    <th className={`${styles.tableCell} ${styles.memberName}`} scope="row">
                      {member.name}
                    </th>
                    <td className={styles.tableCell}>{member.team}</td>
                    <td className={styles.tableCell}>{member.part}</td>
                    <td className={styles.tableCell}>
                      <span
                        className={`${styles.memberStatus} ${getMemberStatusClassName(member.status)}`}
                      >
                        {responseStatusLabels[member.status]}
                      </span>
                    </td>
                    <td className={styles.tableCell}>{member.respondedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMembers.length === 0 ? (
              <p className={styles.emptyState}>응답자가 없습니다.</p>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}

function getDiningItem(diningId: string) {
  const item = DINING_ITEMS.find((candidate) => candidate.id === diningId);
  if (item !== undefined) {
    return item;
  }

  const fallback = DINING_ITEMS[0];
  if (fallback === undefined) {
    throw new Error('뒤풀이 목록이 비어 있습니다.');
  }
  return fallback;
}

function getMemberStatusClassName(status: ResponseStatus) {
  if (status === 'ATTENDING') {
    return styles.attending;
  }
  if (status === 'DECLINED') {
    return styles.declined;
  }
  return styles.unanswered;
}

function MetricCard({
  label,
  value,
  percentage,
  tone,
}: {
  label: string;
  value: string;
  percentage: string;
  tone: 'attending' | 'declined' | 'unanswered';
}) {
  return (
    <article className={styles.metricCard}>
      <span className={`${styles.metricLabel} ${styles[tone]}`}>● {label}</span>
      <div className={styles.metricValueRow}>
        <strong className={`${styles.metricValue} ${styles[tone]}`}>{value}</strong>
        <span className={styles.metricUnit}>명 · {percentage}</span>
      </div>
    </article>
  );
}
