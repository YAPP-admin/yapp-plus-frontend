import { within } from '@testing-library/react';
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
      const link = within(editor.view.dom).getByRole('link', { name: '링크' });
      const event = new MouseEvent('click', { button: 0 });
      Object.defineProperty(event, 'target', { value: link });
      editor.view.someProp('handleClick', (handler) => handler(editor.view, 1, event));
      expect(open).toHaveBeenCalledWith('https://example.com/', '_blank', 'noopener,noreferrer');
    } finally {
      editor.destroy();
      open.mockRestore();
    }
  });
});

it('읽기 전용 링크는 안전한 rel을 유지하고 브라우저 기본 탐색에 맡긴다', () => {
  const open = vi.spyOn(window, 'open').mockImplementation(() => null);
  const editor = new Editor({
    extensions: noticeExtensions(),
    editable: false,
    content: '<p><a href="https://example.com">링크</a></p>',
  });
  try {
    const link = within(editor.view.dom).getByRole('link', { name: '링크' });
    const event = new MouseEvent('click', { button: 0, cancelable: true });
    Object.defineProperty(event, 'target', { value: link });
    editor.view.someProp('handleClick', (handler) => handler(editor.view, 1, event));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')?.split(' ')).toEqual(
      expect.arrayContaining(['noopener', 'noreferrer']),
    );
    expect(open).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  } finally {
    editor.destroy();
    open.mockRestore();
  }
});
