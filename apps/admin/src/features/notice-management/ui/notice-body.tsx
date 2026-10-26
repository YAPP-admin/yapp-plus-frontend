/** 편집기와 같은 확장·본문 스타일로 저장된 JSON을 읽기 전용 렌더링한다. */
import { EditorContent, useEditor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { noticeExtensions } from './notice-editor-extensions';
import { editorRoot } from './notice-editor.css';

/** 조회 결과가 바뀌면 인스턴스를 재생성해 이전 공지 본문이 남지 않게 한다. */
export function NoticeBody({ document }: { document: JSONContent }) {
  const editor = useEditor(
    {
      extensions: noticeExtensions(),
      content: document,
      editable: false,
      immediatelyRender: false,
      editorProps: { attributes: { role: 'document', 'aria-label': '공지 본문' } },
    },
    [document],
  );

  return (
    <div className={editorRoot}>
      <EditorContent editor={editor} />
    </div>
  );
}
