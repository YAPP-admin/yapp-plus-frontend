import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { JSONContent } from '@tiptap/core';
import { NoticeEditor } from './notice-editor';

function body(text: string): JSONContent {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  };
}

describe('공지 에디터', () => {
  it('초기값 없이 빈 편집기와 안내를 제공하고 안내를 본문에 저장하지 않는다', async () => {
    const onChange = vi.fn<(value: JSONContent) => void>();
    render(<NoticeEditor labelId="label" onChange={onChange} />);
    const textbox = await screen.findByRole('textbox');
    expect(textbox).toHaveAttribute('contenteditable', 'true');
    const paragraph = within(textbox).getByRole('paragraph');
    expect(paragraph).toHaveAttribute('data-placeholder', '공지 내용을 입력하세요');
    expect(paragraph).toHaveClass('is-editor-empty');
    expect(textbox.textContent).toBe('');
    expect(onChange).not.toHaveBeenCalled();
    paragraph.textContent = '직접 작성';
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange).toHaveBeenLastCalledWith(body('직접 작성'));
    expect(paragraph).not.toHaveClass('is-editor-empty');
  });
  it('부모 재렌더와 초기값 변경으로 본문을 덮어쓰지 않고 key로 초기화한다', async () => {
    const { rerender } = render(
      <NoticeEditor key="first" initialValue={body('처음')} labelId="label" />,
    );
    const previous = await screen.findByRole('textbox');
    rerender(
      <NoticeEditor key="first" initialValue={body('변경')} labelId="label" errorId="error" />,
    );
    expect(previous).toHaveTextContent('처음');
    expect(previous).toHaveAttribute('aria-describedby', 'error');
    rerender(<NoticeEditor key="second" initialValue={body('새 공지')} labelId="label" />);
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveTextContent('새 공지'));
    expect(screen.getByRole('textbox')).not.toBe(previous);
  });
  it('툴바 서식과 링크 오류를 표시한다', async () => {
    render(<NoticeEditor labelId="label" />);
    await screen.findByRole('textbox');
    fireEvent.click(screen.getByRole('button', { name: '굵게' }));
    expect(screen.getByRole('button', { name: '굵게' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '링크' }));
    fireEvent.change(screen.getByLabelText('링크 주소'), {
      target: { value: 'javascript:alert(1)' },
    });
    fireEvent.click(screen.getByRole('button', { name: '적용' }));
    expect(screen.getByRole('alert')).toHaveTextContent('허용되지 않는 링크 주소');
  });
  it('선택 없이 링크를 추가하면 URL을 삽입하고 수정·제거할 수 있다', async () => {
    render(<NoticeEditor labelId="label" />);
    await screen.findByRole('textbox');
    fireEvent.click(screen.getByRole('button', { name: '링크' }));
    fireEvent.change(screen.getByLabelText('링크 주소'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: '적용' }));
    expect(screen.getByRole('link')).toHaveTextContent('https://example.com');
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com');
    fireEvent.click(screen.getByRole('link'));
    fireEvent.click(screen.getByRole('button', { name: '링크' }));
    fireEvent.click(screen.getByRole('button', { name: '링크 제거' }));
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
