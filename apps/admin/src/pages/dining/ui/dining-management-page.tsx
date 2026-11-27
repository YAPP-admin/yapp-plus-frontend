import { useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { ActionButton, Badge } from '@yapp-plus/ui';
import { useAdminGeneration } from '~/features/admin-generation';
import {
  afterpartyStatusLabel,
  afterpartyStatusTone,
  asCount,
  asDisplayValue,
  getAfterpartyApiErrorMessage,
  responseRate,
  useDiningListQuery,
} from '../model/dining-api';
import { diningPeriodLabels, type DiningPeriod } from '../model/dining-search';
import {
  createButton,
  description,
  disabledTitleLink,
  emptyState,
  error,
  filter,
  filterActive,
  filterCountLabel,
  filterGroup,
  heading,
  eyebrow,
  listLoading,
  page,
  progress,
  progressGroup,
  responseRate as responseRateStyle,
  table,
  tableCell,
  tableHeader,
  tableRegion,
  title,
  titleCell,
  titleLink,
  visuallyHidden,
} from './dining-management-page.css';

const PERIODS: readonly DiningPeriod[] = ['UPCOMING', 'PAST'];

export function DiningManagementPage({
  period,
  onPeriodChange,
}: {
  period: DiningPeriod;
  onPeriodChange: (period: DiningPeriod) => void;
}) {
  const { currentGeneration } = useAdminGeneration();
  const query = useDiningListQuery(currentGeneration.generationId, period);
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

  const countLabel = query.isPending ? '-' : String(query.items.length);

  return (
    <main className={page}>
      <header className={heading}>
        <div>
          <p className={eyebrow}>DINNER</p>
          <h1 className={title}>뒤풀이 관리</h1>
          <p className={description}>뒤풀이 참여 여부 조사를 만들고 응답 현황을 확인해요.</p>
        </div>
        <ActionButton asChild variant="brandSolid" className={createButton}>
          <Link to="/dining/new">
            <span aria-hidden="true">＋</span>
            뒤풀이 만들기
          </Link>
        </ActionButton>
      </header>

      <nav className={filterGroup} aria-label="뒤풀이 상태 필터">
        {PERIODS.map((nextPeriod) => {
          const isActive = period === nextPeriod;
          return (
            <button
              key={nextPeriod}
              className={[filter, isActive ? filterActive : ''].join(' ')}
              type="button"
              aria-pressed={isActive}
              onClick={() => onPeriodChange(nextPeriod)}
            >
              {diningPeriodLabels[nextPeriod]}
              <span className={filterCountLabel}>{isActive ? countLabel : '-'}</span>
            </button>
          );
        })}
      </nav>

      {query.isPending ? <p className={listLoading}>뒤풀이 목록을 불러오는 중입니다.</p> : null}
      {query.error && query.items.length === 0 ? (
        <div className={error} role="alert">
          <span>{getAfterpartyApiErrorMessage(query.error, 'list')}</span>
          <ActionButton
            type="button"
            variant="neutralWeak"
            loading={query.isFetching}
            onClick={() => void query.refetch()}
          >
            다시 시도
          </ActionButton>
        </div>
      ) : (
        <div className={tableRegion} aria-busy={query.isFetching && !query.isFetchingNextPage}>
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
              {query.items.map((item, index) => (
                <DiningRow key={item.afterpartyId ?? `missing-${index}`} item={item} />
              ))}
            </tbody>
          </table>
          {query.items.length === 0 ? (
            <p className={emptyState}>등록된 뒤풀이가 없습니다.</p>
          ) : null}
          {query.error && query.items.length > 0 ? (
            <div className={error} role="alert">
              <span>{getAfterpartyApiErrorMessage(query.error, 'list')}</span>
              <ActionButton
                type="button"
                variant="neutralWeak"
                loading={query.isFetching}
                onClick={() => void query.refetch()}
              >
                다시 시도
              </ActionButton>
            </div>
          ) : null}
          <div ref={sentinelRef} aria-hidden="true" />
          {query.isFetchingNextPage ? (
            <p className={listLoading}>다음 뒤풀이를 불러오는 중입니다.</p>
          ) : null}
        </div>
      )}
    </main>
  );
}

function DiningRow({
  item,
}: {
  item: {
    afterpartyId?: number;
    generationNumber?: number;
    title?: string;
    startsAt?: string;
    startsAtDisplay?: string;
    deadline?: string;
    deadlineDisplay?: string;
    invitationRoles?: ('PLAYER' | 'OB' | 'COMPLETED_MEMBER' | 'DEFERRED' | 'STAFF')[];
    state?: 'OPEN' | 'CLOSED' | 'ENDED';
    counts?: {
      totalCount?: number;
      respondedCount?: number;
      attendingCount?: number;
    };
  };
}) {
  const rate = responseRate(item.counts?.respondedCount, item.counts?.totalCount);
  const attendeeCount = asCount(item.counts?.attendingCount);
  const numericRate = rate === '-' ? undefined : Number.parseInt(rate, 10);
  const label = asDisplayValue(item.title);
  const inviteScope = formatInvitationScope(item.generationNumber, item.invitationRoles);

  return (
    <tr>
      <th className={`${tableCell} ${titleCell}`} scope="row">
        {item.afterpartyId == null ? (
          <span className={disabledTitleLink}>{label}</span>
        ) : (
          <Link
            to="/dining/$diningId"
            params={{ diningId: String(item.afterpartyId) }}
            className={titleLink}
          >
            {label}
          </Link>
        )}
      </th>
      <td className={tableCell}>
        <time dateTime={dateTimeValue(item.startsAt)}>{asDisplayValue(item.startsAtDisplay)}</time>
      </td>
      <td className={tableCell}>
        <time dateTime={dateTimeValue(item.deadline)}>{asDisplayValue(item.deadlineDisplay)}</time>
      </td>
      <td className={tableCell}>{inviteScope}</td>
      <td className={tableCell}>
        <div className={progressGroup}>
          <progress
            className={progress}
            max={100}
            value={numericRate}
            aria-label={`${label} 응답률`}
          />
          <span className={responseRateStyle}>{rate}</span>
        </div>
      </td>
      <td className={tableCell}>{attendeeCount}</td>
      <td className={tableCell}>
        <Badge variant="weak" tone={afterpartyStatusTone(item.state)}>
          {afterpartyStatusLabel(item.state)}
        </Badge>
      </td>
    </tr>
  );
}

function formatInvitationScope(
  generationNumber: number | undefined,
  roles: readonly ('PLAYER' | 'OB' | 'COMPLETED_MEMBER' | 'DEFERRED' | 'STAFF')[] | undefined,
) {
  const generation = generationNumber == null ? '-' : `${generationNumber}기`;
  const labels = roles
    ?.map((role) => {
      if (role === 'PLAYER') {
        return '활동회원';
      }
      if (role === 'STAFF') {
        return '운영진';
      }
      return '기타';
    })
    .join(' · ');
  return labels ? `${generation} ${labels}` : generation;
}

function dateTimeValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ?? undefined;
}
