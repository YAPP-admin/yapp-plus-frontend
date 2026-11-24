/** 가입 심사 목록과 상세 패널의 화면 전용 스타일을 정의합니다. */
import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '@seed-design/css/vars';

export const page = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  width: 'min(100%, 75rem)',
  gap: vars.$dimension.x8,
  marginInline: 'auto',
  padding: `${vars.$dimension.x12} ${vars.$dimension.x6}`,
  '@media': {
    'screen and (max-width: 48rem)': {
      padding: `${vars.$dimension.x8} ${vars.$dimension.x4}`,
    },
  },
});

export const section = style({
  display: 'grid',
  gap: vars.$dimension.x3_5,
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: vars.$dimension.x4,
});

export const sectionTitle = style({
  display: 'grid',
  gap: vars.$dimension.x1_5,
  margin: 0,
});

export const sectionDescription = style({
  margin: 0,
  color: vars.$color.fg.neutralMuted,
});

export const tableRegion = style({
  overflowX: 'auto',
  maxWidth: '100%',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${vars.$color.fg.brand}`,
      outlineOffset: 2,
    },
  },
});

export const table = style({
  width: '100%',
  minWidth: '54rem',
  tableLayout: 'fixed',
  borderCollapse: 'separate',
  borderSpacing: '0 8px',
  textAlign: 'left',
  fontSize: vars.$fontSize.t2,
});

export const nameColumn = style({ width: '18rem' });
export const phoneColumn = style({ width: '14rem' });
export const dateColumn = style({ width: '12rem' });
export const statusColumn = style({ width: '10rem' });
export const actionColumn = style({ width: '9rem' });

export const visuallyHidden = style({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
});

export const loading = style({
  margin: 0,
  paddingBlock: vars.$dimension.x8,
  color: vars.$color.fg.neutralMuted,
});

export const error = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x4,
  margin: 0,
  padding: vars.$dimension.x4,
  borderRadius: vars.$radius.r3,
  background: vars.$color.bg.layerFloating,
  color: vars.$color.fg.critical,
});

export const loadMore = style({
  display: 'flex',
  justifyContent: 'center',
  paddingBlock: vars.$dimension.x2,
});

export const panel = style({
  width: 'min(100vw, 42rem)',
});

export const panelBody = style({
  display: 'grid',
  gap: vars.$dimension.x8,
  padding: vars.$dimension.x6,
});

export const panelSection = style({
  display: 'grid',
  gap: vars.$dimension.x3,
});

export const panelSectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
});

export const panelSectionTitle = style({
  margin: 0,
  fontSize: vars.$fontSize.t4,
  fontWeight: vars.$fontWeight.bold,
});

export const summary = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: vars.$dimension.x3,
  margin: 0,
});

export const summaryItem = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  padding: vars.$dimension.x3,
  borderRadius: vars.$radius.r2,
  background: vars.$color.bg.layerFloating,
});

export const summaryLabel = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
});

export const summaryValue = style({
  overflowWrap: 'anywhere',
  fontSize: vars.$fontSize.t2,
});

export const historyRegion = style({
  overflowX: 'auto',
});

export const historyTable = style({
  width: '100%',
  minWidth: '30rem',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: vars.$fontSize.t1,
});

export const candidateList = style({
  display: 'grid',
  gap: vars.$dimension.x2,
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const candidate = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.$dimension.x3,
  padding: vars.$dimension.x3,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r2,
});

export const candidateSelected = style({
  borderColor: vars.$color.stroke.brandWeak,
  background: vars.$color.bg.brandWeak,
});

export const candidateInfo = style({
  display: 'grid',
  gap: vars.$dimension.x1,
  minWidth: 0,
});

export const candidateMeta = style({
  color: vars.$color.fg.neutralMuted,
  fontSize: vars.$fontSize.t1,
  overflowWrap: 'anywhere',
});

export const form = style({
  display: 'grid',
  gap: vars.$dimension.x4,
  margin: 0,
});

export const formFields = style({
  display: 'grid',
  gap: vars.$dimension.x3,
  margin: 0,
  padding: 0,
  border: 0,
});

export const approvalTypes = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: vars.$dimension.x2,
  margin: 0,
  padding: 0,
  border: 0,
});

export const approvalType = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.$dimension.x2,
  minHeight: '2.75rem',
  paddingInline: vars.$dimension.x3,
  border: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderRadius: vars.$radius.r2,
  cursor: 'pointer',
});

export const feedback = style({
  margin: 0,
  color: vars.$color.fg.critical,
  fontSize: vars.$fontSize.t1,
});

export const formActions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: vars.$dimension.x2,
});

export const divider = style({
  height: 1,
  marginBlock: vars.$dimension.x1,
  background: vars.$color.stroke.neutralMuted,
});

globalStyle(`${table} thead th`, {
  padding: '8px 12px',
  color: vars.$color.fg.neutralMuted,
  fontWeight: vars.$fontWeight.regular,
});

globalStyle(`${table} tbody th, ${table} tbody td`, {
  height: 64,
  padding: '12px',
  background: vars.$color.bg.layerFloating,
  borderBlock: `1px solid ${vars.$color.stroke.neutralMuted}`,
  color: vars.$color.fg.neutralSubtle,
});

globalStyle(`${table} tr > :first-child`, {
  paddingLeft: 24,
  borderLeft: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderTopLeftRadius: 12,
  borderBottomLeftRadius: 12,
});

globalStyle(`${table} tbody td:last-child`, {
  borderRight: `1px solid ${vars.$color.stroke.neutralMuted}`,
  borderTopRightRadius: 12,
  borderBottomRightRadius: 12,
});

globalStyle(`${historyTable} th, ${historyTable} td`, {
  padding: `${vars.$dimension.x2} ${vars.$dimension.x1}`,
  borderBottom: `1px solid ${vars.$color.stroke.neutralMuted}`,
  verticalAlign: 'top',
});

globalStyle(`${historyTable} th`, {
  width: '7rem',
  color: vars.$color.fg.neutralMuted,
  fontWeight: vars.$fontWeight.regular,
});

globalStyle(`${approvalType}:has(input:checked)`, {
  borderColor: vars.$color.stroke.brandWeak,
  background: vars.$color.bg.brandWeak,
});
