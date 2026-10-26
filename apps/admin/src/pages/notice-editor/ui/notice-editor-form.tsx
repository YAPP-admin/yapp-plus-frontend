/** 메타데이터·본문·첨부를 모아 저장하고 성공한 공지의 상세로 이동한다. */
import { useId, useState } from 'react';
import { Text } from '@seed-design/react';
import { useNavigate } from '@tanstack/react-router';
import type { JSONContent } from '@tiptap/core';
import {
  NoticeEditor,
  NoticeAttachmentInput,
  NoticeForm,
  getNoticeFormValues,
  getNoticeAttachmentEntries,
  noticeDocumentSchema,
  useNoticeMutations,
  type Notice,
  type NoticeFormContent,
} from '~/features/notice-management';
import * as styles from './notice-editor-page.css';

/** 저장 실패 시 초안을 유지하고 조회 결과로 덮어쓰지 않는다. */
export function NoticeEditorForm({ notice }: { notice?: Notice }) {
  const bodyId = useId();
  const navigate = useNavigate();
  const { create, update } = useNoticeMutations();
  const [body, setBody] = useState<JSONContent>(
    notice?.bodyDocument ?? { type: 'doc', content: [] },
  );
  const [bodyError, setBodyError] = useState(false);
  const [entries, setEntries] = useState(() =>
    getNoticeAttachmentEntries(notice?.attachments ?? []),
  );
  const pending = create.isPending || update.isPending;
  const checkingImages = entries.some(({ status }) => status === 'pending');

  /** 본문 필수 입력을 확인하고 mutation의 성공 콜백에서 상세로 이동한다. */
  function save(content: NoticeFormContent) {
    const result = noticeDocumentSchema.safeParse(body);
    setBodyError(!result.success);
    if (!result.success || checkingImages || pending) {
      return;
    }

    const input = {
      ...content,
      bodyDocument: result.data,
      attachments: entries.map(({ id, file }) => ({ id, name: file.name, blob: file })),
    };
    create.reset();
    update.reset();
    if (notice) {
      update.mutate({ id: notice.id, input }, { onSuccess: openSavedNotice });
    } else {
      create.mutate(input, { onSuccess: openSavedNotice });
    }
  }

  /** 저장된 ID를 사용하며 실패 시에는 현재 입력 화면을 유지한다. */
  function openSavedNotice(saved: Notice) {
    void navigate({ to: '/notices/$noticeId', params: { noticeId: saved.id }, search: {} });
  }

  return (
    <NoticeForm
      initialValues={notice ? getNoticeFormValues(notice) : undefined}
      onSubmit={save}
      isPending={pending}
      error={
        create.isError || update.isError
          ? '저장하지 못했습니다. 입력을 유지했으니 다시 시도하세요.'
          : undefined
      }
      submitLabel={notice ? '수정 저장' : '공지 등록'}
      submitDisabled={checkingImages || pending}
    >
      <section aria-labelledby={bodyId} inert={pending}>
        <h2 id={bodyId} className={styles.description}>
          공지 내용
        </h2>

        <NoticeEditor
          labelId={bodyId}
          initialValue={notice?.bodyDocument}
          errorId={bodyError ? `${bodyId}-error` : undefined}
          onChange={(value) => {
            setBody(value);
            if (bodyError) {
              setBodyError(!noticeDocumentSchema.safeParse(value).success);
            }
          }}
        />
        {bodyError && (
          <Text as="p" id={`${bodyId}-error`} role="alert" color="fg.critical">
            공지 내용을 입력하세요.
          </Text>
        )}
      </section>

      <NoticeAttachmentInput entries={entries} onEntriesChange={setEntries} disabled={pending} />
    </NoticeForm>
  );
}
