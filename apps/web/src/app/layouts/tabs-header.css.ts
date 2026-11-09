import { vars } from '@seed-design/css/vars';
import { style } from '@vanilla-extract/css';

export const homeHeader = style({
  // 탭별 헤더 높이가 바뀌지 않도록 맞춥니다.
  height: '54px',
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
});

export const logoLink = style({
  display: 'inline-flex',
  alignItems: 'center',
});

export const bellButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: vars.$dimension.x6,
  height: vars.$dimension.x6,
  borderRadius: vars.$radius.full,
  color: vars.$color.fg.neutralSubtle,
});

export const defaultHeader = style({
  height: '54px',
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  boxSizing: 'border-box',
});

export const defaultTitle = style({
  letterSpacing: '-0.3px',
});

export const headerActionButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: vars.$dimension.x6,
  height: vars.$dimension.x6,
  borderRadius: vars.$radius.full,
  color: vars.$color.fg.neutralSubtle,
  textDecoration: 'none',
  padding: 0,
});
