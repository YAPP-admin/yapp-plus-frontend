/** Tiptap 본문과 서식 도구를 조합하는 공지 편집기다. */
import { Skeleton } from '@seed-design/react';
import { Fragment, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Placeholder } from '@tiptap/extension-placeholder';
import type { JSONContent } from '@tiptap/core';
import { noticeExtensions } from './notice-editor-extensions';
import { NoticeEditorToolbar } from './notice-editor-toolbar';
import * as toolbarStyles from './notice-editor-toolbar.css';
import { editorRoot } from './notice-editor.css';

type NoticeEditorProps = {
  initialValue?: JSONContent;
  onChange?: (value: JSONContent) => void;
  labelId: string;
  errorId?: string;
};

/** 초기 본문을 한 번 설정하고 편집 결과를 상위로 전달한다. */
export function NoticeEditor({ initialValue, onChange, labelId, errorId }: NoticeEditorProps) {
  const [content] = useState(() => initialValue);
  const [extensions] = useState(() => [
    ...noticeExtensions(),
    Placeholder.configure({ placeholder: '공지 내용을 입력하세요' }),
  ]);
  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    content,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': labelId,
        'aria-invalid': String(Boolean(errorId)),
        ...(errorId ? { 'aria-describedby': errorId } : {}),
      },
    },
    onUpdate: ({ editor: current }) => onChange?.(current.getJSON()),
  });

  return (
    <div className={editorRoot}>
      {editor ? (
        <>
          <NoticeEditorToolbar editor={editor} />
          <EditorContent editor={editor} />
        </>
      ) : (
        <NoticeEditorLoading />
      )}
    </div>
  );
}

/** 실제 툴바와 같은 크기·줄바꿈을 사용하고 빈 본문의 최소 높이를 유지한다. */
function NoticeEditorLoading() {
  return (
    <div aria-busy="true" aria-label="본문 편집기를 준비하는 중입니다.">
      <div className={toolbarStyles.toolbar} aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <Fragment key={index}>
            <Skeleton className={toolbarStyles.toolButton} />
            {index === 6 && <span className={toolbarStyles.separator} />}
          </Fragment>
        ))}
      </div>
      <Skeleton width="full" height="320px" radius="0" aria-hidden="true" />
    </div>
  );
}
