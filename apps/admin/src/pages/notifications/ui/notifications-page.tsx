import { ActionButton } from '@yapp-plus/ui';
import { Bell, MoreHorizontal, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { PageHeader } from '~/shared/ui/page-header';
import {
  formatNotificationDate,
  formatNotificationTarget,
  getNotificationErrorMessage,
  getNotificationStatus,
  isVisibleNotificationStatus,
  type NotificationHistoryItem,
  type NotificationSendValues,
} from '../model/notifications';
import { notificationHistoryQueryOptions } from '../model/notification-queries';
import { NotificationCancelDialog } from './notification-cancel-dialog';
import { NotificationSendDialog } from './notification-send-dialog';
import * as styles from './notifications-page.css';

const historyColumns = ['내용', '대상', '발송 시각', '상태'] as const;

export type NotificationsViewProps = {
  notifications?: readonly NotificationHistoryItem[];
  isLoading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onSend?: () => void;
  onCancelRequest?: (notificationId: number) => void;
  showSendButton?: boolean;
};

function getStatusBadgeClass(tone: ReturnType<typeof getNotificationStatus>['tone']) {
  if (tone === 'scheduled') {
    return styles.statusBadgeScheduled;
  }
  if (tone === 'failed') {
    return styles.statusBadgeFailed;
  }
  return styles.statusBadgeCompleted;
}

export type NotificationsPageProps = {
  onSend?: (values: NotificationSendValues) => void;
  isSending?: boolean;
  sendErrorMessage?: string;
  onCancel?: (notificationId: number) => void;
  isCanceling?: boolean;
};

export function NotificationsPage({
  onSend,
  isSending = false,
  sendErrorMessage,
  onCancel,
  isCanceling = false,
}: NotificationsPageProps = {}) {
  const historyQuery = useInfiniteQuery(notificationHistoryQueryOptions());
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [cancelNotificationId, setCancelNotificationId] = useState<number>();
  const notifications =
    historyQuery.data?.pages
      .flatMap((page) => page.items)
      .filter((notification) => isVisibleNotificationStatus(notification.status)) ?? [];

  return (
    <>
      <NotificationsView
        notifications={notifications}
        isLoading={historyQuery.isPending}
        errorMessage={
          historyQuery.error ? getNotificationErrorMessage(historyQuery.error) : undefined
        }
        onRetry={() => void historyQuery.refetch()}
        hasNextPage={historyQuery.hasNextPage}
        isFetchingNextPage={historyQuery.isFetchingNextPage}
        onLoadMore={() => void historyQuery.fetchNextPage()}
        onSend={() => setSendDialogOpen(true)}
        onCancelRequest={setCancelNotificationId}
        showSendButton={!sendDialogOpen}
      />
      {sendDialogOpen && (
        <NotificationSendDialog
          onClose={() => setSendDialogOpen(false)}
          onSubmit={(values) => onSend?.(values)}
          isPending={isSending}
          errorMessage={sendErrorMessage}
        />
      )}
      <NotificationCancelDialog
        notificationId={cancelNotificationId}
        onClose={() => setCancelNotificationId(undefined)}
        onConfirm={(notificationId) => onCancel?.(notificationId)}
        isPending={isCanceling}
      />
    </>
  );
}

export function NotificationsView({
  notifications = [],
  isLoading = false,
  errorMessage,
  onRetry,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  onSend,
  onCancelRequest,
  showSendButton = true,
}: NotificationsViewProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const visibleNotifications = notifications.filter((notification) =>
    isVisibleNotificationStatus(notification.status),
  );

  useEffect(() => {
    if (!hasNextPage || onLoadMore === undefined || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const sentinel = document.querySelector('[data-notification-load-more]');
    if (!(sentinel instanceof HTMLElement)) {
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !isFetchingNextPage) {
        onLoadMore();
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  function renderHistoryContent() {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={5} aria-label="알림 조회 중">
            <output className={styles.statusState}>알림 발송 내역을 불러오는 중이에요.</output>
          </td>
        </tr>
      );
    }

    if (errorMessage !== undefined) {
      return (
        <tr>
          <td colSpan={5} aria-label="알림 조회 오류">
            <div className={styles.statusState} role="alert">
              <span>{errorMessage}</span>
              {onRetry !== undefined && (
                <ActionButton type="button" variant="neutralWeak" size="small" onClick={onRetry}>
                  다시 시도
                </ActionButton>
              )}
            </div>
          </td>
        </tr>
      );
    }

    if (visibleNotifications.length === 0) {
      return (
        <tr>
          <td colSpan={5} aria-label="알림 없음">
            <div className={styles.emptyState}>
              <div className={styles.emptyContent}>
                <div className={styles.emptyIllustration} aria-hidden="true">
                  <span className={styles.illustrationOrbit} />
                  <span className={styles.illustrationTiltedOrbit} />
                  <span className={styles.illustrationDotTop} />
                  <span className={styles.illustrationDotBottom} />
                  <span className={styles.illustrationIconBox}>
                    <Bell size={21} />
                  </span>
                </div>
                <h3 className={styles.emptyTitle}>아직 발송한 알림이 없어요</h3>
                <p className={styles.emptyDescription}>
                  알림을 보내면 이곳에서 내역을 확인할 수 있어요.
                </p>
              </div>
            </div>
          </td>
        </tr>
      );
    }

    return (
      <>
        {visibleNotifications.map((notification) => {
          const status = getNotificationStatus(notification.status);
          return (
            <tr key={notification.id} className={styles.tableRow}>
              <td className={`${styles.tableCell} ${styles.contentCell}`}>
                <span className={styles.notificationIcon} aria-hidden="true">
                  <Bell size={14} />
                </span>
                <span className={styles.notificationTitle}>{notification.content}</span>
              </td>
              <td className={styles.tableCell}>
                <span className={styles.cellText}>
                  {formatNotificationTarget(notification.targetRole, notification.position)}
                </span>
              </td>
              <td className={styles.tableCell}>
                <span className={styles.cellText}>
                  {formatNotificationDate(notification.referenceAt)}
                </span>
              </td>
              <td className={styles.tableCell}>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(status.tone)}`}>
                  <span className={styles.statusDot} aria-hidden="true" />
                  {status.label}
                </span>
              </td>
              <td className={`${styles.tableCell} ${styles.rowActionCell}`}>
                {status.canCancel && (
                  <>
                    <button
                      type="button"
                      className={styles.rowAction}
                      aria-label={`${notification.content} 더보기`}
                      aria-expanded={openMenuId === notification.id}
                      aria-haspopup="menu"
                      onClick={() =>
                        setOpenMenuId((current) =>
                          current === notification.id ? null : notification.id,
                        )
                      }
                    >
                      <MoreHorizontal size={16} aria-hidden="true" />
                    </button>
                    {openMenuId === notification.id && (
                      <div className={styles.cancelMenu} role="menu">
                        <button
                          type="button"
                          className={styles.cancelMenuItem}
                          role="menuitem"
                          onClick={() => {
                            setOpenMenuId(null);
                            onCancelRequest?.(notification.id);
                          }}
                        >
                          예약 취소
                        </button>
                      </div>
                    )}
                  </>
                )}
              </td>
            </tr>
          );
        })}
        <tr>
          <td colSpan={5}>
            <div data-notification-load-more className={styles.loadMoreSentinel} aria-hidden="true">
              {isFetchingNextPage && '다음 내역을 불러오는 중이에요.'}
            </div>
          </td>
        </tr>
      </>
    );
  }

  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="NOTIFICATION MANAGEMENT"
        title="알림 관리"
        description="회원에게 보낸 푸시 알림과 예약 내역을 관리해요."
      />

      <section className={styles.historySection} aria-labelledby="notification-history-title">
        <header className={styles.historyHeader}>
          <div className={styles.historyHeading}>
            <h2 id="notification-history-title" className={styles.historyTitle}>
              발송 내역
            </h2>
            <p className={styles.historyDescription}>최근 발송한 알림부터 표시해요.</p>
          </div>
          <p className={styles.historyCount}>
            총 <strong className={styles.historyCountStrong}>{visibleNotifications.length}</strong>
            개
          </p>
        </header>

        <table className={styles.historyCard} aria-label="알림 발송 내역">
          <thead className={styles.tableHeader}>
            <tr className={styles.tableHeaderRow}>
              {historyColumns.map((column) => (
                <th key={column} scope="col" className={styles.tableHeaderCell}>
                  {column}
                </th>
              ))}
              <th scope="col" aria-label="더보기" className={styles.tableHeaderCell} />
            </tr>
          </thead>
          <tbody className={styles.tableBody}>{renderHistoryContent()}</tbody>
        </table>
        {showSendButton && (
          <div className={styles.listActionRow}>
            <ActionButton
              type="button"
              variant="neutralWeak"
              size="small"
              className={styles.sendButton}
              onClick={onSend}
            >
              <Plus size={17} strokeWidth={2} aria-hidden="true" />
              알림 보내기
            </ActionButton>
          </div>
        )}
      </section>
    </main>
  );
}
