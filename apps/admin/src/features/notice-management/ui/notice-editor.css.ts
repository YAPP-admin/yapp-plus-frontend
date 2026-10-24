/** 에디터 외곽과 Tiptap이 생성하는 본문 요소의 스타일이다. */
import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const editorRoot = style({
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: 12,
  background: vars.$color.bg.layerFloating,
  color: vars.$color.fg.neutral,
  overflow: 'hidden',
});

/** Tiptap이 생성하는 본문 요소에만 전역 선택자를 제한한다. */
globalStyle(`${editorRoot} .tiptap`, {
  minHeight: 320,
  padding: vars.$dimension.x6,
  outline: 'none',
  fontSize: 16,
  lineHeight: 1.7,
  overflowWrap: 'anywhere',
});

globalStyle(`${editorRoot} .tiptap:focus-visible`, {
  boxShadow: `inset 0 0 0 2px ${vars.$color.fg.brand}`,
});

globalStyle(`${editorRoot} .tiptap p`, { margin: `0 0 ${vars.$dimension.x3}` });

globalStyle(`${editorRoot} .tiptap ul`, { listStyleType: 'disc', paddingLeft: vars.$dimension.x6 });

globalStyle(`${editorRoot} .tiptap ol`, {
  listStyleType: 'decimal',
  paddingLeft: vars.$dimension.x6,
});

globalStyle(`${editorRoot} .tiptap pre`, {
  background: `color-mix(in srgb, ${vars.$color.fg.neutral} 8%, ${vars.$color.bg.layerFloating})`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  fontFamily: 'ui-monospace, monospace',
  borderRadius: 8,
  padding: vars.$dimension.x4,
  overflowX: 'auto',
});

globalStyle(`${editorRoot} .tiptap a`, {
  cursor: 'pointer',
  color: vars.$color.fg.brand,
  textDecoration: 'underline',
});

globalStyle(`${editorRoot} .tiptap p.is-editor-empty:first-child::before`, {
  content: 'attr(data-placeholder)',
  color: 'GrayText',
  float: 'left',
  height: 0,
  pointerEvents: 'none',
});

globalStyle(`${editorRoot} .tiptap code`, { fontFamily: 'ui-monospace, monospace' });

globalStyle(`${editorRoot} .tiptap :not(pre) > code`, {
  background: `color-mix(in srgb, ${vars.$color.fg.neutral} 10%, ${vars.$color.bg.layerFloating})`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: 4,
  padding: '2px 5px',
  fontSize: '0.9em',
});

globalStyle(`${editorRoot} .tiptap blockquote`, {
  margin: `${vars.$dimension.x3} 0`,
  paddingLeft: vars.$dimension.x4,
  borderLeft: `3px solid ${vars.$color.stroke.neutralMuted}`,
});

globalStyle(`${editorRoot} .tiptap hr`, {
  border: 0,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
  margin: `${vars.$dimension.x5} 0`,
});
