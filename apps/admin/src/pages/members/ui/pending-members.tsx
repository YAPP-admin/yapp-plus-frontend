import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Box, Text, VStack } from '@seed-design/react';
import { UserRound } from 'lucide-react';
import { ActionButton, ResultSection, Snackbar, useSnackbarAdapter } from '@yapp-plus/ui';
import { PageHeader } from '~/shared/ui/page-header';
import {
  formatMembershipReviewDate,
  getMembershipReviewErrorMessage,
} from '../model/membership-review';
import { pendingMembershipsQueryOptions } from '../model/membership-review-queries';
import { MembershipReviewDialog, type MembershipReviewAction } from './membership-review-dialog';
import * as styles from './pending-members.css';

export function PendingMembers() {
  const snackbar = useSnackbarAdapter();
  const [reviewRequest, setReviewRequest] = useState<
    { memberId: number; action: MembershipReviewAction } | undefined
  >();
  const listQuery = useInfiniteQuery(pendingMembershipsQueryOptions());
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const members =
    listQuery.data?.pages
      .flatMap((page) => page.items)
      .filter((member) => member.reviewStatus === 'PENDING') ?? [];
  const hasNextPage = listQuery.hasNextPage;
  const { fetchNextPage, isFetchingNextPage } = listQuery;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (
      target === null ||
      !hasNextPage ||
      isFetchingNextPage ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        void fetchNextPage();
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  function closeReviewPanel() {
    setReviewRequest(undefined);
  }

  function showReviewCompleted(action: 'approve' | 'reject') {
    closeReviewPanel();
    snackbar.create({
      render: () => (
        <Snackbar
          variant="positive"
          message={action === 'approve' ? '가입 승인을 완료했어요.' : '가입 거절을 완료했어요.'}
        />
      ),
    });
  }

  function showReviewConflict() {
    closeReviewPanel();
    snackbar.create({
      render: () => (
        <Snackbar
          variant="critical"
          message="다른 운영진이 먼저 처리했어요. 가입 심사 목록을 새로고쳤습니다."
        />
      ),
    });
    void listQuery.refetch();
  }

  function showMissingMember() {
    closeReviewPanel();
    snackbar.create({
      render: () => (
        <Snackbar variant="critical" message="가입 신청을 찾을 수 없어 목록을 새로고쳤습니다." />
      ),
    });
    void listQuery.refetch();
  }

  function renderMembersContent() {
    if (listQuery.isPending) {
      return <output className={styles.loading}>가입 심사 목록을 불러오는 중입니다.</output>;
    }

    if (listQuery.error) {
      return (
        <div className={styles.error} role="alert">
          <span>{getMembershipReviewErrorMessage(listQuery.error, 'list')}</span>
          <ActionButton
            type="button"
            variant="neutralWeak"
            loading={listQuery.isFetching}
            onClick={() => void listQuery.refetch()}
          >
            다시 시도
          </ActionButton>
        </div>
      );
    }

    if (members.length === 0) {
      return (
        <VStack
          minHeight="430px"
          justify="center"
          p="x5"
          borderRadius="r3"
          borderWidth={1}
          borderColor="stroke.neutralMuted"
          bg="bg.layerFloating"
        >
          <ResultSection
            size="medium"
            asset={
              <Box aria-hidden="true" color="fg.neutralMuted" pb="x4">
                <UserRound size={40} />
              </Box>
            }
            titleAs="h3"
            title="가입 대기 중인 회원이 없어요"
            description="새로운 가입 신청이 들어오면 이곳에서 확인할 수 있어요."
          />
        </VStack>
      );
    }

    return (
      <PendingMemberTable
        members={members}
        onSelect={(memberId, action) => setReviewRequest({ memberId, action })}
      />
    );
  }

  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="MEMBER MANAGEMENT"
        title="회원 관리"
        description="YAPP 회원 정보와 가입 신청을 관리해요."
      />
      <section className={styles.section} aria-labelledby="pending-heading">
        <header className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <Text as="h2" id="pending-heading" textStyle="t5Bold">
              가입 대기
            </Text>
            <p className={styles.sectionDescription}>
              회원 정보를 확인한 뒤 가입을 승인하거나 반려해 주세요.
            </p>
          </div>
          <Text textStyle="t1Regular" color="fg.neutralMuted">
            총 <strong>{members.length}</strong>건
          </Text>
        </header>

        {renderMembersContent()}

        <div ref={loadMoreRef} aria-hidden="true" />
      </section>

      {reviewRequest === undefined ? null : (
        <MembershipReviewDialog
          memberId={reviewRequest.memberId}
          action={reviewRequest.action}
          onClose={closeReviewPanel}
          onMissing={showMissingMember}
          onConflict={showReviewConflict}
          onCompleted={showReviewCompleted}
        />
      )}
    </main>
  );
}

function PendingMemberTable({
  members,
  onSelect,
}: {
  members: readonly PendingMember[];
  onSelect: (memberId: number, action: MembershipReviewAction) => void;
}) {
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 좁은 화면에서 키보드로 표를 가로 스크롤하는 진입점입니다.
    <section className={styles.tableRegion} aria-label="가입 대기 회원 목록 표" tabIndex={0}>
      <table className={styles.table}>
        <caption className={styles.visuallyHidden}>가입 대기 회원 목록</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.nameColumn}>
              이름
            </th>
            <th scope="col" className={styles.phoneColumn}>
              전화번호
            </th>
            <th scope="col" className={styles.dateColumn}>
              신청일
            </th>
            <th scope="col" className={styles.actionColumn}>
              <span className={styles.visuallyHidden}>회원 작업</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={`${member.memberId}-${member.signedUpAt}-${index}`}>
              <th scope="row">{member.name}</th>
              <td>{member.phoneNumber}</td>
              <td>
                <time dateTime={member.signedUpAt}>
                  {formatMembershipReviewDate(member.signedUpAt)}
                </time>
              </td>
              <td>
                <div className={styles.actionGroup}>
                  <ActionButton
                    type="button"
                    size="small"
                    variant="neutralSolid"
                    aria-label={`${member.name} 승인`}
                    onClick={() => onSelect(member.memberId, 'approve')}
                  >
                    승인
                  </ActionButton>
                  <ActionButton
                    type="button"
                    size="small"
                    variant="neutralWeak"
                    aria-label={`${member.name} 거절`}
                    onClick={() => onSelect(member.memberId, 'reject')}
                  >
                    거절
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

type PendingMember = {
  memberId: number;
  name: string;
  phoneNumber: string;
  signedUpAt: string;
  reviewStatus: string;
};
