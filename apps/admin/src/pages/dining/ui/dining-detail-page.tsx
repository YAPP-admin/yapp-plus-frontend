import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ActionButton, Badge } from '@yapp-plus/ui';
import {
  afterpartyStatusLabel,
  afterpartyStatusTone,
  asCount,
  asDisplayValue,
  getAfterpartyApiErrorMessage,
  groupLabel,
  positionLabel,
  useDiningDetailQueries,
} from '../model/dining-api';
import { diningResponseFilterLabels, type DiningResponseFilter } from '../model/dining-search';
import * as styles from './dining-detail-page.css';

const RESPONSE_FILTERS: readonly DiningResponseFilter[] = [
  'ALL',
  'ATTENDING',
  'NOT_ATTENDING',
  'UNANSWERED',
];

export function DiningDetailPage({
  diningId,
  responseFilter,
  onResponseFilterChange,
}: {
  diningId: string;
  responseFilter: DiningResponseFilter;
  onResponseFilterChange: (filter: DiningResponseFilter) => void;
}) {
  const afterpartyId = Number(diningId);

  if (!Number.isInteger(afterpartyId) || afterpartyId <= 0) {
    return <DetailError message="뒤풀이 정보를 찾을 수 없어요." />;
  }

  return (
    <DiningDetailContent
      afterpartyId={afterpartyId}
      responseFilter={responseFilter}
      onResponseFilterChange={onResponseFilterChange}
    />
  );
}

function DiningDetailContent({
  afterpartyId,
  responseFilter,
  onResponseFilterChange,
}: {
  afterpartyId: number;
  responseFilter: DiningResponseFilter;
  onResponseFilterChange: (filter: DiningResponseFilter) => void;
}) {
  const { detail, groups, recipients } = useDiningDetailQueries(afterpartyId, responseFilter);

  if (detail.isPending) {
    return <p className={styles.loading}>뒤풀이 정보를 불러오는 중입니다.</p>;
  }
  if (detail.error || detail.data === undefined) {
    return (
      <DetailError
        message={getAfterpartyApiErrorMessage(detail.error, 'detail')}
        onRetry={() => void detail.refetch()}
        loading={detail.isFetching}
      />
    );
  }

  const summary = detail.data.counts;
  const totalCount = summary?.totalCount;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>DINNER</p>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{asDisplayValue(detail.data.title)}</h1>
            <Badge variant="weak" tone={afterpartyStatusTone(detail.data.state)}>
              {afterpartyStatusLabel(detail.data.state)}
            </Badge>
          </div>
          <p className={styles.meta}>
            뒤풀이 {asDisplayValue(detail.data.startsAtDisplay)} · 조사 기한{' '}
            {asDisplayValue(detail.data.deadlineDisplay)} · 대상 {asCount(totalCount)}명
          </p>
        </div>
      </header>

      <section className={styles.metricGrid} aria-label="응답 요약">
        <MetricCard
          label="참석"
          value={asCount(summary?.attendingCount)}
          percentage={percentage(summary?.attendingCount, totalCount)}
          tone="attending"
        />
        <MetricCard
          label="불참"
          value={asCount(summary?.notAttendingCount)}
          percentage={percentage(summary?.notAttendingCount, totalCount)}
          tone="declined"
        />
        <MetricCard
          label="미응답"
          value={asCount(summary?.unansweredCount)}
          percentage={percentage(summary?.unansweredCount, totalCount)}
          tone="unanswered"
        />
      </section>

      <section className={styles.responseGrid} aria-label="뒤풀이 응답 현황">
        <section className={styles.section} aria-labelledby="team-response-title">
          <div className={styles.sectionHeader}>
            <h2 id="team-response-title" className={styles.sectionTitle}>
              팀별 응답
            </h2>
          </div>
          {renderGroupsContent(groups)}
        </section>

        <RecipientsSection
          responseFilter={responseFilter}
          totalCount={totalCount}
          query={recipients}
          onResponseFilterChange={onResponseFilterChange}
        />
      </section>
    </main>
  );
}

function RecipientsSection({
  responseFilter,
  totalCount,
  query,
  onResponseFilterChange,
}: {
  responseFilter: DiningResponseFilter;
  totalCount: number | undefined;
  query: ReturnType<typeof useDiningDetailQueries>['recipients'];
  onResponseFilterChange: (filter: DiningResponseFilter) => void;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const canFetchNextPage = hasNextPage && !isFetchingNextPage;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !canFetchNextPage) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void fetchNextPage();
        }
      },
      { rootMargin: '320px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canFetchNextPage, fetchNextPage]);

  let content: ReactNode;
  if (query.isPending) {
    content = <p className={styles.loading}>전체 명단을 불러오는 중입니다.</p>;
  } else if (query.error && query.items.length === 0) {
    content = (
      <SectionError
        message={getAfterpartyApiErrorMessage(query.error, 'recipients')}
        onRetry={() => void query.refetch()}
        loading={query.isFetching}
      />
    );
  } else {
    content = (
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
            {query.items.map((member, index) => (
              <RecipientRow
                key={member.recipientId ?? `${member.userId ?? 'unknown'}-${index}`}
                member={member}
              />
            ))}
          </tbody>
        </table>
        {query.items.length === 0 ? <p className={styles.emptyState}>응답자가 없습니다.</p> : null}
        {query.error && query.items.length > 0 ? (
          <SectionError
            message={getAfterpartyApiErrorMessage(query.error, 'recipients')}
            onRetry={() => void query.fetchNextPage()}
            loading={query.isFetching}
          />
        ) : null}
        <div ref={sentinelRef} aria-hidden="true" />
        {query.isFetchingNextPage ? (
          <p className={styles.loading}>다음 명단을 불러오는 중입니다.</p>
        ) : null}
      </div>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="member-response-title">
      <div className={styles.sectionHeader}>
        <h2 id="member-response-title" className={styles.sectionTitle}>
          전체 명단<span className={styles.sectionCount}>{asCount(totalCount)}</span>
        </h2>
        <nav className={styles.responseFilters} aria-label="응답 상태 필터">
          {RESPONSE_FILTERS.map((filter) => (
            <button
              key={filter}
              className={`${styles.responseFilter} ${responseFilter === filter ? styles.responseFilterActive : ''}`}
              type="button"
              aria-pressed={responseFilter === filter}
              onClick={() => onResponseFilterChange(filter)}
            >
              {diningResponseFilterLabels[filter]}
            </button>
          ))}
        </nav>
      </div>
      {content}
    </section>
  );
}

function RecipientRow({
  member,
}: {
  member: {
    name?: string;
    teamName: string | null;
    position:
      | 'PM'
      | 'DESIGN'
      | 'ANDROID'
      | 'IOS'
      | 'WEB'
      | 'MOBILE'
      | 'SERVER'
      | 'AI_NATIVE'
      | null;
    response?: 'UNANSWERED' | 'ATTENDING' | 'NOT_ATTENDING';
    respondedAtDisplay: string | null;
  };
}) {
  const response = member.response;
  const responseLabel = responseLabelFor(response);
  const statusClass = responseClassName(response);

  return (
    <tr>
      <th className={`${styles.tableCell} ${styles.memberName}`} scope="row">
        {asDisplayValue(member.name)}
      </th>
      <td className={styles.tableCell}>{teamLabel(member.teamName)}</td>
      <td className={styles.tableCell}>{positionLabel(member.position)}</td>
      <td className={styles.tableCell}>
        <span className={`${styles.memberStatus} ${statusClass}`}>{responseLabel}</span>
      </td>
      <td className={styles.tableCell}>{asDisplayValue(member.respondedAtDisplay)}</td>
    </tr>
  );
}

function DetailError({
  message,
  onRetry,
  loading = false,
}: {
  message: string;
  onRetry?: () => void;
  loading?: boolean;
}) {
  return (
    <main className={styles.page}>
      <div className={styles.error} role="alert">
        <p>{message}</p>
        {onRetry ? (
          <ActionButton type="button" variant="neutralWeak" loading={loading} onClick={onRetry}>
            다시 시도
          </ActionButton>
        ) : null}
        <ActionButton asChild type="button" variant="neutralWeak">
          <Link to="/dining" search={{ period: 'UPCOMING' }}>
            목록으로 돌아가기
          </Link>
        </ActionButton>
      </div>
    </main>
  );
}

function SectionError({
  message,
  onRetry,
  loading,
}: {
  message: string;
  onRetry: () => void;
  loading: boolean;
}) {
  return (
    <div className={styles.error} role="alert">
      <span>{message}</span>
      <ActionButton type="button" variant="neutralWeak" loading={loading} onClick={onRetry}>
        다시 시도
      </ActionButton>
    </div>
  );
}

function percentage(count: number | undefined, total: number | undefined) {
  if (count == null || total == null) {
    return '-';
  }
  if (total === 0) {
    return '0%';
  }
  return `${Math.round((count / total) * 100)}%`;
}

function responseLabelFor(response: 'UNANSWERED' | 'ATTENDING' | 'NOT_ATTENDING' | undefined) {
  if (response === 'ATTENDING') {
    return '참석';
  }
  if (response === 'NOT_ATTENDING') {
    return '불참';
  }
  if (response === 'UNANSWERED') {
    return '미응답';
  }
  return '기타';
}

function responseClassName(response: 'UNANSWERED' | 'ATTENDING' | 'NOT_ATTENDING' | undefined) {
  if (response === 'ATTENDING') {
    return styles.attending;
  }
  if (response === 'NOT_ATTENDING') {
    return styles.declined;
  }
  return styles.unanswered;
}

function teamLabel(value: string | null) {
  const trimmed = value?.trim();
  if (trimmed === undefined || trimmed.length === 0) {
    return '팀 미배정';
  }
  return trimmed;
}

function renderGroupsContent(groups: ReturnType<typeof useDiningDetailQueries>['groups']) {
  if (groups.isPending) {
    return <p className={styles.loading}>팀별 응답을 불러오는 중입니다.</p>;
  }
  if (groups.error) {
    return (
      <SectionError
        message={getAfterpartyApiErrorMessage(groups.error, 'groups')}
        onRetry={() => void groups.refetch()}
        loading={groups.isFetching}
      />
    );
  }
  const groupItems = groups.data?.groups ?? [];
  return (
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
          {groupItems.map((group, index) => (
            <tr key={group.groupId ?? `${group.kind ?? 'unknown'}-${index}`}>
              <th className={`${styles.tableCell} ${styles.memberName}`} scope="row">
                {groupLabel(group)}
              </th>
              <td className={`${styles.tableCell} ${styles.attending}`}>
                {asCount(group.counts?.attendingCount)}
              </td>
              <td className={`${styles.tableCell} ${styles.declined}`}>
                {asCount(group.counts?.notAttendingCount)}
              </td>
              <td className={`${styles.tableCell} ${styles.unanswered}`}>
                {asCount(group.counts?.unansweredCount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {groupItems.length === 0 ? <p className={styles.emptyState}>팀별 응답이 없습니다.</p> : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  percentage: percentageValue,
  tone,
}: {
  label: string;
  value: string | number;
  percentage: string;
  tone: 'attending' | 'declined' | 'unanswered';
}) {
  return (
    <article className={styles.metricCard}>
      <span className={`${styles.metricLabel} ${styles[tone]}`}>● {label}</span>
      <div className={styles.metricValueRow}>
        <strong className={`${styles.metricValue} ${styles[tone]}`}>{value}</strong>
        <span className={styles.metricUnit}>명 · {percentageValue}</span>
      </div>
    </article>
  );
}
