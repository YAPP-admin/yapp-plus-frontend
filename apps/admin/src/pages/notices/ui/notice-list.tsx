/** 조회 상태와 필터 결과를 공지 목록으로 표현한다. */
import { Skeleton, VStack } from '@seed-design/react';
import type { Notice, Member } from '~/features/notice-management';
import type { NoticeCategory } from '../model/notice-search';
import { NoticeCard } from './notice-card';
import * as styles from './notice-list.css';

/** 조회·필터 변경으로 렌더링할 때 현재 시각으로 마감을 다시 계산한다. */
export function NoticeList({
  category,
  notices,
  members,
}: {
  category: NoticeCategory;
  notices: Notice[];
  members: Member[];
}) {
  const filtered = notices.filter((notice) => category === 'all' || notice.category === category);
  const now = new Date();

  return (
    <>
      <div className={styles.results}>
        <p>
          게시 중 <strong>{notices.length}</strong>개
        </p>
        <p aria-live="polite">
          총 <strong>{filtered.length}</strong>개
        </p>
        <p>개발용 예시 데이터입니다.</p>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.placeholder}>
          {notices.length === 0 ? '등록된 공지가 없습니다.' : '선택한 종류의 공지가 없습니다.'}
        </p>
      ) : (
        <ul className={styles.list} aria-label="공지 목록">
          {filtered.map((notice) => (
            <li key={notice.id}>
              <NoticeCard notice={notice} members={members} now={now} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** 조회 전에도 개수 안내와 카드 세 개 정도의 공간을 확보한다. */
export function NoticeListLoading() {
  return (
    <VStack gap="x3" aria-busy="true">
      <output>공지 목록을 불러오는 중입니다.</output>

      <VStack gap="x2" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} width="full" height={{ base: '150px', lg: '106px' }} radius="16" />
        ))}
      </VStack>
    </VStack>
  );
}
