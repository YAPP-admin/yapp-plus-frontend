/** 선택 기수의 AVAILABLE 명단과 조회 상태를 표시하며 명단 변경은 업로드 화면에 맡깁니다. */
import { Suspense } from 'react';
import { CatchBoundary, Link } from '@tanstack/react-router';
import {
  QueryErrorResetBoundary,
  useQueryErrorResetBoundary,
  useSuspenseInfiniteQuery,
} from '@tanstack/react-query';
import { ApiError } from '@yapp-plus/api';
import { ActionButton, ResultSection } from '@yapp-plus/ui';
import { formatMemberPhoneNumber, normalizeMemberPhoneNumber } from '~/features/member-management';
import { PageHeader } from '~/shared/ui/page-header';
import { rosterQueryOptions } from '../model/roster-query';
import * as styles from './member-roster-page.css';

const POSITION_LABELS = {
  PM: 'PM',
  DESIGN: '디자인',
  ANDROID: 'Android',
  IOS: 'iOS',
  WEB: 'Web',
  MOBILE: 'Mobile',
  SERVER: 'Server',
  AI_NATIVE: 'AI Native',
};
const ROLE_LABELS = {
  PLAYER: '활동회원',
  OB: '정회원',
  COMPLETED_MEMBER: '수료회원',
  DEFERRED: '유예회원',
  STAFF: '앱 운영진',
};

/** 기수 변경 시 조회 경계를 초기화하고 해당 기수의 명단만 표시합니다. */
export function MemberRosterPage({
  generationId,
  generationNumber,
}: {
  generationId: number;
  generationNumber: number;
}) {
  return (
    <main className={styles.page}>
      <PageHeader
        eyebrow="MEMBER ROSTER"
        title="업로드 명단"
        description={`${generationNumber}기에 등록한 사전 명단을 확인해요.`}
      >
        <Link to="/members/import" search={{}}>
          명단 업로드
        </Link>
      </PageHeader>
      <p className={styles.notice}>
        아직 회원과 연결되지 않은 명단만 표시해요. 연결·취소된 명단은 제외됩니다.
      </p>
      <QueryErrorResetBoundary key={generationId}>
        <CatchBoundary getResetKey={() => String(generationId)} errorComponent={RosterQueryError}>
          <Suspense fallback={<output>업로드 명단을 불러오는 중입니다.</output>}>
            <RosterList generationId={generationId} generationNumber={generationNumber} />
          </Suspense>
        </CatchBoundary>
      </QueryErrorResetBoundary>
    </main>
  );
}

function RosterQueryError({ error, reset }: { error: unknown; reset: () => void }) {
  const query = useQueryErrorResetBoundary();
  // 인증 만료는 관리자 작업 영역의 기존 세션 복구 경계가 처리합니다.
  if (error instanceof ApiError && error.status === 401) {
    throw error;
  }
  return (
    <div role="alert" className={styles.notice}>
      <p>업로드 명단을 불러오지 못했어요.</p>
      <ActionButton
        variant="neutralWeak"
        onClick={() => {
          query.reset();
          reset();
        }}
      >
        다시 시도
      </ActionButton>
    </div>
  );
}

function RosterList({
  generationId,
  generationNumber,
}: {
  generationId: number;
  generationNumber: number;
}) {
  const {
    data,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useSuspenseInfiniteQuery(rosterQueryOptions(generationId));
  const entries = data.pages.flatMap((page) => page.items);

  return (
    <>
      <div className={styles.toolbar}>
        <span>조회된 명단 {entries.length}명</span>
        <ActionButton
          variant="neutralWeak"
          size="small"
          disabled={isFetching}
          loading={isFetching && !isFetchingNextPage}
          onClick={() => void refetch()}
        >
          새로고침
        </ActionButton>
      </div>
      {entries.length === 0 ? (
        <ResultSection
          titleAs="h2"
          title="조회할 업로드 명단이 없어요"
          description="명단을 업로드하지 않았거나, 등록된 명단이 모두 연결·취소되었을 수 있어요."
        />
      ) : (
        <table className={styles.table}>
          <caption>{generationNumber}기 업로드 명단</caption>
          <thead>
            <tr>
              <th scope="col">이름</th>
              <th scope="col">전화번호</th>
              <th scope="col">직군</th>
              <th scope="col">회원 구분</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const phone = normalizeMemberPhoneNumber(entry.phoneNumber);
              return (
                <tr key={entry.rosterEntryId}>
                  <th scope="row">{entry.name}</th>
                  <td>{phone === null ? entry.phoneNumber : formatMemberPhoneNumber(phone)}</td>
                  <td>{entry.position === null ? '미지정' : POSITION_LABELS[entry.position]}</td>
                  <td>{entry.role === null ? '미지정' : ROLE_LABELS[entry.role]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {error && (
        <div role="alert" className={styles.notice}>
          <p>
            {isFetchNextPageError
              ? '다음 명단을 불러오지 못했어요.'
              : '최신 명단을 불러오지 못했어요.'}
          </p>
          <ActionButton
            variant="neutralWeak"
            disabled={isFetching}
            onClick={() => void (isFetchNextPageError ? fetchNextPage() : refetch())}
          >
            다시 시도
          </ActionButton>
        </div>
      )}
      {hasNextPage && !isFetchNextPageError && (
        <ActionButton
          variant="neutralWeak"
          disabled={isFetching}
          loading={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
        >
          더 보기
        </ActionButton>
      )}
    </>
  );
}
