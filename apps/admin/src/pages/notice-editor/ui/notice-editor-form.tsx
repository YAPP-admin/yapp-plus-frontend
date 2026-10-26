/** 공통 메타데이터 폼과 본문 편집기를 하나의 입력 화면으로 조합한다. */
import { useId } from 'react';
import {
  NoticeEditor,
  NoticeForm,
  getNoticeFormValues,
  type Notice,
} from '~/features/notice-management';
import * as styles from './notice-editor-page.css';

/** 실제 저장 연결 전에는 각 입력 컴포넌트가 편집 상태를 관리한다. */
export function NoticeEditorForm({ notice }: { notice?: Notice }) {
  const id = useId();

  return (
    <>
      <p className={styles.description}>입력 내용은 아직 저장되지 않습니다.</p>

      <NoticeForm initialValues={notice ? getNoticeFormValues(notice) : undefined}>
        <section aria-labelledby={id}>
          <h2 id={id} className={styles.description}>
            공지 내용
          </h2>

          <NoticeEditor labelId={id} initialValue={notice?.bodyDocument} />
        </section>
      </NoticeForm>
    </>
  );
}
