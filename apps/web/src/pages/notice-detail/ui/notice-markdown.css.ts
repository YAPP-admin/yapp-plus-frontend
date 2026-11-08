/** 공지 본문 Markdown의 읽기 전용 타이포그래피와 긴 콘텐츠 레이아웃을 정의한다. */
import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const content = style({
  color: vars.$color.fg.neutral,
  fontSize: vars.$fontSize.t4,
  fontWeight: vars.$fontWeight.medium,
  lineHeight: vars.$lineHeight.t4,
  overflowWrap: 'anywhere',
});

export const heading = style({
  color: vars.$color.fg.neutral,
  fontWeight: vars.$fontWeight.bold,
  margin: '28px 0 12px',
});

export const heading2 = style([
  heading,
  { fontSize: vars.$fontSize.t6, lineHeight: vars.$lineHeight.t6 },
]);

export const heading3 = style([
  heading,
  { fontSize: vars.$fontSize.t5, lineHeight: vars.$lineHeight.t5 },
]);

export const paragraph = style({ margin: '0 0 20px' });

export const list = style({ margin: '0 0 20px', paddingInlineStart: vars.$dimension.x6 });

export const quote = style({
  borderLeft: `3px solid ${vars.$color.stroke.neutralMuted}`,
  color: vars.$color.fg.neutralMuted,
  margin: '0 0 20px',
  paddingInlineStart: vars.$dimension.x3,
});

export const inlineCode = style({
  background: vars.$color.bg.neutralMuted,
  borderRadius: vars.$radius.r2,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  padding: '2px 4px',
});

export const codeBlock = style({
  background: vars.$color.bg.neutralMuted,
  borderRadius: vars.$radius.r3,
  margin: '0 0 20px',
  overflowX: 'auto',
  padding: vars.$dimension.x4,
});

export const link = style({
  color: vars.$color.fg.brand,
  textDecoration: 'underline',
  overflowWrap: 'anywhere',
});

export const image = style({
  borderRadius: vars.$radius.r3,
  display: 'block',
  height: 'auto',
  margin: '0 0 20px',
  maxWidth: '100%',
});

export const imageFallback = style({
  color: vars.$color.fg.neutralMuted,
  display: 'block',
  marginBottom: '20px',
});
