/** 본문 서식 선택과 링크 편집 동작을 제공한다. */
import { useState } from 'react';
import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { Bold, Code, Link, List } from 'lucide-react';
import * as styles from './notice-editor-toolbar.css';

/** 편집기의 선택 상태를 구독하고 사용자 이벤트로 서식을 적용한다. */
export function NoticeEditorToolbar({ editor }: { editor: Editor }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive('bold'),
      code: current.isActive('code'),
      codeBlock: current.isActive('codeBlock'),
      bulletList: current.isActive('bulletList'),
      link: current.isActive('link'),
      heading: [1, 2, 3, 4, 5, 6].find((level) => current.isActive('heading', { level })) ?? 0,
    }),
  });
  function applyLink() {
    const href = url.trim();
    if (!href || !editor.can().setLink({ href })) {
      setError('허용되지 않는 링크 주소입니다.');
      return;
    }
    if (editor.state.selection.empty && !editor.isActive('link')) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: href,
          marks: [{ type: 'link', attrs: { href } }],
        })
        .command(({ tr }) => {
          tr.setMeta('preventAutolink', true);
          const link = editor.schema.marks.link;
          if (link) {
            tr.removeStoredMark(link);
          }
          return true;
        })
        .run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setLinkOpen(false);
  }
  return (
    <>
      <fieldset className={styles.toolbar} aria-label="본문 서식">
        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
          <button
            key={level}
            className={styles.toolButton}
            type="button"
            aria-label={`제목 ${level}`}
            title={`제목 ${level}`}
            aria-pressed={state.heading === level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          >
            H{level}
          </button>
        ))}
        <button
          className={styles.toolButton}
          type="button"
          aria-label="굵게"
          title="굵게"
          aria-pressed={state.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={14} aria-hidden="true" />
        </button>
        <span className={styles.separator} aria-hidden="true" />
        <button
          className={styles.toolButton}
          type="button"
          aria-label="링크"
          title="링크"
          aria-pressed={state.link}
          aria-expanded={linkOpen}
          disabled={state.code || state.codeBlock}
          onClick={() => {
            const href: unknown = editor.getAttributes('link').href;
            setUrl(typeof href === 'string' ? href : '');
            setError('');
            setLinkOpen(!linkOpen);
          }}
        >
          <Link size={14} aria-hidden="true" />
        </button>
        <button
          className={styles.toolButton}
          type="button"
          aria-label="글머리 목록"
          title="글머리 목록"
          aria-pressed={state.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={14} aria-hidden="true" />
        </button>
        <button
          className={styles.toolButton}
          type="button"
          aria-label="인라인 코드"
          title="인라인 코드"
          aria-pressed={state.code}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code size={14} aria-hidden="true" />
        </button>
      </fieldset>
      {linkOpen && (
        <div className={styles.linkRow}>
          <label>
            링크 주소{' '}
            <input
              className={styles.control}
              type="url"
              value={url}
              aria-invalid={Boolean(error)}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://"
              onKeyDown={(event) => {
                if (event.key !== 'Enter') {
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                if (!event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229) {
                  applyLink();
                }
              }}
            />
          </label>
          <button className={styles.control} type="button" onClick={applyLink}>
            적용
          </button>
          <button
            className={styles.control}
            type="button"
            onClick={() => {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              setLinkOpen(false);
            }}
          >
            링크 제거
          </button>
          <button
            className={styles.control}
            type="button"
            onClick={() => {
              setLinkOpen(false);
              editor.commands.focus();
            }}
          >
            취소
          </button>
          {error && <span role="alert">{error}</span>}
        </div>
      )}
    </>
  );
}
