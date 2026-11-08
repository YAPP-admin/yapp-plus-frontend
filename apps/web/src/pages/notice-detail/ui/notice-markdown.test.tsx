/** 공지 Markdown의 서식·링크·이미지 보안 경계를 검증한다. */
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { NoticeMarkdown } from './notice-markdown';

it('제목 계층과 CommonMark 서식을 화면 제목 아래에서 읽을 수 있게 표시한다', () => {
  render(
    <NoticeMarkdown
      content={
        '# 안내 제목\n\n## 소제목\n\n**중요**한 내용과 `코드`\n\n- 첫 번째\n- 두 번째\n\n> 인용문'
      }
    />,
  );

  expect(screen.getByRole('heading', { level: 2, name: '안내 제목' })).toBeVisible();
  expect(screen.getByRole('heading', { level: 3, name: '소제목' })).toBeVisible();
  expect(screen.getByText('중요').tagName).toBe('STRONG');
  expect(screen.getByText('코드').tagName).toBe('CODE');
  expect(screen.getByRole('list')).toHaveTextContent('첫 번째 두 번째');
  expect(screen.getByText('인용문').closest('blockquote')).toBeInTheDocument();
});

it('HTML과 허용하지 않은 링크·이미지를 실행하거나 이동시키지 않는다', () => {
  render(
    <NoticeMarkdown
      content={
        '<script>alert(1)</script>\n\n[위험 링크](javascript:alert(1))\n\n![위험 이미지](data:image/svg+xml,unsafe)'
      }
    />,
  );

  expect(screen.queryByText('alert(1)')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: '위험 링크' })).not.toBeInTheDocument();
  expect(screen.getByText('위험 링크')).toBeVisible();
  expect(screen.getByText('위험 이미지')).toBeVisible();
});

it('HTTP(S) 링크는 새 창으로 열고 이미지는 실패 시 대체 문구를 표시한다', () => {
  render(
    <NoticeMarkdown
      content={
        '[공지 문서](https://example.com/notice)\n\n![행사 포스터](https://example.com/poster.png)'
      }
    />,
  );

  expect(screen.getByRole('link', { name: '공지 문서' })).toHaveAttribute(
    'href',
    'https://example.com/notice',
  );
  expect(screen.getByRole('link', { name: '공지 문서' })).toHaveAttribute('target', '_blank');
  expect(screen.getByRole('link', { name: '공지 문서' })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  );

  fireEvent.error(screen.getByRole('img', { name: '행사 포스터' }));
  expect(screen.getByText('행사 포스터')).toBeVisible();
});
