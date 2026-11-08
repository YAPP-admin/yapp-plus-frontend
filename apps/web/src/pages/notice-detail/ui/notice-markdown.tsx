/** 서버 Markdown 본문을 읽기 전용 React 요소로 바꾸고 외부 URL 경계를 적용한다. */
import type { ComponentProps } from 'react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  codeBlock,
  content,
  heading2,
  heading3,
  image,
  imageFallback,
  inlineCode,
  link,
  list,
  paragraph,
  quote,
} from './notice-markdown.css';

type NoticeMarkdownProps = {
  content: string;
};

/** 신뢰하지 않는 본문을 HTML 없이 표시하고 HTTP(S) 외부 자원만 연결한다. */
export function NoticeMarkdown({ content: markdown }: NoticeMarkdownProps) {
  return (
    <div className={content}>
      <ReactMarkdown skipHtml components={markdownComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

function NoticeMarkdownLink({ href, children }: ComponentProps<'a'>) {
  if (!isSafeHttpUrl(href)) {
    return <span>{children}</span>;
  }

  return (
    <a className={link} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function NoticeMarkdownImage({ src, alt }: ComponentProps<'img'>) {
  const [failed, setFailed] = useState(!isSafeHttpUrl(src));

  if (failed) {
    return <span className={imageFallback}>{alt ?? '이미지를 표시할 수 없어요.'}</span>;
  }

  return <img className={image} src={src} alt={alt} onError={() => setFailed(true)} />;
}

const markdownComponents = {
  h1: MarkdownHeading2,
  h2: MarkdownHeading3,
  p: MarkdownParagraph,
  ul: MarkdownList,
  ol: MarkdownOrderedList,
  blockquote: MarkdownQuote,
  pre: MarkdownPre,
  code: MarkdownCode,
  a: NoticeMarkdownLink,
  img: NoticeMarkdownImage,
};

function MarkdownHeading2({ children }: ComponentProps<'h1'>) {
  return <h2 className={heading2}>{children}</h2>;
}

function MarkdownHeading3({ children }: ComponentProps<'h2'>) {
  return <h3 className={heading3}>{children}</h3>;
}

function MarkdownParagraph({ children }: ComponentProps<'p'>) {
  return <p className={paragraph}>{children}</p>;
}

function MarkdownList({ children }: ComponentProps<'ul'>) {
  return <ul className={list}>{children}</ul>;
}

function MarkdownOrderedList({ children }: ComponentProps<'ol'>) {
  return <ol className={list}>{children}</ol>;
}

function MarkdownQuote({ children }: ComponentProps<'blockquote'>) {
  return <blockquote className={quote}>{children}</blockquote>;
}

function MarkdownPre({ children }: ComponentProps<'pre'>) {
  return <pre className={codeBlock}>{children}</pre>;
}

function MarkdownCode({ children }: ComponentProps<'code'>) {
  return <code className={inlineCode}>{children}</code>;
}

function isSafeHttpUrl(value: string | undefined) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
