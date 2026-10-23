import { Editor } from '@tiptap/core';
import { describe, expect, it, vi } from 'vitest';
import { noticeExtensions } from './notice-editor-extensions';

describe('공지 에디터 확장', () => {
  it('편집 중 링크 클릭은 새 탭으로 연다', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const editor = new Editor({
      extensions: noticeExtensions(),
      content: '<p><a href="https://example.com">링크</a></p>',
    });
    try {
      const link = editor.view.dom.querySelector('a');
      const event = new MouseEvent('click', { button: 0 });
      Object.defineProperty(event, 'target', { value: link });
      editor.view.someProp('handleClick', (handler) => handler(editor.view, 1, event));
      expect(open).toHaveBeenCalledWith('https://example.com/', '_blank');
    } finally {
      editor.destroy();
      open.mockRestore();
    }
  });
});
