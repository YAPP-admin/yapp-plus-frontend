/** 작성·수정 화면의 탐색과 최초 데이터 조회를 구성한다. */
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Skeleton, VStack } from '@seed-design/react';
import { NoticeQueryBoundary, useNoticeQuery } from '~/features/notice-management';
import { NoticeEditorForm } from './notice-editor-form';
import * as styles from './notice-editor-page.css';

/** 새 공지는 공통 폼의 기본값으로 시작한다. */
export function NoticeCreatePage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>공지 작성</h1>

      {import.meta.env.DEV ? <NoticeEditorForm /> : <p>공지 작성 기능을 준비 중입니다.</p>}

      <Link className={styles.returnLink} to="/notices" search={{}}>
        공지 목록으로 돌아가기
      </Link>
    </main>
  );
}

/** 공지 ID가 바뀌면 조회 상태와 입력을 함께 초기화한다. */
export function NoticeEditPage({ noticeId }: { noticeId: string }) {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>공지 수정</h1>

      <NoticeQueryBoundary key={noticeId} fallback={<NoticeFormLoading />}>
        <NoticeEditResult noticeId={noticeId} />
      </NoticeQueryBoundary>

      <Link className={styles.returnLink} to="/notices/$noticeId" params={{ noticeId }} search={{}}>
        공지 상세로 돌아가기
      </Link>
    </main>
  );
}

/** 최초 성공한 조회만 편집 시작값으로 채택하여 재조회가 입력을 덮어쓰지 않게 한다. */
function NoticeEditResult({ noticeId }: { noticeId: string }) {
  const { data } = useNoticeQuery(noticeId);
  const [initialNotice] = useState(() => data);

  return initialNotice ? (
    <NoticeEditorForm notice={initialNotice} />
  ) : (
    <p>공지를 찾을 수 없습니다.</p>
  );
}

/** 종류를 알기 전에는 공통 입력과 본문에 필요한 기본 공간을 확보한다. */
function NoticeFormLoading() {
  return (
    <VStack gap="x6" aria-busy="true">
      <output>공지 정보를 불러오는 중입니다.</output>

      <VStack gap="x6" aria-hidden="true">
        <Skeleton width="full" height="80px" />
        <Skeleton width="full" height="70px" />
        <Skeleton width="full" height="70px" />
        <Skeleton width="full" height="380px" />
      </VStack>
    </VStack>
  );
}
