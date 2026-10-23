import { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Placeholder } from '@tiptap/extension-placeholder';
import type { JSONContent } from '@tiptap/core';
import { noticeExtensions } from './notice-editor-extensions';
import { NoticeEditorToolbar } from './notice-editor-toolbar';
import { editorRoot } from './notice-editor.css';

type NoticeEditorProps = {
  initialValue?: JSONContent;
  onChange?: (value: JSONContent) => void;
  labelId: string;
  errorId?: string;
};

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
      {editor && <NoticeEditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
