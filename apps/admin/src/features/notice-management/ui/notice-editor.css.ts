import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const editorRoot = style({
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: 12,
  background: vars.$color.bg.layerFloating,
  color: vars.$color.fg.neutral,
  overflow: 'hidden',
});
export const toolbar = style({
  border: 0,
  margin: 0,
  minWidth: 0,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 3,
  padding: '5px 8px',
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  background: vars.$color.bg.layerFloating,
});
export const control = style({
  minHeight: 44,
  minWidth: 44,
  padding: '8px 12px',
  border: '1px solid transparent',
  borderRadius: 6,
  background: 'transparent',
  color: vars.$color.fg.neutral,
  fontSize: 16,
  cursor: 'pointer',
  selectors: {
    '&:hover': { background: vars.$color.bg.layerFloating },
    '&[aria-pressed="true"]': { background: '#e7ebff', color: '#3549a4' },
    '&:focus-visible': { outline: `2px solid ${vars.$color.fg.brand}`, outlineOffset: -2 },
    '&:disabled': { opacity: 0.35, cursor: 'default' },
  },
});
export const linkRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  padding: 12,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
});
globalStyle(`${editorRoot} .tiptap`, {
  minHeight: 320,
  padding: 24,
  outline: 'none',
  fontSize: 16,
  lineHeight: 1.7,
  overflowWrap: 'anywhere',
});
globalStyle(`${editorRoot} .tiptap:focus-visible`, {
  boxShadow: `inset 0 0 0 2px ${vars.$color.fg.brand}`,
});
globalStyle(`${editorRoot} .tiptap p`, { margin: '0 0 12px' });
globalStyle(`${editorRoot} .tiptap ul`, { listStyleType: 'disc', paddingLeft: 24 });
globalStyle(`${editorRoot} .tiptap ol`, { listStyleType: 'decimal', paddingLeft: 24 });
globalStyle(`${editorRoot} .tiptap pre`, {
  background: `color-mix(in srgb, ${vars.$color.fg.neutral} 8%, ${vars.$color.bg.layerFloating})`,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  fontFamily: 'ui-monospace, monospace',
  borderRadius: 8,
  padding: 16,
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

export const toolButton = style([
  control,
  {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    minWidth: 27,
    minHeight: 27,
    borderRadius: 5,
    fontSize: 11,
    color: vars.$color.fg.neutralMuted,
    '@media': { '(pointer: coarse)': { minWidth: 44, minHeight: 44 } },
  },
]);
export const separator = style({
  width: 1,
  height: 16,
  marginInline: 5,
  alignSelf: 'center',
  background: vars.$color.stroke.neutralMuted,
});

globalStyle(`${editorRoot} .tiptap blockquote`, {
  margin: '12px 0',
  paddingLeft: 16,
  borderLeft: `3px solid ${vars.$color.stroke.neutralMuted}`,
});
globalStyle(`${editorRoot} .tiptap hr`, {
  border: 0,
  borderTop: `1px solid ${vars.$color.stroke.neutralMuted}`,
  margin: '20px 0',
});
